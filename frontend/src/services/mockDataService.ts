// Mock data service for development when backend is not available
export const mockResumes = [
  {
    _id: '1',
    originalName: 'Software_Engineer_Resume.pdf',
    createdAt: '2024-01-15T10:00:00Z',
    processingStatus: 'completed',
    fileSize: 2400000,
    fileType: 'pdf',
    analysis: {
      overallScore: 85,
      strengths: [
        'Strong technical skills section with relevant technologies',
        'Clear work experience with quantified achievements',
        'Professional formatting and layout',
        'Relevant education background',
        'Good use of action verbs'
      ],
      weaknesses: [
        'Missing professional summary section',
        'Could include more specific metrics',
        'Skills section could be better organized',
        'No mention of certifications'
      ],
      suggestions: [
        'Add a compelling professional summary at the top',
        'Include specific metrics and numbers in achievements',
        'Organize skills by category (Frontend, Backend, Tools)',
        'Add relevant certifications or courses',
        'Include links to portfolio projects'
      ],
      sectionScores: {
        personalInfo: 90,
        summary: 60,
        experience: 85,
        education: 80,
        skills: 75,
        formatting: 95
      },
      keywordDensity: [
        { keyword: 'React', count: 8, relevance: 95 },
        { keyword: 'JavaScript', count: 6, relevance: 90 },
        { keyword: 'Node.js', count: 4, relevance: 85 },
        { keyword: 'TypeScript', count: 3, relevance: 80 },
        { keyword: 'AWS', count: 2, relevance: 70 }
      ],
      atsCompatibility: {
        score: 78,
        issues: [
          'Some formatting elements may not be ATS-friendly',
          'Consider using standard section headings'
        ],
        recommendations: [
          'Use standard fonts like Arial or Calibri',
          'Avoid complex formatting and graphics',
          'Use standard section headings like "Work Experience"',
          'Save as both PDF and Word formats'
        ]
      }
    }
  },
  {
    _id: '2',
    originalName: 'Frontend_Developer_CV.docx',
    createdAt: '2024-01-10T14:30:00Z',
    processingStatus: 'completed',
    fileSize: 1800000,
    fileType: 'docx',
    analysis: {
      overallScore: 78,
      strengths: [
        'Good project showcase',
        'Clear contact information',
        'Relevant technical skills'
      ],
      weaknesses: [
        'Lacks quantified achievements',
        'Missing keywords for ATS',
        'Could improve formatting'
      ],
      suggestions: [
        'Add metrics to achievements',
        'Include more industry keywords',
        'Improve visual hierarchy'
      ],
      sectionScores: {
        personalInfo: 85,
        summary: 70,
        experience: 75,
        education: 80,
        skills: 80,
        formatting: 70
      },
      keywordDensity: [
        { keyword: 'React', count: 5, relevance: 90 },
        { keyword: 'CSS', count: 4, relevance: 85 },
        { keyword: 'HTML', count: 3, relevance: 80 }
      ],
      atsCompatibility: {
        score: 72,
        issues: ['Some formatting issues'],
        recommendations: ['Simplify formatting', 'Add more keywords']
      }
    }
  }
];

export const mockJobs = [
  {
    _id: '1',
    title: 'Senior Frontend Developer',
    company: { name: 'TechCorp Inc.' },
    description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
    requirements: {
      skills: [
        { name: 'React' },
        { name: 'TypeScript' },
        { name: 'Next.js' }
      ]
    },
    salary: { min: 120, max: 150 },
    employmentType: 'full-time',
    workMode: 'remote',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z'
  }
];

export const mockAnalytics = {
  profileViews: 328,
  jobApplications: 24,
  interviewInvites: 7,
  averageMatchScore: 85
};

// Mock AI Service that uses local data
export class MockAIService {
  async getResumes() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockResumes;
  }

  async uploadResume(file: File) {
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newResume = {
      _id: Date.now().toString(),
      originalName: file.name,
      createdAt: new Date().toISOString(),
      processingStatus: 'processing',
      fileSize: file.size,
      fileType: file.name.split('.').pop()?.toLowerCase() || 'unknown'
    };

    // Simulate processing completion after 3 seconds
    setTimeout(() => {
      newResume.processingStatus = 'completed';
      // Add analysis data
      (newResume as any).analysis = mockResumes[0].analysis;
    }, 3000);

    return {
      success: true,
      data: { resume: newResume }
    };
  }

  async getResumeAnalysis(resumeId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const resume = mockResumes.find(r => r._id === resumeId);
    return resume?.analysis || mockResumes[0].analysis;
  }

  async getAIJobMatches(filters?: any) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const jobsWithAI = mockJobs.map(job => ({
      ...job,
      aiMatch: {
        matchScore: Math.floor(Math.random() * 30) + 70,
        matchingSkills: ['React', 'TypeScript', 'JavaScript'],
        missingSkills: ['AWS', 'Docker'],
        reasons: ['Strong technical skills match', 'Relevant experience'],
        suggestions: ['Learn cloud technologies', 'Get AWS certification']
      }
    }));

    return {
      jobs: jobsWithAI,
      pagination: {
        current: 1,
        pages: 1,
        total: jobsWithAI.length
      }
    };
  }

  async getDashboardAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockAnalytics;
  }

  async generateInterviewQuestions(jobId: string, userSkills: string[]) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      questions: [
        {
          question: "Can you explain the difference between React hooks and class components?",
          type: "technical",
          difficulty: "medium",
          category: "React",
          sampleAnswer: "Hooks allow you to use state and lifecycle methods in functional components..."
        },
        {
          question: "Tell me about a challenging project you worked on.",
          type: "behavioral",
          difficulty: "medium",
          category: "Experience",
          sampleAnswer: "Focus on the problem, your approach, and the results achieved..."
        }
      ]
    };
  }

  async generateCoverLetter(jobId: string, existingCoverLetter?: string) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      coverLetter: "Dear Hiring Manager,\n\nI am excited to apply for the Senior Frontend Developer position...",
      improvements: ["Added specific technical skills", "Highlighted relevant experience"],
      keyPoints: ["React expertise", "Team leadership", "Problem-solving skills"],
      tone: "professional"
    };
  }

  async getMarketAnalysis(industry?: string, location?: string) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      totalJobs: 1250,
      marketHealth: "hot" as const,
      averageSalary: "$95k - $130k",
      topSkills: ["React", "TypeScript", "Node.js", "AWS", "Python"],
      growthTrends: ["AI/ML integration increasing", "Remote work opportunities growing"],
      recommendations: ["Focus on cloud technologies", "Develop full-stack skills"],
      competitionLevel: "medium" as const,
      insights: "The frontend development market is very active with high demand for React developers."
    };
  }
}

export const mockAIService = new MockAIService();
