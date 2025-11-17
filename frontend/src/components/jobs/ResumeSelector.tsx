'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { aiService } from '@/services/aiService';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface Resume {
  _id: string;
  originalName: string;
  createdAt: string;
  processingStatus: 'processing' | 'completed' | 'failed';
  fileSize: number;
  analysis?: any;
}

interface ResumeSelectorProps {
  selectedResumeId: string | null;
  onResumeSelect: (resumeId: string | null) => void;
  onResumeUpload: (resume: Resume) => void;
}

export function ResumeSelector({ selectedResumeId, onResumeSelect, onResumeUpload }: ResumeSelectorProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const response = await aiService.getUserResumes();
      if (response.success) {
        const completedResumes = response.data.resumes.filter(
          (resume: Resume) => resume.processingStatus === 'completed'
        );
        setResumes(completedResumes);
        
        // Auto-select the most recent resume if none selected
        if (!selectedResumeId && completedResumes.length > 0) {
          onResumeSelect(completedResumes[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      setUploading(true);
      const file = acceptedFiles[0];
      
      const uploadResult = await aiService.uploadResume(file);
      
      if (uploadResult.success) {
        const newResume = uploadResult.data.resume;
        setResumes(prev => [newResume, ...prev]);
        onResumeUpload(newResume);
        setShowUpload(false);
        
        // Poll for processing completion
        pollResumeStatus(newResume._id);
      }
    } catch (error) {
      console.error('Failed to upload resume:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const pollResumeStatus = async (resumeId: string) => {
    const maxAttempts = 30; // 30 seconds
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await aiService.getResumeStatus(resumeId);
        const resume = response.data.resume;
        
        if (resume.processingStatus === 'completed') {
          setResumes(prev => prev.map(r => 
            r._id === resumeId ? resume : r
          ));
          
          // Auto-select the newly processed resume
          onResumeSelect(resumeId);
          return;
        }
        
        if (resume.processingStatus === 'failed') {
          setResumes(prev => prev.filter(r => r._id !== resumeId));
          alert('Resume processing failed. Please try uploading again.');
          return;
        }
        
        // Continue polling if still processing
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        }
      } catch (error) {
        console.error('Error polling resume status:', error);
      }
    };

    poll();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const formatFileSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading resumes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Resume for Job Matching</h3>
              <p className="text-sm text-gray-600">Select or upload a resume to get personalized job matches</p>
            </div>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Upload New
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-white'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-sm font-medium text-gray-900">Uploading and analyzing...</p>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX • Max 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {resumes.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No resumes uploaded yet</p>
            <p className="text-sm text-gray-400">Upload a resume to get AI-powered job matching</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Select Resume ({resumes.length})</span>
              <button
                onClick={() => onResumeSelect(null)}
                className={`text-xs px-2 py-1 rounded ${
                  selectedResumeId === null 
                    ? 'bg-gray-200 text-gray-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                None
              </button>
            </div>
            
            {resumes.map((resume) => (
              <div
                key={resume._id}
                onClick={() => onResumeSelect(resume._id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedResumeId === resume._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(resume.processingStatus)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{resume.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(resume.createdAt).toLocaleDateString()} • {formatFileSize(resume.fileSize)}
                      </p>
                    </div>
                  </div>
                  {selectedResumeId === resume._id && (
                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
