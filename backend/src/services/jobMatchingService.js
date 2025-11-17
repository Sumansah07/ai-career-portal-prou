const geminiService = require('./geminiService');
const Job = require('../models/Job');
const User = require('../models/User');

class JobMatchingService {
  async findMatchingJobs(userId, filters = {}, userResume = null) {
    let jobs = [];

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Build job query
      const jobQuery = { status: 'active' };
      
      if (filters.employmentType) {
        jobQuery.employmentType = filters.employmentType;
      }
      
      if (filters.workMode) {
        jobQuery.workMode = filters.workMode;
      }
      
      if (filters.industry) {
        jobQuery['company.industry'] = filters.industry;
      }

      if (filters.location && !filters.remote) {
        jobQuery.$or = [
          { 'company.location.city': new RegExp(filters.location, 'i') },
          { 'company.location.state': new RegExp(filters.location, 'i') },
          { 'company.location.isRemote': true }
        ];
      }

      if (filters.salaryMin || filters.salaryMax) {
        jobQuery['salary.min'] = {};
        if (filters.salaryMin) jobQuery['salary.min'].$gte = parseInt(filters.salaryMin);
        if (filters.salaryMax) jobQuery['salary.max'] = { $lte: parseInt(filters.salaryMax) };
      }

      // Get jobs from database
      jobs = await Job.find(jobQuery)
        .populate('postedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(50);

      console.log(`Found ${jobs.length} jobs in database`);

      if (jobs.length === 0) {
        console.log('No jobs found in database, providing mock data for testing');
        // Return mock jobs for testing when database is empty
        return this.getMockJobs(userResume);
      }

      // Enhanced user profile with resume data
      const userProfile = {
        skills: userResume?.parsedData?.skills || user.skills || [],
        experience: userResume?.parsedData?.experience || user.profile?.experience || 'Not specified',
        education: userResume?.parsedData?.education || user.profile?.education || [],
        preferences: user.preferences || {},
        resumeAnalyzed: !!userResume
      };

      let jobRecommendations = null;

      // Try to get AI recommendations, fall back to basic matching if AI fails
      try {
        jobRecommendations = await geminiService.generateJobRecommendations(userProfile, jobs);
      } catch (error) {
        console.error('AI recommendation error:', error);

        // Check if it's a quota/rate limit error
        if (error.status === 429 || error.message.includes('quota') || error.message.includes('rate limit')) {
          console.log('AI quota exceeded, falling back to basic matching');
        } else {
          console.log('AI service unavailable, using basic matching');
        }

        // Continue with basic matching (jobRecommendations remains null)
        console.log(`Proceeding with basic matching for ${jobs.length} jobs`);

        // If AI fails, use simple fallback immediately
        if (error.status === 429) {
          console.log('Using simple fallback due to quota exceeded');
          return this.generateBasicJobMatching(jobs, userResume);
        }
      }

      // Combine AI recommendations with job data
      const rankedJobs = jobs.map((job, index) => {
        try {
          const recommendation = jobRecommendations?.recommendations?.find(r => r.jobIndex === index);

          return {
            ...job.toObject(),
            aiMatch: recommendation ? {
              matchScore: recommendation.matchScore,
              matchingSkills: recommendation.matchingSkills,
              missingSkills: recommendation.missingSkills,
              reasons: recommendation.reasons,
              suggestions: recommendation.improvementSuggestions
            } : {
              matchScore: userResume ? this.calculateEnhancedMatch(userResume, job).score : this.calculateBasicMatch(user, job),
              matchingSkills: userResume ? this.calculateEnhancedMatch(userResume, job).matchingSkills : [],
              missingSkills: userResume ? this.calculateEnhancedMatch(userResume, job).missingSkills : [],
              reasons: userResume ? this.calculateEnhancedMatch(userResume, job).reasons : [],
              suggestions: userResume ? this.calculateEnhancedMatch(userResume, job).suggestions : [],
              aiRecommendation: userResume ? this.calculateEnhancedMatch(userResume, job).aiRecommendation : 'Upload a resume for personalized recommendations'
            }
          };
        } catch (jobError) {
          console.error(`Error processing job ${job.title}:`, jobError);
          // Return job with basic fallback data
          return {
            ...job.toObject(),
            aiMatch: {
              matchScore: 50,
              matchingSkills: [],
              missingSkills: [],
              reasons: ['Basic match - processing error'],
              suggestions: ['Upload a resume for better matching'],
              aiRecommendation: 'Basic job match'
            }
          };
        }
      });

      // Sort by match score
      rankedJobs.sort((a, b) => b.aiMatch.matchScore - a.aiMatch.matchScore);

      console.log(`Returning ${rankedJobs.length} ranked jobs with match scores`);
      return rankedJobs;
    } catch (error) {
      console.error('Job matching error:', error);
      console.log(`Error occurred, jobs available: ${jobs ? jobs.length : 'undefined'}`);

      // If there's an error but we have jobs, return them with basic matching
      if (jobs && jobs.length > 0) {
        console.log('Falling back to basic job matching due to error');
        return this.generateBasicJobMatching(jobs, userResume);
      }

      // If no jobs available, return mock data
      console.log('No jobs available, returning mock data');
      return this.getMockJobs(userResume);
    }
  }

