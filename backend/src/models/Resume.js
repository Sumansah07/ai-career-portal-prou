const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'doc', 'docx']
  },
  filePath: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  parsedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  jobMatches: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  feedback: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: String,
  lastAnalyzed: Date
}, {
  timestamps: true
});

// Indexes for better query performance
resumeSchema.index({ userId: 1 });
resumeSchema.index({ 'analysis.overallScore': -1 });
resumeSchema.index({ 'parsedData.skills.name': 1 });
resumeSchema.index({ processingStatus: 1 });

// Virtual for file URL
resumeSchema.virtual('fileUrl').get(function() {
  return `/api/resumes/${this._id}/download`;
});

// Method to calculate match score with a job
resumeSchema.methods.calculateJobMatch = function(jobSkills) {
  try {
    const resumeSkills = this.parsedData?.skills?.map(skill =>
      typeof skill === 'string' ? skill.toLowerCase() : skill.name?.toLowerCase()
    ).filter(Boolean) || [];

    const requiredSkills = jobSkills.map(skill => skill.toLowerCase());

    const matchingSkills = resumeSkills.filter(skill =>
      requiredSkills.some(reqSkill => reqSkill.includes(skill) || skill.includes(reqSkill))
    );

    const matchScore = requiredSkills.length > 0 ?
      (matchingSkills.length / requiredSkills.length) * 100 : 0;
    return Math.round(matchScore);
  } catch (error) {
    console.error('Error calculating job match:', error);
    return 0;
  }
};

module.exports = mongoose.model('Resume', resumeSchema);
