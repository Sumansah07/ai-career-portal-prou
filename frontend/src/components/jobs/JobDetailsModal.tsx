'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { aiService } from '@/services/aiService';
import { useAuth } from '@/contexts/AuthContext';
import {
  XMarkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon,
  HeartIcon,
  ShareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    _id: string;
    title: string;
    company: {
      name: string;
      logo?: string;
      description?: string;
      size?: string;
      location?: {
        city?: string;
        state?: string;
        isRemote?: boolean;
      };
    };
    description: string;
    requirements?: {
      skills?: Array<{ name: string; level?: string; isRequired?: boolean }>;
      experience?: { min?: number; max?: number; level?: string };
      education?: { level?: string; field?: string };
    };
    responsibilities?: string[];
    benefits?: string[];
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
      type?: string;
    };
    employmentType: string;
    workMode?: string;
    applicationDeadline?: string;
    status: string;
    views?: number;
    applications?: number;
    createdAt: string;
    aiMatch?: {
      matchScore: number;
      matchingSkills: string[];
      missingSkills: string[];
      reasons: string[];
      suggestions: string[];
      aiRecommendation: string;
    };
  };
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
}

export function JobDetailsModal({ isOpen, onClose, job, onSave, onApply }: JobDetailsModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(job.aiMatch || null);
  const loadingRef = useRef(false);
  const loadedJobsRef = useRef(new Set());

  useEffect(() => {
    // Only load analysis if modal is open, we have a job ID, and we haven't loaded this job yet
    if (isOpen && job._id && !loadedJobsRef.current.has(job._id) && !loadingRef.current) {
      // If we already have aiMatch data, use it and mark as loaded
      if (job.aiMatch) {
        setAiAnalysis(job.aiMatch);
        loadedJobsRef.current.add(job._id);
      } else {
        // Only make API call if we don't have any analysis data
        loadAIAnalysis();
      }
    }
  }, [isOpen, job._id]);

  // Reset analysis state when job changes
  useEffect(() => {
    setAiAnalysis(job.aiMatch || null);
    // Don't reset the loaded jobs ref here to prevent re-loading
  }, [job._id, job.aiMatch]);

  const loadAIAnalysis = async () => {
    if (loadingRef.current) return; // Prevent multiple simultaneous calls

    try {
      loadingRef.current = true;
      setIsLoading(true);
      const response = await aiService.getJobAIAnalysis(job._id);
      setAiAnalysis(response.data.analysis);
      loadedJobsRef.current.add(job._id);
    } catch (error: any) {
      console.error('Failed to load AI analysis:', error);

      // Use fallback data if available
      if (job.aiMatch) {
        setAiAnalysis(job.aiMatch);
      } else {
        // Set a default analysis to prevent further requests
        setAiAnalysis({
          matchScore: 0,
          matchingSkills: [],
          missingSkills: [],
          reasons: ['Analysis unavailable'],
          suggestions: [],
          aiRecommendation: 'AI analysis is currently unavailable.'
        });
      }
      loadedJobsRef.current.add(job._id); // Mark as loaded even if failed
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleSaveJob = async () => {
    try {
      setIsLoading(true);
      await aiService.saveJob(job._id);
      setIsSaved(!isSaved);
      if (onSave) onSave(job._id);
    } catch (error) {
      console.error('Failed to save job:', error);
      alert('Failed to save job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyJob = async () => {
    try {
      setIsApplying(true);

      // Check user role
      console.log('Current user:', user);
      console.log('User role:', user?.role);

      if (!user) {
        throw new Error('Please log in to apply for jobs.');
      }

      if (user.role !== 'student') {
        throw new Error('Only students can apply for jobs. Please switch to a student account.');
      }

      const response = await aiService.applyToJob(job._id);
      console.log('Application response:', response);

      if (response.success) {
        if (onApply) onApply(job._id);
        alert('Application submitted successfully!');
        onClose(); // Close modal after successful application
      } else {
        throw new Error(response.message || 'Application failed');
      }
    } catch (error: any) {
      console.error('Failed to apply to job:', error);

      // Show more specific error message
      let errorMessage = 'Failed to submit application. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  const handleShareJob = async () => {
    try {
      setIsSharing(true);
      const response = await aiService.shareJob(job._id);
      const shareData = response.data;

      if (navigator.share) {
        await navigator.share({
          title: shareData.jobTitle,
          text: shareData.message,
          url: shareData.shareableLink,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.shareableLink);
        alert('Job link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share job:', error);
      alert('Failed to share job. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Helper functions for displaying job data
  const getLocationString = () => {
    const location = job.company.location;
    if (!location) return 'Location not specified';

    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);

    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const getSalaryString = () => {
    if (!job.salary) return 'Salary not specified';

    const { min, max, currency = 'USD', type = 'Yearly' } = job.salary;
    const symbol = currency === 'USD' ? '$' : currency;

    if (min && max) {
      return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()} ${type}`;
    } else if (min) {
      return `${symbol}${min.toLocaleString()}+ ${type}`;
    } else if (max) {
      return `Up to ${symbol}${max.toLocaleString()} ${type}`;
    }

    return 'Competitive salary';
  };

  const matchingSkills = aiAnalysis?.matchingSkills || [];
  const missingSkills = aiAnalysis?.missingSkills || [];
  const matchScore = aiAnalysis?.matchScore || 0;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="relative p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={job.company.logo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'}
                        alt={job.company.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                        }}
                      />
                      <div>
                        <Dialog.Title className="text-xl font-bold text-gray-900">
                          {job.title}
                        </Dialog.Title>
                        <p className="text-lg text-blue-600 font-medium">{job.company.name}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {getLocationString()}
                            {job.company.location?.isRemote && <span className="ml-1 text-green-600">(Remote)</span>}
                          </div>
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            {getSalaryString()}
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(matchScore)}`}>
                        <SparklesIcon className="h-4 w-4 mr-1" />
                        {matchScore}% Match
                      </span>
                      <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Job Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-gray-900">{job.applications || 0}</div>
                        <div className="text-sm text-gray-600">Applicants</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <BriefcaseIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-gray-900">{job.employmentType}</div>
                        <div className="text-sm text-gray-600">Employment</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-gray-900">{job.workMode || 'On-site'}</div>
                        <div className="text-sm text-gray-600">Work Mode</div>
                      </div>
                    </div>

                    {/* AI Match Analysis */}
                    {isLoading ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-gray-600">Loading AI analysis...</span>
                        </div>
                      </div>
                    ) : aiAnalysis ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
                          <SparklesIcon className="h-5 w-5 mr-2" />
                          AI Match Analysis
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-green-800 mb-2 flex items-center">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Matching Skills ({matchingSkills.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {matchingSkills.length > 0 ? matchingSkills.map((skill, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {skill}
                                </span>
                              )) : (
                                <span className="text-sm text-gray-600">No matching skills found</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              Skills to Learn ({missingSkills.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {missingSkills.length > 0 ? missingSkills.map((skill, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {skill}
                                </span>
                              )) : (
                                <span className="text-sm text-gray-600">All required skills matched!</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {aiAnalysis.aiRecommendation && (
                          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>AI Recommendation:</strong> {aiAnalysis.aiRecommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-600 text-center">
                          Upload a resume to get AI-powered job matching analysis
                        </p>
                      </div>
                    )}

                    {/* Job Description */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Job Description</h3>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <p>{job.description}</p>
                        <p className="mt-4">
                          We are looking for a passionate developer who thrives in a collaborative environment 
                          and is excited about building scalable web applications. You'll work with a talented 
                          team of engineers to deliver high-quality software solutions.
                        </p>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Requirements</h3>
                      <div className="space-y-4">
                        {job.requirements?.skills && job.requirements.skills.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Required Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {job.requirements.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    skill.isRequired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {skill.name}
                                  {skill.level && <span className="ml-1 text-xs">({skill.level})</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {job.requirements?.experience && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Experience</h4>
                            <p className="text-gray-700">
                              {job.requirements.experience.min && job.requirements.experience.max
                                ? `${job.requirements.experience.min}-${job.requirements.experience.max} years`
                                : job.requirements.experience.min
                                ? `${job.requirements.experience.min}+ years`
                                : 'Experience level not specified'
                              }
                              {job.requirements.experience.level && ` (${job.requirements.experience.level})`}
                            </p>
                          </div>
                        )}

                        {job.requirements?.education && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Education</h4>
                            <p className="text-gray-700">
                              {job.requirements.education.level}
                              {job.requirements.education.field && ` in ${job.requirements.education.field}`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Benefits */}
                    {job.benefits && job.benefits.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Benefits & Perks</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {job.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-sm text-green-800">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Company Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                        About {job.company.name}
                      </h3>
                      <p className="text-gray-700 text-sm">
                        {job.company.description ||
                          `${job.company.name} is a leading technology company focused on innovation and excellence.
                          We're committed to creating an inclusive workplace where talented individuals can thrive
                          and make a meaningful impact.`
                        }
                      </p>
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                        {job.company.size && <span>🏢 {job.company.size} company</span>}
                        {job.company.location && (
                          <span>🌍 {getLocationString()}</span>
                        )}
                        <span>⭐ 4.5/5 rating</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSaveJob}
                      disabled={isLoading}
                      className={`flex items-center px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                        isSaved
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      ) : isSaved ? (
                        <HeartSolidIcon className="h-5 w-5 mr-2" />
                      ) : (
                        <HeartIcon className="h-5 w-5 mr-2" />
                      )}
                      {isSaved ? 'Saved' : 'Save Job'}
                    </button>
                    <button
                      onClick={handleShareJob}
                      disabled={isSharing}
                      className="flex items-center px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {isSharing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      ) : (
                        <ShareIcon className="h-5 w-5 mr-2" />
                      )}
                      Share
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleApplyJob}
                      disabled={isApplying}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center"
                    >
                      {isApplying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Applying...
                        </>
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
