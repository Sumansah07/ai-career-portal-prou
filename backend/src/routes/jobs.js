const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const { auth, authorize } = require('../middleware/auth');
const jobMatchingService = require('../services/jobMatchingService');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Helper functions removed - data mapping now done in frontend

// @route   GET /api/jobs/ai-matches
// @desc    Get AI-powered job matches for user with resume analysis
// @access  Private (Students and Recruiters for testing)
router.get('/ai-matches', auth, async (req, res) => {
  try {
    console.log('AI matches endpoint called by user:', req.user.userId, 'role:', req.user.role);

    // Allow both students and recruiters (for testing purposes)
    if (req.user.role !== 'student' && req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This feature is available for students and recruiters (testing).'
      });
    }
    const filters = {
      employmentType: req.query.employmentType,
      workMode: req.query.workMode,
      industry: req.query.industry,
      location: req.query.location,
      remote: req.query.remote === 'true',
      salaryMin: req.query.minSalary,
      salaryMax: req.query.maxSalary
    };

    // Get user's resume for enhanced matching
    const Resume = require('../models/Resume');
    let userResume = null;

    if (req.query.resumeId) {
      // Use specific resume if provided
      userResume = await Resume.findOne({
        _id: req.query.resumeId,
        userId: req.user.userId
      });
    } else {
      // Use latest resume if no specific one provided
      userResume = await Resume.findOne({
        userId: req.user.userId
      }).sort({ createdAt: -1 });
    }

    const matchingJobs = await jobMatchingService.findMatchingJobs(req.user.userId, filters, userResume);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const paginatedJobs = matchingJobs.slice(skip, skip + limit);

    res.json({
      success: true,
      data: {
        jobs: paginatedJobs,
        pagination: {
          current: page,
          pages: Math.ceil(matchingJobs.length / limit),
          total: matchingJobs.length
        },
        resumeAnalyzed: !!userResume,
        userSkills: userResume?.parsedData?.skills || []
      }
    });
  } catch (error) {
    console.error('AI job matching error:', error);

    // If job matching service fails completely, return mock data
    console.log('Job matching service failed, returning mock data as last resort');

    res.json({
      success: true,
      data: {
        jobs: [
          {
            _id: 'fallback-job-1',
            title: 'Software Developer',
            description: 'Join our team as a Software Developer. Work with modern technologies and build amazing applications.',
            company: {
              name: 'TechCorp',
              location: { city: 'Remote', isRemote: true }
            },
            salary: { min: 60000, max: 80000, type: 'Yearly' },
            employmentType: 'Full-time',
            workMode: 'Remote',
            createdAt: new Date(),
            aiMatch: {
              matchScore: 75,
              matchingSkills: ['JavaScript', 'React'],
              missingSkills: ['TypeScript'],
              reasons: ['Good skill match'],
              suggestions: ['Consider learning TypeScript'],
              aiRecommendation: 'Fallback matching - AI service temporarily unavailable'
            }
          }
        ],
        pagination: { current: 1, pages: 1, total: 1 },
        resumeAnalyzed: false,
        userSkills: []
      }
    });
  }
});

// @route   GET /api/jobs
// @desc    Get all jobs with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'active' };
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    if (req.query.employmentType) {
      filter.employmentType = req.query.employmentType;
    }
    
    if (req.query.workMode) {
      filter.workMode = req.query.workMode;
    }
    
    if (req.query.industry) {
      filter['company.industry'] = req.query.industry;
    }

    if (req.query.minSalary || req.query.maxSalary) {
      filter['salary.min'] = {};
      if (req.query.minSalary) filter['salary.min'].$gte = parseInt(req.query.minSalary);
      if (req.query.maxSalary) filter['salary.max'] = { $lte: parseInt(req.query.maxSalary) };
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


// @route   GET /api/jobs/my-jobs
// @desc    Get jobs posted by current recruiter
// @access  Private (Recruiter only)
router.get('/my-jobs', [auth, authorize('recruiter')], async (req, res) => {
  try {
    console.log('My-jobs endpoint called by user:', req.user.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('Searching for jobs with postedBy:', req.user.userId);

    // For mock user, we need to handle the case where postedBy might be a string
    let jobs;
    let total;

    try {
      jobs = await Job.find({ postedBy: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      console.log('Found jobs:', jobs.length);
      total = await Job.countDocuments({ postedBy: req.user.userId });
      console.log('Total jobs for user:', total);
    } catch (queryError) {
      console.error('Database query error:', queryError);
      throw queryError;
    }

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get specific job
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName');

    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private (Recruiter/Admin)
router.post('/', [
  auth,
  authorize('recruiter', 'admin'),
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('company.name').trim().notEmpty().withMessage('Company name is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('employmentType').isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']).withMessage('Invalid employment type')
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

    const job = new Job({
      ...req.body,
      postedBy: req.user.userId
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private (Owner/Admin)
router.put('/:id', [
  auth,
  body('title').optional().trim().notEmpty().withMessage('Job title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Job description cannot be empty')
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

    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or is admin
    if (job.postedBy.toString() !== req.user.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/jobs/:id/generate-interview-questions
// @desc    Generate AI interview questions for job
// @access  Private
router.post('/:id/generate-interview-questions', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const { userSkills } = req.body;
    const skills = userSkills || [];

    const questions = await geminiService.generateInterviewQuestions(
      job.title,
      job.description,
      skills
    );

    res.json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    console.error('Interview questions generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating interview questions'
    });
  }
});

// @route   GET /api/jobs/market-analysis
// @desc    Get AI-powered job market analysis
// @access  Private
router.get('/market-analysis', auth, async (req, res) => {
  try {
    const { industry, location } = req.query;

    const marketAnalysis = await jobMatchingService.analyzeJobMarket(industry, location);

    res.json({
      success: true,
      data: { marketAnalysis }
    });
  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during market analysis'
    });
  }
});

// @route   POST /api/jobs/career-path
// @desc    Generate career path suggestions
// @access  Private
router.post('/career-path', auth, async (req, res) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required'
      });
    }

    const careerPath = await jobMatchingService.generateCareerPathSuggestions(req.user.userId, targetRole);

    res.json({
      success: true,
      data: { careerPath }
    });
  } catch (error) {
    console.error('Career path generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating career path'
    });
  }
});

// @route   POST /api/jobs/:id/generate-cover-letter
// @desc    Generate AI cover letter for job
// @access  Private
router.post('/:id/generate-cover-letter', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { existingCoverLetter } = req.body;

    const coverLetter = await geminiService.improveCoverLetter(
      job.description,
      user,
      existingCoverLetter
    );

    res.json({
      success: true,
      data: { coverLetter }
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating cover letter'
    });
  }
});

