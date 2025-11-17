const GeminiService = require('../../src/services/geminiService');

// Mock the Google Generative AI
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn()
      })
    }))
  };
});

describe('GeminiService', () => {
  let mockModel;
  let geminiService;

  beforeEach(() => {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const mockGenAI = new GoogleGenerativeAI();
    mockModel = mockGenAI.getGenerativeModel();
    
    // Reset the service for each test
    jest.clearAllMocks();
    geminiService = require('../../src/services/geminiService');
  });

  describe('testConnection', () => {
    it('should return success for valid response', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Connection successful'
        })
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await geminiService.testConnection();

      expect(result.success).toBe(true);
      expect(result.response).toBe('Connection successful');
    });

    it('should handle API errors gracefully', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('API Error'));

      const result = await geminiService.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('analyzeResume', () => {
    const mockResumeAnalysis = {
      overallScore: 85,
      strengths: ['Strong technical skills', 'Good experience'],
      weaknesses: ['Missing certifications'],
      suggestions: ['Add cloud certifications'],
      sectionScores: {
        personalInfo: 90,
        summary: 80,
        experience: 85,
        education: 75,
        skills: 90,
        formatting: 80
      },
      atsCompatibility: {
        score: 75,
        issues: ['Complex formatting'],
        recommendations: ['Simplify layout']
      }
    };

    it('should analyze resume successfully', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => JSON.stringify(mockResumeAnalysis)
        })
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await geminiService.analyzeResume('Sample resume text');

      expect(result.overallScore).toBe(85);
      expect(result.strengths).toEqual(expect.arrayContaining(['Strong technical skills']));
      expect(result.sectionScores).toBeDefined();
    });

    it('should handle malformed JSON response', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Invalid JSON response'
        })
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      await expect(geminiService.analyzeResume('Sample resume text'))
        .rejects.toThrow('Failed to analyze resume with AI');
    });

    it('should handle API errors', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('API quota exceeded'));

      await expect(geminiService.analyzeResume('Sample resume text'))
        .rejects.toThrow('Failed to analyze resume with AI');
    });
  });

  describe('generateJobRecommendations', () => {
    const mockUserProfile = {
      skills: [{ name: 'JavaScript' }, { name: 'React' }],
      experience: '2 years',
      preferences: { location: 'Remote' }
    };

    const mockJobs = [
      {
        title: 'Frontend Developer',
        company: { name: 'Tech Corp' },
        requirements: { skills: [{ name: 'React' }, { name: 'JavaScript' }] },
        description: 'Frontend development role'
      }
    ];

    it('should generate job recommendations', async () => {
      const mockRecommendations = {
        recommendations: [
          {
            jobIndex: 0,
            matchScore: 85,
            matchingSkills: ['JavaScript', 'React'],
            missingSkills: ['TypeScript'],
            reasons: ['Strong frontend skills'],
            improvementSuggestions: ['Learn TypeScript']
          }
        ],
        overallInsights: {
          strongestSkills: ['React'],
          skillsToImprove: ['TypeScript'],
          careerAdvice: 'Focus on modern frontend technologies'
        }
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => JSON.stringify(mockRecommendations)
        })
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await geminiService.generateJobRecommendations(mockUserProfile, mockJobs);

      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].matchScore).toBe(85);
      expect(result.overallInsights).toBeDefined();
    });

    it('should handle quota exceeded error', async () => {
      const quotaError = new Error('Quota exceeded');
      quotaError.status = 429;
      mockModel.generateContent.mockRejectedValue(quotaError);

      await expect(geminiService.generateJobRecommendations(mockUserProfile, mockJobs))
        .rejects.toThrow('AI service quota exceeded');
    });
  });
});