  calculateBasicMatch(user, job) {
    let score = 0;
    let factors = 0;

    // Skills matching
    if (user.skills && user.skills.length > 0 && job.requirements?.skills) {
      const userSkills = user.skills.map(s => s.name?.toLowerCase() || s.toLowerCase());
      const jobSkills = job.requirements.skills.map(s => s.name?.toLowerCase() || s.toLowerCase());
      
      const matchingSkills = jobSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );
      
      if (jobSkills.length > 0) {
        score += (matchingSkills.length / jobSkills.length) * 40;
        factors += 40;
      }
    }

    // Location preference
    if (user.preferences?.locations && user.preferences.locations.length > 0) {
      const jobLocation = `${job.company?.location?.city || ''} ${job.company?.location?.state || ''}`.toLowerCase();
      const locationMatch = user.preferences.locations.some(loc => 
        jobLocation.includes(loc.toLowerCase()) || job.company?.location?.isRemote
      );
      if (locationMatch) score += 20;
      factors += 20;
    }

    // Job type preference
    if (user.preferences?.jobTypes && user.preferences.jobTypes.includes(job.employmentType)) {
      score += 20;
    }
    factors += 20;

    // Industry preference
    if (user.preferences?.industries && user.preferences.industries.includes(job.company?.industry)) {
      score += 20;
    }
    factors += 20;

