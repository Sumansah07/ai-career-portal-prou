const express = require('express');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/dashboard', [auth, authorize('admin')], async (req, res) => {
  try {
    const [
      totalUsers,
      totalResumes,
      totalJobs,
      activeJobs,
      recentUsers,
      topSkills
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Resume.countDocuments({ isActive: true }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      User.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        isActive: true 
      }),
      getTopSkills()
    ]);

    const stats = {
      users: {
        total: totalUsers,
        recent: recentUsers
      },
      resumes: {
        total: totalResumes
      },
      jobs: {
        total: totalJobs,
        active: activeJobs
      },
      topSkills
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/analytics/user-stats
// @desc    Get user-specific analytics
// @access  Private
router.get('/user-stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [
      userResumes,
      resumeAnalytics,
      jobMatches
    ] = await Promise.all([
      Resume.countDocuments({ userId, isActive: true }),
      Resume.find({ userId, isActive: true }).select('analysis'),
      getJobMatchesForUser(userId)
    ]);

    const averageScore = resumeAnalytics.length > 0 
      ? resumeAnalytics.reduce((sum, resume) => sum + (resume.analysis?.overallScore || 0), 0) / resumeAnalytics.length
      : 0;

    const stats = {
      resumes: {
        total: userResumes,
        averageScore: Math.round(averageScore)
      },
      jobMatches: {
        total: jobMatches.length,
        highMatches: jobMatches.filter(match => match.score >= 80).length,
        mediumMatches: jobMatches.filter(match => match.score >= 60 && match.score < 80).length,
        lowMatches: jobMatches.filter(match => match.score < 60).length
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to get top skills
async function getTopSkills() {
  try {
    const skillsAggregation = await User.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { skill: '$_id', count: 1, _id: 0 } }
    ]);

    return skillsAggregation;
  } catch (error) {
    console.error('Error getting top skills:', error);
    return [];
  }
}

// Helper function to get job matches for user
async function getJobMatchesForUser(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const jobs = await Job.find({ status: 'active' }).limit(50);
    
    const matches = jobs.map(job => ({
      jobId: job._id,
      title: job.title,
      company: job.company.name,
      score: job.calculateUserMatch(user.skills, user.preferences)
    }));

    return matches.filter(match => match.score > 0).sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error getting job matches:', error);
    return [];
  }
}

// @route   GET /api/analytics/recruiter-dashboard
// @desc    Get recruiter dashboard analytics
// @access  Private (Recruiter only)
router.get('/recruiter-dashboard', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const Job = require('../models/Job');
    const User = require('../models/User');

    // Get recruiter's jobs
    const jobs = await Job.find({ postedBy: req.user.userId });
    const jobIds = jobs.map(job => job._id);

    // Calculate stats
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = jobs.reduce((sum, job) => sum + job.applications.length, 0);
    const totalViews = jobs.reduce((sum, job) => sum + job.views, 0);

    // Application status breakdown
    const applicationsByStatus = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      interviewed: 0,
      hired: 0,
      rejected: 0
    };

    jobs.forEach(job => {
      job.applications.forEach(app => {
        applicationsByStatus[app.status]++;
      });
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentJobs = jobs.filter(job => job.createdAt >= thirtyDaysAgo);
    const recentApplications = [];

    jobs.forEach(job => {
      job.applications.forEach(app => {
        if (app.appliedAt >= thirtyDaysAgo) {
          recentApplications.push({
            jobTitle: job.title,
            applicantId: app.applicant,
            appliedAt: app.appliedAt,
            status: app.status
          });
        }
      });
    });

    // Top performing jobs
    const topJobs = jobs
      .sort((a, b) => b.applications.length - a.applications.length)
      .slice(0, 5)
      .map(job => ({
        title: job.title,
        applications: job.applications.length,
        views: job.views,
        status: job.status
      }));

    // Monthly trends (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthJobs = jobs.filter(job =>
        job.createdAt >= monthStart && job.createdAt <= monthEnd
      );

      const monthApplications = [];
      jobs.forEach(job => {
        job.applications.forEach(app => {
          if (app.appliedAt >= monthStart && app.appliedAt <= monthEnd) {
            monthApplications.push(app);
          }
        });
      });

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        jobs: monthJobs.length,
        applications: monthApplications.length,
        hires: monthApplications.filter(app => app.status === 'hired').length
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          totalApplications,
          totalViews,
          averageApplicationsPerJob: totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0,
          hireRate: totalApplications > 0 ? Math.round((applicationsByStatus.hired / totalApplications) * 100) : 0
        },
        applicationsByStatus,
        topJobs,
        monthlyData,
        recentActivity: {
          newJobs: recentJobs.length,
          newApplications: recentApplications.length,
          recentApplications: recentApplications.slice(0, 10)
        }
      }
    });
  } catch (error) {
    console.error('Recruiter analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics'
    });
  }
});

// @route   GET /api/analytics/job-performance/:jobId
// @desc    Get detailed analytics for a specific job
// @access  Private (Recruiter only)
router.get('/job-performance/:jobId', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const Job = require('../models/Job');

    const job = await Job.findOne({
      _id: req.params.jobId,
      postedBy: req.user.userId
    }).populate({
      path: 'applications.applicant',
      select: 'firstName lastName profile'
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }

    // Application timeline
    const applicationTimeline = job.applications.map(app => ({
      date: app.appliedAt,
      applicant: `${app.applicant.firstName} ${app.applicant.lastName}`,
      status: app.status
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Skills analysis
    const skillsRequested = job.requirements.skills.map(s => s.name);
    const applicantSkills = {};

    job.applications.forEach(app => {
      if (app.aiMatch && app.aiMatch.matchingSkills) {
        app.aiMatch.matchingSkills.forEach(skill => {
          applicantSkills[skill] = (applicantSkills[skill] || 0) + 1;
        });
      }
    });

    res.json({
      success: true,
      data: {
        job: {
          title: job.title,
          company: job.company,
          postedDate: job.createdAt,
          status: job.status,
          views: job.views,
          applicationCount: job.applications.length
        },
        applicationTimeline,
        skillsAnalysis: {
          requested: skillsRequested,
          applicantSkills: Object.entries(applicantSkills).map(([skill, count]) => ({
            skill,
            count,
            percentage: Math.round((count / job.applications.length) * 100)
          }))
        },
        conversionMetrics: {
          viewToApplication: job.views > 0 ? Math.round((job.applications.length / job.views) * 100) : 0,
          applicationToInterview: job.applications.length > 0 ?
            Math.round((job.applications.filter(app => app.status === 'interviewed').length / job.applications.length) * 100) : 0,
          interviewToHire: job.applications.filter(app => app.status === 'interviewed').length > 0 ?
            Math.round((job.applications.filter(app => app.status === 'hired').length /
            job.applications.filter(app => app.status === 'interviewed').length) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error('Job performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching job analytics'
    });
  }
});

module.exports = router;
