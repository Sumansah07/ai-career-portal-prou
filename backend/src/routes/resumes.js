const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Resume = require('../models/Resume');
const { auth } = require('../middleware/auth');
const resumeParserService = require('../services/resumeParserService');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/resumes/upload
// @desc    Upload and analyze resume
// @access  Private
router.post('/upload', [auth, upload.single('resume')], async (req, res) => {
  try {
    console.log('Resume upload started:', {
      userId: req.user.userId,
      file: req.file ? {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : 'No file'
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create resume record
    const resumeData = {
      userId: req.user.userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
      filePath: req.file.path,
      extractedText: 'Processing...', // Temporary placeholder
      processingStatus: 'processing'
    };

    console.log('Creating resume with data:', resumeData);

    const resume = new Resume(resumeData);
    await resume.save();

    console.log('Resume saved successfully:', resume._id);

    // Process resume with Gemini AI in background
    setImmediate(async () => {
      try {
        const fileType = path.extname(req.file.originalname).substring(1);
        const processingResult = await resumeParserService.parseResumeFile(req.file.path, fileType);

        // Update resume with processed data
        console.log('Processing result:', {
          hasExtractedText: !!processingResult.extractedText,
          hasParsedData: !!processingResult.parsedData,
          hasAnalysis: !!processingResult.analysis,
          parsedDataType: typeof processingResult.parsedData,
          analysisType: typeof processingResult.analysis
        });

        resume.extractedText = processingResult.extractedText || 'Text extraction completed';
        resume.parsedData = processingResult.parsedData || {};
        resume.analysis = processingResult.analysis || {};
        resume.processingStatus = 'completed';
        resume.lastAnalyzed = new Date();

        await resume.save();
        console.log(`Resume ${resume._id} processed successfully`);

        // Clean up the uploaded file
        await resumeParserService.cleanupFile(req.file.path);
      } catch (error) {
        console.error('Resume processing error:', error);

        // Update resume with error status
        try {
          resume.extractedText = 'Processing failed - please try again';
          resume.processingStatus = 'failed';
          resume.processingError = error.message;
          await resume.save();
        } catch (saveError) {
          console.error('Failed to save error status:', saveError);
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully. AI analysis is in progress.',
      data: { resume }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error during resume upload',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/resumes
// @desc    Get user's resumes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ 
      userId: req.user.userId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { resumes }
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/resumes/:id
// @desc    Get specific resume details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isActive: true
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Soft delete
    resume.isActive = false;
    await resume.save();

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/resumes/:id/analyze-job-match
// @desc    Analyze resume match with specific job
// @access  Private
router.post('/:id/analyze-job-match', auth, async (req, res) => {
  try {
    const { jobData } = req.body;

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isActive: true
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (resume.processingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Resume is still being processed'
      });
    }

    const jobMatch = await resumeParserService.analyzeResumeForJob(resume, jobData);

    res.json({
      success: true,
      data: { jobMatch }
    });
  } catch (error) {
    console.error('Job match analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during job match analysis'
    });
  }
});

// @route   GET /api/resumes/:id/improvement-suggestions
// @desc    Get AI-powered improvement suggestions
// @access  Private
router.get('/:id/improvement-suggestions', auth, async (req, res) => {
  try {
    const { targetRole } = req.query;

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isActive: true
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const suggestions = await resumeParserService.generateImprovementSuggestions(resume, targetRole);

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Improvement suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating suggestions'
    });
  }
});

module.exports = router;
