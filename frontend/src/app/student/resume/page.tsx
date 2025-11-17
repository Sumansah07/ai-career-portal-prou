'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResumeAnalysisModal } from '@/components/resume/ResumeAnalysisModal';
import { useDropzone } from 'react-dropzone';
import { aiService } from '@/services/aiService';
import { mockAIService } from '@/services/mockDataService';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Resume {
  id: string;
  name: string;
  uploadDate: string;
  status: 'analyzing' | 'completed' | 'failed';
  score: number;
  size: string;
  type: string;
}

const mockResumes: Resume[] = [
  {
    id: '1',
    name: 'Software_Engineer_Resume.pdf',
    uploadDate: '2024-01-15',
    status: 'completed',
    score: 85,
    size: '2.4 MB',
    type: 'PDF'
  },
  {
    id: '2',
    name: 'Frontend_Developer_CV.docx',
    uploadDate: '2024-01-10',
    status: 'completed',
    score: 78,
    size: '1.8 MB',
    type: 'DOCX'
  },
  {
    id: '3',
    name: 'Updated_Resume_2024.pdf',
    uploadDate: '2024-01-08',
    status: 'analyzing',
    score: 0,
    size: '3.1 MB',
    type: 'PDF'
  }
];

// Mock analysis data
const mockAnalysisData = {
  name: 'Software_Engineer_Resume.pdf',
  score: 85,
  analysis: {
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
};

export default function ResumeAnalyzerPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedResumeData, setSelectedResumeData] = useState<any>(null);

  // Load resumes on component mount
  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      // Try real API first, fallback to mock data
      let resumesData;
      try {
        resumesData = await aiService.getResumes();
      } catch (error) {
        console.log('Using mock data for development');
        resumesData = await mockAIService.getResumes();
      }

      setResumes(resumesData.map((resume: any) => ({
        id: resume._id,
        name: resume.originalName,
        uploadDate: new Date(resume.createdAt).toISOString().split('T')[0],
        status: resume.processingStatus === 'completed' ? 'completed' :
                resume.processingStatus === 'processing' ? 'analyzing' : 'failed',
        score: resume.analysis?.overallScore || 0,
        size: `${(resume.fileSize / (1024 * 1024)).toFixed(1)} MB`,
        type: resume.fileType.toUpperCase()
      })));
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    try {
      for (const file of acceptedFiles) {
        let uploadResult;
        try {
          uploadResult = await aiService.uploadResume(file);
        } catch (error) {
          console.log('Using mock upload for development');
          uploadResult = await mockAIService.uploadResume(file);
        }

        const newResume: Resume = {
          id: uploadResult.data.resume._id,
          name: file.name,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'analyzing',
          score: 0,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.name.split('.').pop()?.toUpperCase() || 'Unknown'
        };

        setResumes(prev => [newResume, ...prev]);

        // Poll for completion
        pollResumeStatus(newResume.id);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  }, []);

  const pollResumeStatus = (resumeId: string) => {
    const interval = setInterval(async () => {
      try {
        const resumesData = await aiService.getResumes();
        const updatedResume = resumesData.find((r: any) => r._id === resumeId);

        if (updatedResume && updatedResume.processingStatus === 'completed') {
          setResumes(prev => prev.map(resume =>
            resume.id === resumeId
              ? {
                  ...resume,
                  status: 'completed',
                  score: updatedResume.analysis?.overallScore || 0
                }
              : resume
          ));
          clearInterval(interval);
        } else if (updatedResume && updatedResume.processingStatus === 'failed') {
          setResumes(prev => prev.map(resume =>
            resume.id === resumeId
              ? { ...resume, status: 'failed' }
              : resume
          ));
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to check resume status:', error);
        clearInterval(interval);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'analyzing': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
              AI Resume Analyzer
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Upload your resume and get AI-powered insights to improve your job prospects
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-lg font-medium text-gray-900">Uploading...</p>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Drag and drop your resume, or click to browse
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Supports: PDF, DOC, DOCX</span>
                      <span>•</span>
                      <span>Max size: 10MB</span>
                    </div>
                    <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Choose File
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Resume List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Resumes</h3>
              <p className="text-sm text-gray-600">Manage and analyze your uploaded resumes</p>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading your resumes...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-8 text-center">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No resumes uploaded yet</p>
                <p className="text-sm text-gray-400">Upload your first resume to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {resumes.map((resume) => (
                  <div key={resume.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-10 w-10 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{resume.name}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Uploaded {new Date(resume.uploadDate).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500">{resume.size}</span>
                            <span className="text-xs text-gray-500">{resume.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Status */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resume.status)}`}>
                          {resume.status === 'analyzing' && (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                          )}
                          {resume.status === 'completed' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                          {resume.status === 'failed' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                          {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                        </span>
                        
                        {/* Score */}
                        {resume.status === 'completed' && (
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getScoreColor(resume.score)}`}>
                              {resume.score}%
                            </div>
                            <div className="text-xs text-gray-500">AI Score</div>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {resume.status === 'completed' && (
                            <button
                              onClick={async () => {
                                try {
                                  let analysis;
                                  try {
                                    analysis = await aiService.getResumeAnalysis(resume.id);
                                  } catch (error) {
                                    console.log('Using mock analysis for development');
                                    analysis = await mockAIService.getResumeAnalysis(resume.id);
                                  }

                                  setSelectedResumeData({
                                    name: resume.name,
                                    score: resume.score,
                                    analysis
                                  });
                                  setSelectedResume(resume.id);
                                  setShowAnalysis(true);
                                } catch (error) {
                                  console.error('Failed to load analysis:', error);
                                  alert('Failed to load analysis. Please try again.');
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View Analysis"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Download">
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar for analyzing */}
                    {resume.status === 'analyzing' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Analyzing resume...</span>
                          <span>Processing</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Modal */}
          {selectedResumeData && (
            <ResumeAnalysisModal
              isOpen={showAnalysis}
              onClose={() => setShowAnalysis(false)}
              resumeData={selectedResumeData}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
