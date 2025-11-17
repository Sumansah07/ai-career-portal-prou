const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    logo: String,
    website: String,
    description: String,
    size: {
      type: String,
      enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise']
    },
    industry: String,
    location: {
      city: String,
      state: String,
      country: String,
      isRemote: {
        type: Boolean,
        default: false
      }
    }
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: {
    education: {
      level: {
        type: String,
        enum: ['High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'Not Specified']
      },
      field: String
    },
    experience: {
      min: {
        type: Number,
        default: 0
      },
      max: Number,
      level: {
        type: String,
        enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive']
      }
    },
    skills: [{
      name: {
        type: String,
        required: true
      },
      level: {
        type: String,
        enum: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Basic'
      },
      isRequired: {
        type: Boolean,
        default: true
      },
      category: String
    }],
    languages: [{
      name: String,
      proficiency: {
        type: String,
        enum: ['Basic', 'Conversational', 'Fluent', 'Native']
      }
    }],
    certifications: [String]
  },
  responsibilities: [String],
  benefits: [String],
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    type: {
      type: String,
      enum: ['Hourly', 'Monthly', 'Yearly'],
      default: 'Yearly'
    },
    isNegotiable: {
      type: Boolean,
      default: true
    }
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
    required: true
  },
  workMode: {
    type: String,
    enum: ['Remote', 'On-site', 'Hybrid'],
    default: 'On-site'
  },
  applicationDeadline: Date,
  applicationUrl: String,
  contactEmail: String,
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'active'
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  promotionExpiry: Date,
  aiGenerated: {
    isGenerated: {
      type: Boolean,
      default: false
    },
    source: String,
    confidence: Number
  }
}, {
  timestamps: true
});

// Indexes for better search performance and query optimization
jobSchema.index({ title: 'text', 'company.name': 'text', description: 'text' });
jobSchema.index({ 'requirements.skills.name': 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ 'company.industry': 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ views: -1 });
jobSchema.index({ applications: -1 });
jobSchema.index({ applicationDeadline: 1 });

// Compound indexes for common query patterns
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ postedBy: 1, status: 1 });
jobSchema.index({ employmentType: 1, workMode: 1 });
jobSchema.index({ 'company.location.city': 1, 'company.location.isRemote': 1 });
jobSchema.index({ 'requirements.experience.level': 1, employmentType: 1 });

// Virtual for full location
jobSchema.virtual('fullLocation').get(function() {
  const location = this.company.location;
  if (location.isRemote) return 'Remote';
  
  const parts = [location.city, location.state, location.country].filter(Boolean);
  return parts.join(', ') || 'Location not specified';
});

// Method to calculate match score with user profile
jobSchema.methods.calculateUserMatch = function(userSkills, userPreferences) {
  let score = 0;
  let factors = 0;
  
  // Skills matching (40% weight)
  const jobSkills = this.requirements.skills.map(s => s.name.toLowerCase());
  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  const matchingSkills = jobSkills.filter(skill => 
    userSkillNames.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
  );
  
  if (jobSkills.length > 0) {
    score += (matchingSkills.length / jobSkills.length) * 40;
    factors += 40;
  }
  
  // Location preference (20% weight)
  if (userPreferences.locations && userPreferences.locations.length > 0) {
    const jobLocation = this.fullLocation.toLowerCase();
    const locationMatch = userPreferences.locations.some(loc => 
      jobLocation.includes(loc.toLowerCase()) || this.company.location.isRemote
    );
    if (locationMatch) score += 20;
    factors += 20;
  }
  
  // Job type preference (20% weight)
  if (userPreferences.jobTypes && userPreferences.jobTypes.includes(this.employmentType)) {
    score += 20;
  }
  factors += 20;
  
  // Industry preference (20% weight)
  if (userPreferences.industries && userPreferences.industries.includes(this.company.industry)) {
    score += 20;
  }
  factors += 20;
  
  return factors > 0 ? Math.round(score) : 0;
};

module.exports = mongoose.model('Job', jobSchema);
