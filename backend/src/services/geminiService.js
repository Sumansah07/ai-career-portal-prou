const { GoogleGenerativeAI } = require('@google/generative-ai');

  class GeminiService {
    constructor() {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // Use the most commonly available model
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });
    }

  async testConnection() {
    try {
      const result = await this.model.generateContent('Hello, this is a test. Please respond with "Connection successful".');
      const response = await result.response;
      const text = response.text();
      console.log('Gemini API test response:', text);
      return { success: true, response: text };
    } catch (error) {
      console.error('Gemini API test failed:', error);

      // Check for specific error types
      if (error.message.includes('models/gemini-2.5-flash is not found')) {
        console.log('Trying alternative model: gemini-pro');
        try {
          this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
          const result = await this.model.generateContent('Test');
          const response = await result.response;
          const text = response.text();
          return { success: true, response: text, model: 'gemini-pro' };
        } catch (altError) {
          console.error('Alternative model also failed:', altError.message);
        }
      }

      return { success: false, error: error.message };
    }
  }

  async analyzeResume(resumeText) {
    try {
      const prompt = `
        Analyze the following resume and provide a comprehensive analysis in JSON format:

        Resume Text:
        ${resumeText}

        Please provide analysis in this exact JSON structure:
        {
          "overallScore": number (0-100),
          "strengths": [array of strings],
          "weaknesses": [array of strings],
          "suggestions": [array of strings],
          "sectionScores": {
            "personalInfo": number (0-100),
            "summary": number (0-100),
            "experience": number (0-100),
            "education": number (0-100),
            "skills": number (0-100),
            "formatting": number (0-100)
          },
          "keywordDensity": [
            {
              "keyword": "string",
              "count": number,
              "relevance": number (0-100)
            }
          ],
          "atsCompatibility": {
            "score": number (0-100),
            "issues": [array of strings],
            "recommendations": [array of strings]
          },
          "extractedSkills": [array of strings],
          "industryAlignment": [
            {
              "industry": "string",
              "score": number (0-100),
              "matchingSkills": [array of strings]
            }
          ]
        }

        Focus on:
        1. Technical skills and their relevance
        2. Work experience quality and quantification
        3. Education relevance
        4. ATS compatibility
        5. Overall presentation and formatting
        6. Missing elements that could improve the resume
        7. Industry-specific keywords and their density
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Gemini resume analysis error:', error);
      throw new Error('Failed to analyze resume with AI');
    }
  }

  async generateJobRecommendations(userProfile, availableJobs) {
    try {
      const prompt = `
        Based on the user profile, analyze and rank the following jobs by compatibility.
        
        User Profile:
        Skills: ${userProfile.skills?.map(s => s.name).join(', ') || 'Not specified'}
        Experience: ${userProfile.experience || 'Not specified'}
        Preferences: ${JSON.stringify(userProfile.preferences || {})}
        
        Available Jobs:
        ${availableJobs.map((job, index) => `
          Job ${index + 1}:
          Title: ${job.title}
          Company: ${job.company?.name || job.company}
          Requirements: ${job.requirements?.skills?.map(s => s.name).join(', ') || 'Not specified'}
          Description: ${job.description?.substring(0, 200) || 'No description'}
        `).join('\n')}

        Provide analysis in this JSON format:
        {
          "recommendations": [
            {
              "jobIndex": number,
              "matchScore": number (0-100),
              "matchingSkills": [array of strings],
              "missingSkills": [array of strings],
              "reasons": [array of strings explaining why it's a good match],
              "improvementSuggestions": [array of strings]
            }
          ],
          "overallInsights": {
            "strongestSkills": [array of strings],
            "skillsToImprove": [array of strings],
            "careerAdvice": "string"
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Gemini job recommendation error:', error);

      // Check if it's a quota/rate limit error and provide helpful message
      if (error.status === 429) {
        const quotaError = new Error('AI service quota exceeded. Please try again later or upgrade your plan.');
        quotaError.status = 429;
        throw quotaError;
      }

      // For other errors, provide a generic message
      const aiError = new Error('AI service temporarily unavailable. Using basic job matching.');
      aiError.status = error.status || 500;
      throw aiError;
    }
  }

  async generateInterviewQuestions(jobTitle, jobDescription, userSkills) {
    try {
      const prompt = `
        Generate interview questions for the following job position:
        
        Job Title: ${jobTitle}
        Job Description: ${jobDescription}
        Candidate Skills: ${userSkills.join(', ')}
        
        Provide 10 relevant interview questions in JSON format:
        {
          "questions": [
            {
              "question": "string",
              "type": "technical|behavioral|situational",
              "difficulty": "easy|medium|hard",
              "category": "string",
              "sampleAnswer": "string (brief guidance)"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Gemini interview questions error:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  async improveCoverLetter(jobDescription, userProfile, existingCoverLetter = '') {
    try {
      const prompt = `
        ${existingCoverLetter ? 'Improve the following cover letter' : 'Generate a cover letter'} for this job application:
        
        Job Description: ${jobDescription}
        
        User Profile:
        Name: ${userProfile.firstName} ${userProfile.lastName}
        Skills: ${userProfile.skills?.map(s => s.name).join(', ') || 'Not specified'}
        Experience: ${userProfile.experience || 'Not specified'}
        
        ${existingCoverLetter ? `Existing Cover Letter: ${existingCoverLetter}` : ''}
        
        Provide response in JSON format:
        {
          "coverLetter": "string (complete cover letter)",
          "improvements": [array of strings explaining what was improved],
          "keyPoints": [array of strings highlighting main selling points],
          "tone": "professional|enthusiastic|confident"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Gemini cover letter error:', error);
      throw new Error('Failed to generate/improve cover letter');
    }
  }

  async generateCareerAdvice(userProfile, careerGoals) {
    try {
      const prompt = `
        Provide personalized career advice based on the user's profile and goals:
        
        User Profile:
        Skills: ${userProfile.skills?.map(s => s.name).join(', ') || 'Not specified'}
        Experience Level: ${userProfile.experienceLevel || 'Not specified'}
        Current Role: ${userProfile.currentRole || 'Not specified'}
        Industry: ${userProfile.industry || 'Not specified'}
        
        Career Goals: ${careerGoals}
        
        Provide advice in JSON format:
        {
          "shortTermGoals": [array of strings (3-6 months)],
          "longTermGoals": [array of strings (1-2 years)],
          "skillsToLearn": [
            {
              "skill": "string",
              "priority": "high|medium|low",
              "reason": "string",
              "resources": [array of learning resources]
            }
          ],
          "careerPath": [array of strings describing potential career progression],
          "industryInsights": "string",
          "actionPlan": [array of specific actionable steps]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Gemini career advice error:', error);
      throw new Error('Failed to generate career advice');
    }
  }

  async extractResumeData(resumeText) {
    try {
      const prompt = `
        Extract structured data from the following resume text:
        
        ${resumeText}
        
        Extract information in this JSON format:
        {
          "personalInfo": {
            "name": "string",
            "email": "string",
            "phone": "string",
            "location": "string",
            "linkedIn": "string",
            "github": "string",
            "portfolio": "string"
          },
          "summary": "string",
          "skills": [array of skill names],
          "experience": [
            {
              "company": "string",
              "position": "string",
              "startDate": "string",
              "endDate": "string",
              "description": "string",
              "achievements": [array of strings]
            }
          ],
          "education": [
            {
              "institution": "string",
              "degree": "string",
              "field": "string",
              "graduationDate": "string",
              "gpa": "string"
            }
          ],
          "projects": [
            {
              "name": "string",
              "description": "string",
              "technologies": [array of strings],
              "url": "string"
            }
          ],
          "certifications": [
            {
              "name": "string",
              "issuer": "string",
              "date": "string",
              "url": "string"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Gemini data extraction error:', error);
      throw new Error('Failed to extract resume data');
    }
  }
}

module.exports = new GeminiService();
