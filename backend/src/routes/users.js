const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('profile.phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number'),
  body('profile.bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
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

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'firstName', 'lastName', 'profile', 'skills', 'preferences'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'profile' && user.profile) {
          user.profile = { ...user.profile.toObject(), ...req.body.profile };
        } else {
          user[field] = req.body[field];
        }
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/candidates
// @desc    Get all candidates (students) for recruiters
// @access  Private/Recruiter
router.get('/candidates', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, skills, location, experience } = req.query;

    console.log('Fetching candidates for recruiter:', req.user.userId);

    // Build query for students only
    let query = {
      role: 'student',
      isActive: true
    };

    // Add search filters
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'skills.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query['skills.name'] = { $in: skillsArray };
    }

    if (location) {
      query.$or = query.$or || [];
      query.$or.push(
        { 'profile.location.city': { $regex: location, $options: 'i' } },
        { 'profile.location.state': { $regex: location, $options: 'i' } },
        { 'profile.location.country': { $regex: location, $options: 'i' } }
      );
    }

    const candidates = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Get application data for each candidate
    const Application = require('../models/Application');
    const candidatesWithApplications = await Promise.all(
      candidates.map(async (candidate) => {
        const applications = await Application.find({ applicant: candidate._id })
          .populate('job', 'title company')
          .populate('resume', 'originalName analysis')
          .sort({ appliedAt: -1 })
          .limit(5);

        return {
          id: candidate._id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          profile: candidate.profile,
          skills: candidate.skills,
          experience: candidate.experience,
          education: candidate.education,
          preferences: candidate.preferences,
          applications: applications,
          createdAt: candidate.createdAt,
          lastLogin: candidate.lastLogin
        };
      })
    );

    console.log(`Found ${candidatesWithApplications.length} candidates`);

    res.json({
      success: true,
      data: {
        candidates: candidatesWithApplications,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', [auth, authorize('admin')], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