    return factors > 0 ? Math.round(score) : 50; // Default score if no factors
  }

  calculateEnhancedMatch(userResume, job) {
    try {
      let score = 0;
      let factors = 0;
      const matchingSkills = [];
      const missingSkills = [];
      const reasons = [];
      const suggestions = [];

      // Skills matching (50% weight)
      const resumeSkills = userResume.parsedData?.skills?.map(skill =>
        typeof skill === 'string' ? skill.toLowerCase() : skill.name?.toLowerCase()
      ).filter(Boolean) || [];

      const jobSkills = job.requirements?.skills?.map(s => s.name?.toLowerCase()) || [];

      if (jobSkills.length > 0) {
        const matched = jobSkills.filter(jobSkill =>
          resumeSkills.some(resumeSkill =>
            resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)
          )
        );

        const missing = jobSkills.filter(jobSkill =>
          !resumeSkills.some(resumeSkill =>
            resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)
          )
        );

        matchingSkills.push(...matched);
        missingSkills.push(...missing);

        const skillScore = (matched.length / jobSkills.length) * 50;
        score += skillScore;
        factors += 50;

        if (matched.length > 0) {
          reasons.push(`Strong skill match: ${matched.slice(0, 3).join(', ')}`);
        }
        if (missing.length > 0) {
          suggestions.push(`Consider learning: ${missing.slice(0, 3).join(', ')}`);
        }
      }

      // Experience matching (30% weight)
      const jobExperience = job.requirements?.experience?.min || 0;
      const userExperience = this.extractExperienceYears(userResume.parsedData?.experience);

      if (userExperience >= jobExperience) {
        score += 30;
        reasons.push(`Experience requirement met (${userExperience}+ years)`);
      } else {
        score += (userExperience / jobExperience) * 30;
        suggestions.push(`Gain ${jobExperience - userExperience} more years of experience`);
      }
      factors += 30;

      const finalScore = factors > 0 ? Math.round(score / factors * 100) : 0;

      return {
        score: finalScore,
        matchingSkills,
        missingSkills,
        reasons,
        suggestions,
        aiRecommendation: this.generateAIRecommendationText(finalScore, matchingSkills, missingSkills)
      };
    } catch (error) {
      console.error('Enhanced match calculation error:', error);
      return {
        score: 0,
        matchingSkills: [],
        missingSkills: [],
        reasons: ['Error calculating match'],
        suggestions: ['Please try again'],
        aiRecommendation: 'Unable to analyze match at this time'
      };
    }
  }

  extractExperienceYears(experienceArray) {
    if (!experienceArray || !Array.isArray(experienceArray)) return 0;
    return Math.min(experienceArray.length * 2, 10); // Assume 2 years per position, max 10
  }

  generateAIRecommendationText(score, matchingSkills, missingSkills) {
    if (score >= 90) {
      return "Excellent match! You're a strong candidate for this role. Apply with confidence!";
    } else if (score >= 80) {
      return `Good match! You have ${matchingSkills.length} relevant skills. Consider highlighting your experience with ${matchingSkills.slice(0, 2).join(' and ')}.`;
    } else if (score >= 70) {
      return `Decent match! Focus on learning ${missingSkills.slice(0, 2).join(' and ')} to increase your competitiveness.`;
    } else if (score >= 60) {
      return `Moderate match. Consider gaining experience in ${missingSkills.slice(0, 3).join(', ')} before applying.`;
    } else {
      return `Lower match. This role may require significant skill development. Consider it for future career goals.`;
    }
  }

  generateAIRecommendation(recommendation) {
    const score = recommendation.matchScore;
    const skills = recommendation.matchingSkills;
    const missing = recommendation.missingSkills;

    if (score >= 85) {
      return `Excellent match! You have strong skills in ${skills.slice(0, 2).join(' and ')}. Apply now!`;
    } else if (score >= 70) {
      return `Good candidate! Consider learning ${missing.slice(0, 2).join(' and ')} to increase your match to 95%.`;
    } else {
      return `Potential fit. Focus on developing ${missing.slice(0, 3).join(', ')} skills for better alignment.`;
    }
  }

  async generatePersonalizedJobAlert(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const matchingJobs = await this.findMatchingJobs(userId);
      const topJobs = matchingJobs.slice(0, 5);

      if (topJobs.length === 0) {
        return {
          message: 'No new job matches found',
          jobs: []
        };
      }

      const alertPrompt = `
        Generate a personalized job alert email for the user based on these job matches:
        
        User Skills: ${user.skills?.map(s => s.name).join(', ') || 'Not specified'}
        
        Top Job Matches:
        ${topJobs.map((job, index) => `
          ${index + 1}. ${job.title} at ${job.company?.name || 'Unknown Company'}
          Match Score: ${job.aiMatch.matchScore}%
          Location: ${job.company?.location?.city || 'Remote'}
          Salary: ${job.salary?.min ? `$${job.salary.min}k - $${job.salary.max}k` : 'Not specified'}
        `).join('\n')}

        Generate a personalized message in JSON format:
        {
          "subject": "string",
          "message": "string (HTML formatted)",
          "highlights": [array of key points],
          "actionItems": [array of suggested actions]
        }
      `;

      const result = await geminiService.model.generateContent(alertPrompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const alertData = JSON.parse(jsonMatch[0]);
        return {
          ...alertData,
          jobs: topJobs
        };
      }

      return {
        subject: 'New Job Matches Found!',
        message: `We found ${topJobs.length} new job matches for you.`,
        highlights: [`${topJobs.length} new matches`, 'AI-powered recommendations'],
        actionItems: ['Review job matches', 'Update your profile'],
        jobs: topJobs
      };
    } catch (error) {
      console.error('Job alert generation error:', error);
      throw new Error('Failed to generate job alert');
    }
  }

  async analyzeJobMarket(industry, location) {
    try {
      const jobQuery = {
        status: 'active',
        ...(industry && { 'company.industry': industry }),
        ...(location && {
          $or: [
            { 'company.location.city': new RegExp(location, 'i') },
            { 'company.location.state': new RegExp(location, 'i') }
          ]
        })
      };

      const jobs = await Job.find(jobQuery).limit(100);

      if (jobs.length === 0) {
        return {
          totalJobs: 0,
          insights: 'No jobs found for the specified criteria'
        };
      }

      const marketPrompt = `
        Analyze the job market based on these job postings:
        
        Total Jobs: ${jobs.length}
        Industry: ${industry || 'All Industries'}
        Location: ${location || 'All Locations'}
        
        Job Titles: ${jobs.map(job => job.title).slice(0, 20).join(', ')}
        
        Salary Ranges: ${jobs.filter(job => job.salary?.min).map(job => 
          `$${job.salary.min}k-$${job.salary.max}k`
        ).slice(0, 10).join(', ')}

        Provide market analysis in JSON format:
        {
          "marketHealth": "hot|warm|cool|cold",
          "averageSalary": "string",
          "topSkills": [array of most demanded skills],
          "growthTrends": [array of trend observations],
          "recommendations": [array of career advice],
          "competitionLevel": "low|medium|high",
          "insights": "string (detailed market analysis)"
        }
      `;

      const result = await geminiService.model.generateContent(marketPrompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const marketData = JSON.parse(jsonMatch[0]);
        return {
          totalJobs: jobs.length,
          ...marketData
        };
      }

      return {
        totalJobs: jobs.length,
        insights: 'Market analysis completed',
        marketHealth: 'warm',
        topSkills: [],
        recommendations: []
      };
    } catch (error) {
      console.error('Job market analysis error:', error);
      throw new Error('Failed to analyze job market');
    }
  }

  async generateCareerPathSuggestions(userId, targetRole) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const careerAdvice = await geminiService.generateCareerAdvice(user, `I want to become a ${targetRole}`);
      
      return careerAdvice;
    } catch (error) {
      console.error('Career path suggestions error:', error);
      throw new Error('Failed to generate career path suggestions');
    }
  }
  generateBasicJobMatching(jobs, userResume = null) {
    console.log(`Generating basic matching for ${jobs.length} jobs`);

    return jobs.map(job => {
      const jobObj = job.toObject ? job.toObject() : job;

      // Calculate basic match score
      let matchScore = 50; // Base score
      let matchingSkills = [];
      let missingSkills = [];

      if (userResume && userResume.parsedData && userResume.parsedData.skills) {
        const userSkills = userResume.parsedData.skills.map(s => s.toLowerCase());
        const jobSkills = jobObj.requirements?.skills?.map(s => s.name?.toLowerCase()) || [];

        matchingSkills = jobSkills.filter(skill => userSkills.includes(skill));
        missingSkills = jobSkills.filter(skill => !userSkills.includes(skill));

        // Adjust score based on skill match
        if (jobSkills.length > 0) {
          const skillMatchRatio = matchingSkills.length / jobSkills.length;
          matchScore = Math.round(50 + (skillMatchRatio * 40)); // 50-90 range
        }
      }

      const result = {
        ...jobObj,
        aiMatch: {
          matchScore,
          matchingSkills,
          missingSkills,
          reasons: matchingSkills.length > 0 ? [`${matchingSkills.length} matching skills found`] : ['Basic job match'],
          suggestions: missingSkills.length > 0 ? [`Consider learning: ${missingSkills.slice(0, 3).join(', ')}`] : ['Great skill alignment!'],
          aiRecommendation: userResume ? 'Match calculated based on your resume' : 'Upload a resume for better matching'
        }
      };

      console.log(`Job ${jobObj.title} - Match Score: ${matchScore}`);
      return result;
    });
  }

  getMockJobs(userResume = null) {
    const mockJobs = [
      {
        _id: 'mock-job-1',
        title: 'Frontend Developer',
        description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user-facing features using React and modern web technologies.',
        requirements: {
          skills: [
            { name: 'React', required: true },
            { name: 'JavaScript', required: true },
            { name: 'TypeScript', required: false },
            { name: 'CSS', required: true }
          ],
          experience: { min: 2, max: 5 },
          education: 'Bachelor\'s degree in Computer Science or related field'
        },
        company: {
          name: 'TechCorp Inc',
          location: { city: 'San Francisco', state: 'CA', isRemote: false },
          logo: 'https://ui-avatars.com/api/?name=TechCorp&background=3B82F6&color=fff'
        },
        salary: { min: 70000, max: 90000, type: 'Yearly' },
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        createdAt: new Date(),
        applications: 15,
        aiMatch: {
          matchScore: userResume ? 85 : 75,
          matchingSkills: userResume ? ['React', 'JavaScript'] : [],
          missingSkills: userResume ? ['TypeScript'] : ['React', 'JavaScript', 'CSS'],
          recommendations: [
            'Your React experience aligns well with this role',
            'Consider learning TypeScript to strengthen your profile'
          ]
        }
      },
      {
        _id: 'mock-job-2',
        title: 'Full Stack Developer',
        description: 'Join our dynamic team as a Full Stack Developer. Work on exciting projects using Node.js, React, and MongoDB.',
        requirements: {
          skills: [
            { name: 'Node.js', required: true },
            { name: 'React', required: true },
            { name: 'MongoDB', required: true },
            { name: 'Express.js', required: false }
          ],
          experience: { min: 3, max: 7 },
          education: 'Bachelor\'s degree preferred'
        },
        company: {
          name: 'StartupXYZ',
          location: { city: 'Austin', state: 'TX', isRemote: true },
          logo: 'https://ui-avatars.com/api/?name=StartupXYZ&background=10B981&color=fff'
        },
        salary: { min: 80000, max: 110000, type: 'Yearly' },
        employmentType: 'Full-time',
        workMode: 'Remote',
        createdAt: new Date(),
        applications: 8,
        aiMatch: {
          matchScore: userResume ? 92 : 70,
          matchingSkills: userResume ? ['Node.js', 'React', 'MongoDB'] : [],
          missingSkills: userResume ? [] : ['Node.js', 'React', 'MongoDB'],
          recommendations: [
            'Excellent match for your full-stack skills',
            'Remote work opportunity aligns with modern preferences'
          ]
        }
      },
      {
        _id: 'mock-job-3',
        title: 'Software Engineer',
        description: 'We are seeking a talented Software Engineer to develop scalable applications and work with cutting-edge technologies.',
        requirements: {
          skills: [
            { name: 'Python', required: true },
            { name: 'Django', required: true },
            { name: 'PostgreSQL', required: true },
            { name: 'AWS', required: false }
          ],
          experience: { min: 1, max: 4 },
          education: 'Bachelor\'s degree in Computer Science'
        },
        company: {
          name: 'InnovateLab',
          location: { city: 'Seattle', state: 'WA', isRemote: false },
          logo: 'https://ui-avatars.com/api/?name=InnovateLab&background=8B5CF6&color=fff'
        },
        salary: { min: 75000, max: 95000, type: 'Yearly' },
        employmentType: 'Full-time',
        workMode: 'On-site',
        createdAt: new Date(),
        applications: 12,
        aiMatch: {
          matchScore: userResume ? 78 : 65,
          matchingSkills: userResume ? ['Python'] : [],
          missingSkills: userResume ? ['Django', 'PostgreSQL'] : ['Python', 'Django', 'PostgreSQL'],
          recommendations: [
            'Great opportunity to work with Python ecosystem',
            'Consider learning Django and PostgreSQL for better fit'
          ]
        }
      }
    ];

    return mockJobs;
  }
}

module.exports = new JobMatchingService();
