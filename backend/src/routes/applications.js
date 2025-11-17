const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const geminiService = require('../services/geminiService');

const router = express.Router();

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Student)
router.post('/', [
  auth,
  authorize('student'),
  [
    body('jobId').isMongoId().withMessage('Valid job ID is required'),
    body('resumeId').optional().isMongoId().withMessage('Valid resume ID is required'),
    body('coverLetter').optional().isLength({ max: 2000 }).withMessage('Cover letter must be less than 2000 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { jobId, resumeId, coverLetter } = req.body;
    const userId = req.user.userId;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not active'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.hasUserApplied(userId, jobId);
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Get user's resume if not provided
    let resume = null;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId });
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
    } else {
      // Get user's most recent resume
      resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    }

    // Create application
    const applicationData = {
      applicant: userId,
      job: jobId,
      resume: resume?._id,
      coverLetter,
      status: 'pending'
    };

    // Generate AI analysis if resume exists
    if (resume && resume.analysis) {
      try {
        const jobSkills = job.requirements?.skills?.map(s => s.name) || [];
        const resumeSkills = resume.parsedData?.skills?.map(s => s.name) || [];
        
        const matchingSkills = resumeSkills.filter(skill => 
          jobSkills.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        );
        
        const missingSkills = jobSkills.filter(skill => 
          !resumeSkills.some(resumeSkill => 
            resumeSkill.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(resumeSkill.toLowerCase())
          )
        );

        const matchScore = jobSkills.length > 0 ? 
          Math.round((matchingSkills.length / jobSkills.length) * 100) : 75;

        applicationData.aiAnalysis = {
          matchScore,
          matchingSkills,
          missingSkills,
          strengths: resume.analysis.strengths?.slice(0, 3) || [],
          concerns: missingSkills.length > 0 ? [`Missing ${missingSkills.length} required skills`] : [],
          recommendation: matchScore >= 80 ? 'strong_match' : 
                        matchScore >= 60 ? 'good_match' : 
                        matchScore >= 40 ? 'partial_match' : 'poor_match'
        };
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        // Continue without AI analysis
      }
    }

    const application = new Application(applicationData);
    await application.save();

    // Populate the response
    await application.populate('job', 'title company');
    await application.populate('resume', 'originalName');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting application'
    });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get user's applications
// @access  Private (Student)
router.get('/my-applications', [auth, authorize('student')], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (status && status !== 'all') {
      filters.status = status;
    }

    const applications = await Application.getUserApplications(req.user.userId, filters)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments({ 
      applicant: req.user.userId,
      ...filters 
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications'
    });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a job (Recruiter only)
// @access  Private (Recruiter)
router.get('/job/:jobId', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const { status, starred, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user.userId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }

    const filters = {};
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (starred !== undefined) {
      filters.starred = starred === 'true';
    }

    const applications = await Application.getJobApplications(req.params.jobId, filters)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments({ 
      job: req.params.jobId,
      ...filters 
    });

    res.json({
      success: true,
      data: {
        job: {
          title: job.title,
          company: job.company
        },
        applications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications'
    });
  }
});

// @route   GET /api/applications/recruiter
// @desc    Get all applications for recruiter's jobs
// @access  Private (Recruiter)
router.get('/recruiter', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get recruiter's jobs
    const jobs = await Job.find({ postedBy: req.user.userId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    const query = { job: { $in: jobIds } };
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('applicant', 'firstName lastName email profile')
      .populate('job', 'title company')
      .populate('resume', 'originalName analysis')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get recruiter applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications'
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (Recruiter only)
// @access  Private (Recruiter)
router.put('/:id/status', [
  auth,
  authorize('recruiter'),
  [
    body('status').isIn(['pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected'])
      .withMessage('Invalid status'),
    body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, notes } = req.body;

    // Find application and verify job belongs to recruiter
    const application = await Application.findById(req.params.id)
      .populate('job', 'postedBy');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this application'
      });
    }

    // Update status with timeline
    await application.updateStatus(status, notes, req.user.userId);

    if (notes) {
      application.recruiterNotes = notes;
      await application.save();
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating application status'
    });
  }
});

// @route   PUT /api/applications/:id/star
// @desc    Toggle star status (Recruiter only)
// @access  Private (Recruiter)
router.put('/:id/star', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'postedBy');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this application'
      });
    }

    application.starred = !application.starred;
    await application.save();

    res.json({
      success: true,
      message: `Application ${application.starred ? 'starred' : 'unstarred'} successfully`,
      data: { starred: application.starred }
    });
  } catch (error) {
    console.error('Toggle star error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating star status'
    });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Withdraw application (Student only)
// @access  Private (Student)
router.delete('/:id', [auth, authorize('student')], async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicant: req.user.userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Only allow withdrawal if not hired or in final stages
    if (['hired', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application in current status'
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error withdrawing application'
    });
  }
});

module.exports = router;
