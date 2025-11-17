const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  coverLetter: {
    type: String,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  recruiterNotes: {
    type: String,
    maxlength: 1000
  },
  interviewDate: Date,
  interviewNotes: String,
  salaryOffered: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  aiAnalysis: {
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    matchingSkills: [String],
    missingSkills: [String],
    strengths: [String],
    concerns: [String],
    recommendation: {
      type: String,
      enum: ['strong_match', 'good_match', 'partial_match', 'poor_match']
    }
  },
  starred: {
    type: Boolean,
    default: false
  },
  timeline: [{
    action: {
      type: String,
      enum: ['applied', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected', 'note_added']
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance and production optimization
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ status: 1, appliedAt: -1 });
applicationSchema.index({ starred: 1 });
applicationSchema.index({ lastUpdated: -1 });

// Compound indexes for complex queries
applicationSchema.index({ job: 1, status: 1, appliedAt: -1 });
applicationSchema.index({ applicant: 1, status: 1, appliedAt: -1 });
applicationSchema.index({ status: 1, starred: 1, appliedAt: -1 });

// Virtual for days since application
applicationSchema.virtual('daysSinceApplication').get(function() {
  const now = new Date();
  const applied = new Date(this.appliedAt);
  const diffTime = Math.abs(now - applied);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to add timeline entry
applicationSchema.methods.addTimelineEntry = function(action, note = '', performedBy = null) {
  this.timeline.push({
    action,
    note,
    performedBy,
    date: new Date()
  });
  this.lastUpdated = new Date();
  return this.save();
};

// Method to update status with timeline
applicationSchema.methods.updateStatus = function(newStatus, note = '', performedBy = null) {
  const oldStatus = this.status;
  this.status = newStatus;
  this.lastUpdated = new Date();
  
  // Add timeline entry
  this.timeline.push({
    action: newStatus,
    note: note || `Status changed from ${oldStatus} to ${newStatus}`,
    performedBy,
    date: new Date()
  });
  
  return this.save();
};

// Static method to get applications for a job
applicationSchema.statics.getJobApplications = function(jobId, filters = {}) {
  const query = { job: jobId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.starred !== undefined) {
    query.starred = filters.starred;
  }
  
  return this.find(query)
    .populate('applicant', 'firstName lastName email profile')
    .populate('resume', 'originalName analysis')
    .sort({ appliedAt: -1 });
};

// Static method to get applications for a user
applicationSchema.statics.getUserApplications = function(userId, filters = {}) {
  const query = { applicant: userId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  return this.find(query)
    .populate('job', 'title company employmentType workMode salary')
    .populate('resume', 'originalName')
    .sort({ appliedAt: -1 });
};

// Static method to check if user already applied
applicationSchema.statics.hasUserApplied = function(userId, jobId) {
  return this.findOne({ applicant: userId, job: jobId });
};

// Static method to get application statistics
applicationSchema.statics.getApplicationStats = function(filters = {}) {
  const pipeline = [];
  
  // Match stage
  if (filters.job) {
    pipeline.push({ $match: { job: mongoose.Types.ObjectId(filters.job) } });
  }
  if (filters.recruiter) {
    // Need to lookup job and match recruiter
    pipeline.push({
      $lookup: {
        from: 'jobs',
        localField: 'job',
        foreignField: '_id',
        as: 'jobDetails'
      }
    });
    pipeline.push({
      $match: { 'jobDetails.postedBy': mongoose.Types.ObjectId(filters.recruiter) }
    });
  }
  
  // Group by status
  pipeline.push({
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      avgMatchScore: { $avg: '$aiAnalysis.matchScore' }
    }
  });
  
  return this.aggregate(pipeline);
};

// Pre-save middleware to update lastUpdated
applicationSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }
  next();
});

// Pre-save middleware to add initial timeline entry
applicationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timeline.push({
      action: 'applied',
      note: 'Application submitted',
      date: this.appliedAt
    });
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
