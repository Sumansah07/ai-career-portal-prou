const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const geminiService = require('./geminiService');

class ResumeParserService {
  async parseResumeFile(filePath, fileType) {
    try {
      let extractedText = '';
      
      switch (fileType.toLowerCase()) {
        case 'pdf':
          extractedText = await this.parsePDF(filePath);
          break;
        case 'doc':
        case 'docx':
          extractedText = await this.parseWord(filePath);
          break;
        default:
          throw new Error('Unsupported file type');
      }

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Could not extract sufficient text from resume');
      }

      // Use Gemini AI to extract structured data
      let extractedData, analysis;

      try {
        extractedData = await geminiService.extractResumeData(extractedText);
        analysis = await geminiService.analyzeResume(extractedText);
      } catch (aiError) {
        console.log('Gemini AI failed, using fallback analysis:', aiError.message);

        // Fallback to basic analysis
        extractedData = this.createFallbackExtractedData(extractedText);
        analysis = this.createFallbackAnalysis(extractedText);
      }

      return {
        extractedText,
        parsedData: extractedData,
        analysis,
        processingStatus: 'completed'
      };
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  async parsePDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  async parseWord(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value;
    } catch (error) {
      console.error('Word document parsing error:', error);
      throw new Error('Failed to parse Word document');
    }
  }

  async analyzeResumeForJob(resumeData, jobData) {
    try {
      const userProfile = {
        skills: resumeData.parsedData?.skills?.map(skill => ({ name: skill })) || [],
        experience: resumeData.parsedData?.experience || [],
        preferences: {}
      };

      const jobRecommendations = await geminiService.generateJobRecommendations(
        userProfile, 
        [jobData]
      );

      if (jobRecommendations.recommendations && jobRecommendations.recommendations.length > 0) {
        const recommendation = jobRecommendations.recommendations[0];
        return {
          matchScore: recommendation.matchScore,
          matchingSkills: recommendation.matchingSkills,
          missingSkills: recommendation.missingSkills,
          reasons: recommendation.reasons,
          suggestions: recommendation.improvementSuggestions
        };
      }

      return {
        matchScore: 0,
        matchingSkills: [],
        missingSkills: [],
        reasons: [],
        suggestions: []
      };
    } catch (error) {
      console.error('Job matching error:', error);
      return {
        matchScore: 0,
        matchingSkills: [],
        missingSkills: [],
        reasons: ['Unable to analyze job match'],
        suggestions: ['Please try again later']
      };
    }
  }