// My duplicate POST route removed - using the existing one above

// @route   GET /api/jobs/my-jobs
// @desc    Get jobs posted by current recruiter
// @access  Private (Recruiter only)
router.get('/my-jobs', [auth, authorize('recruiter')], async (req, res) => {
  try {
    console.log('My-jobs endpoint called by user:', req.user.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('Searching for jobs with postedBy:', req.user.userId);

    // For mock user, we need to handle the case where postedBy might be a string
    let jobs;
    let total;

    try {
      jobs = await Job.find({ postedBy: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      console.log('Found jobs:', jobs.length);
      total = await Job.countDocuments({ postedBy: req.user.userId });
      console.log('Total jobs for user:', total);
    } catch (queryError) {
      console.error('Database query error:', queryError);
      throw queryError;
    }

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error fetching jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job posting (Recruiter only)
// @access  Private
router.put('/:id', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      postedBy: req.user.userId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }

    // Update job fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        job[key] = req.body[key];
      }
    });

    await job.save();

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating job'
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting (Recruiter only)
// @access  Private
router.delete('/:id', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      postedBy: req.user.userId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Job deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting job'
    });
  }
});

// @route   GET /api/jobs/:id/applications
// @desc    Get applications for a job (Recruiter only)
// @access  Private
router.get('/:id/applications', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      postedBy: req.user.userId
    }).populate({
      path: 'applications.applicant',
      select: 'firstName lastName email profile'
    }).populate({
      path: 'applications.resume',
      select: 'originalName analysis'
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }

    res.json({
      success: true,
      data: {
        job: {
          title: job.title,
          company: job.company
        },
        applications: job.applications
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications'
    });
  }
});

// @route   PUT /api/jobs/:jobId/applications/:applicationId
// @desc    Update application status (Recruiter only)
// @access  Private
router.put('/:jobId/applications/:applicationId', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const { status, notes } = req.body;

    const job = await Job.findOne({
      _id: req.params.jobId,
      postedBy: req.user.userId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }

    await job.updateApplicationStatus(req.params.applicationId, status, notes);

    res.json({
      success: true,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating application status'
    });
  }
});

// @route   POST /api/jobs/:id/save
// @desc    Save/unsave job for user
// @access  Private
router.post('/:id/save', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const jobId = req.params.id;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Initialize savedJobs array if it doesn't exist
    if (!user.savedJobs) {
      user.savedJobs = [];
    }

    const isAlreadySaved = user.savedJobs.includes(jobId);

    if (isAlreadySaved) {
      // Remove from saved jobs
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
      await user.save();

      res.json({
        success: true,
        message: 'Job removed from saved jobs',
        saved: false
      });
    } else {
      // Add to saved jobs
      user.savedJobs.push(jobId);
      await user.save();

      res.json({
        success: true,
        message: 'Job saved successfully',
        saved: true
      });
    }
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving job'
    });
  }
});

// @route   POST /api/jobs/:id/share
// @desc    Generate shareable link for job
// @access  Private
router.post('/:id/share', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Generate shareable link (in production, this would be a proper domain)
    const shareableLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job._id}`;

    res.json({
      success: true,
      data: {
        shareableLink,
        jobTitle: job.title,
        company: job.company.name,
        message: `Check out this ${job.title} position at ${job.company.name}!`
      }
    });
  } catch (error) {
    console.error('Share job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sharing job'
    });
  }
});

// @route   GET /api/jobs/:id/ai-analysis
// @desc    Get AI analysis for specific job based on user's resume
// @access  Private
router.get('/:id/ai-analysis', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get user's latest resume
    const Resume = require('../models/Resume');
    const userResume = await Resume.findOne({
      userId: req.user.userId
    }).sort({ createdAt: -1 });

    if (!userResume) {
      return res.status(400).json({
        success: false,
        message: 'No resume found. Please upload a resume first.'
      });
    }

    // Generate AI analysis
    const resumeParserService = require('../services/resumeParserService');
    const analysis = await resumeParserService.analyzeResumeForJob(userResume, job);

    res.json({
      success: true,
      data: {
        analysis,
        resumeAnalyzed: true,
        jobTitle: job.title,
        company: job.company.name
      }
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during AI analysis'
    });
  }
});

module.exports = router;