  async generateImprovementSuggestions(resumeData, targetRole = '') {
    try {
      const prompt = `
        Based on the resume analysis, provide specific improvement suggestions:
        
        Current Analysis:
        Overall Score: ${resumeData.analysis?.overallScore || 'Unknown'}
        Strengths: ${resumeData.analysis?.strengths?.join(', ') || 'None identified'}
        Weaknesses: ${resumeData.analysis?.weaknesses?.join(', ') || 'None identified'}
        
        ${targetRole ? `Target Role: ${targetRole}` : ''}
        
        Provide detailed improvement suggestions in JSON format:
        {
          "prioritySuggestions": [
            {
              "category": "string",
              "suggestion": "string",
              "impact": "high|medium|low",
              "effort": "easy|moderate|difficult",
              "timeframe": "string"
            }
          ],
          "skillGaps": [
            {
              "skill": "string",
              "importance": "critical|important|nice-to-have",
              "learningResources": [array of strings]
            }
          ],
          "formattingImprovements": [array of strings],
          "contentEnhancements": [array of strings]
        }
      `;

      const result = await geminiService.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        prioritySuggestions: [],
        skillGaps: [],
        formattingImprovements: [],
        contentEnhancements: []
      };
    } catch (error) {
      console.error('Improvement suggestions error:', error);
      return {
        prioritySuggestions: [],
        skillGaps: [],
        formattingImprovements: [],
        contentEnhancements: []
      };
    }
  }

  async generateATSReport(resumeText) {
    try {
      const prompt = `
        Analyze the following resume for ATS (Applicant Tracking System) compatibility:
        
        ${resumeText}
        
        Provide ATS analysis in JSON format:
        {
          "atsScore": number (0-100),
          "issues": [
            {
              "issue": "string",
              "severity": "critical|warning|minor",
              "solution": "string"
            }
          ],
          "recommendations": [array of strings],
          "keywordOptimization": {
            "currentKeywords": [array of strings],
            "suggestedKeywords": [array of strings],
            "keywordDensity": "low|optimal|high"
          },
          "formattingIssues": [array of strings],
          "sectionOptimization": [
            {
              "section": "string",
              "status": "good|needs-improvement|missing",
              "suggestions": [array of strings]
            }
          ]
        }
      `;

      const result = await geminiService.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse ATS analysis');
    } catch (error) {
      console.error('ATS analysis error:', error);
      return {
        atsScore: 50,
        issues: [{ issue: 'Unable to complete ATS analysis', severity: 'warning', solution: 'Please try again' }],
        recommendations: ['Ensure your resume is in a standard format'],
        keywordOptimization: {
          currentKeywords: [],
          suggestedKeywords: [],
          keywordDensity: 'unknown'
        },
        formattingIssues: [],
        sectionOptimization: []
      };
    }
  }

  createFallbackExtractedData(text) {
    // Basic text analysis for fallback
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    const phoneMatch = text.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/);

    return {
      personalInfo: {
        name: 'Name not extracted',
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        location: '',
        linkedIn: '',
        github: '',
        portfolio: ''
      },
      summary: text.substring(0, 200) + '...',
      skills: this.extractBasicSkills(text),
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      languages: []
    };
  }

  createFallbackAnalysis(text) {
    const wordCount = text.split(/\s+/).length;
    const hasEmail = text.includes('@');
    const hasPhone = /[\d\-\(\)]{10,}/.test(text);

    let score = 50; // Base score
    if (hasEmail) score += 10;
    if (hasPhone) score += 10;
    if (wordCount > 200) score += 10;
    if (wordCount > 500) score += 10;

    return {
      overallScore: Math.min(score, 85),
      strengths: [
        'Resume uploaded successfully',
        hasEmail ? 'Contact email provided' : 'Document processed',
        hasPhone ? 'Phone number included' : 'Text extracted successfully'
      ],
      weaknesses: [
        'AI analysis temporarily unavailable',
        'Using basic text processing'
      ],
      suggestions: [
        'Try uploading again for full AI analysis',
        'Ensure resume is in standard format',
        'Check internet connection for AI features'
      ],
      sectionScores: {
        personalInfo: hasEmail && hasPhone ? 80 : 60,
        summary: 70,
        experience: 65,
        education: 65,
        skills: 60,
        formatting: 70
      },
      keywordDensity: this.extractBasicKeywords(text),
      atsCompatibility: {
        score: 70,
        issues: ['AI analysis unavailable'],
        recommendations: ['Retry for full ATS analysis']
      }
    };
  }

  extractBasicSkills(text) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS',
      'SQL', 'Git', 'AWS', 'Docker', 'TypeScript', 'Angular', 'Vue',
      'MongoDB', 'PostgreSQL', 'Express', 'Spring', 'Django', 'Flask'
    ];

    return commonSkills
      .filter(skill => text.toLowerCase().includes(skill.toLowerCase()))
      .map(skill => ({
        name: skill,
        category: 'Technical',
        confidence: 80
      }));
  }

  extractBasicKeywords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const keywordCounts = {};

    words.forEach(word => {
      if (word.length > 3) {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      }
    });

    return Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({
        keyword,
        count,
        relevance: Math.min(count * 10, 100)
      }));
  }

  // Clean up uploaded files after processing
  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('File cleanup error:', error);
    }
  }
}

module.exports = new ResumeParserService();
