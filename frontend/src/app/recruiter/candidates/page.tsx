'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/services/aiService';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentTextIcon,
  StarIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile: {
    phone?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    bio?: string;
    avatar?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  skills: Array<{
    name: string;
    level: string;
    category: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrentlyWorking: boolean;
    description?: string;
    skills: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    isCurrentlyStudying: boolean;
    gpa?: number;
    description?: string;
  }>;
  applications: Array<{
    _id: string;
    job: {
      title: string;
      company: { name: string };
    };
    status: string;
    appliedAt: string;
    resume?: {
      originalName: string;
      analysis?: { score: number };
    };
  }>;
  createdAt: string;
  lastLogin?: string;
}



export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  // Load candidates from API
  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: pagination.current,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(skillsFilter && { skills: skillsFilter }),
        ...(locationFilter && { location: locationFilter })
      };

      console.log('Loading candidates with filters:', filters);
      const response = await aiService.getCandidates(filters);

      if (response.candidates) {
        console.log('Loaded candidates:', response.candidates.length);
        setCandidates(response.candidates);
        setPagination(response.pagination);
      } else {
        console.warn('No candidates in response:', response);
        setCandidates([]);
      }
    } catch (error: any) {
      console.error('Failed to load candidates:', error);
      setError(error.message || 'Failed to load candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Load candidates on component mount and when filters change
  useEffect(() => {
    if (user && user.role === 'recruiter') {
      loadCandidates();
    } else if (user && user.role !== 'recruiter') {
      setError('Access denied. This page is only available to recruiters.');
      setLoading(false);
    }
  }, [user, pagination.current]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.current !== 1) {
        setPagination(prev => ({ ...prev, current: 1 }));
      } else {
        loadCandidates();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, skillsFilter, locationFilter]);

  // Helper functions
  const getFullName = (candidate: Candidate) => `${candidate.firstName} ${candidate.lastName}`;

  const getLocation = (candidate: Candidate) => {
    const loc = candidate.profile.location;
    if (!loc) return 'Location not specified';
    return [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
  };

  const getCurrentPosition = (candidate: Candidate) => {
    const currentJob = candidate.experience.find(exp => exp.isCurrentlyWorking);
    return currentJob ? `${currentJob.position} at ${currentJob.company}` : 'Position not specified';
  };

  const getEducation = (candidate: Candidate) => {
    const education = candidate.education[0];
    return education ? `${education.degree} in ${education.fieldOfStudy || 'N/A'}, ${education.institution}` : 'Education not specified';
  };

  const getSkillsList = (candidate: Candidate) => {
    return candidate.skills.map(skill => skill.name).slice(0, 5);
  };

  const getResumeScore = (candidate: Candidate) => {
    const latestApplication = candidate.applications[0];
    return latestApplication?.resume?.analysis?.score || 0;
  };

  // Filter and sort candidates (client-side for better UX)
  const filteredCandidates = candidates
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return getFullName(a).localeCompare(getFullName(b));
        case 'resumeScore':
          return getResumeScore(b) - getResumeScore(a);
        case 'applications':
          return b.applications.length - a.applications.length;
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getApplicationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle loading and error states
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading candidates...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadCandidates}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
              Candidates
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and review job applicants
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                  <p className="text-sm text-gray-600">Total Candidates</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <BriefcaseIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {candidates.reduce((sum, c) => sum + c.applications.length, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <AcademicCapIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {candidates.filter(c => c.skills.length > 0).length}
                  </p>
                  <p className="text-sm text-gray-600">With Skills</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {candidates.filter(c => c.experience.length > 0).length}
                  </p>
                  <p className="text-sm text-gray-600">With Experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Filter by skills..."
                  value={skillsFilter}
                  onChange={(e) => setSkillsFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">Registration Date</option>
                  <option value="name">Name</option>
                  <option value="applications">Applications Count</option>
                  <option value="resumeScore">Resume Score</option>
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <FunnelIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Candidates List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredCandidates.length === 0 ? (
              <div className="p-8 text-center">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No candidates found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredCandidates.map((candidate) => (
                  <div key={candidate.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {getFullName(candidate)}
                            </h3>
                          </div>

                          <p className="text-gray-600 mb-2">{getCurrentPosition(candidate)}</p>

                          <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {getLocation(candidate)}
                            </div>
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-4 w-4 mr-1" />
                              {candidate.email}
                            </div>
                            {candidate.profile.phone && (
                              <div className="flex items-center">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                {candidate.profile.phone}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 mr-2">Applications:</span>
                              <span className="font-semibold text-blue-600">{candidate.applications.length}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 mr-2">Resume Score:</span>
                              <span className="font-semibold text-green-600">{getResumeScore(candidate)}%</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {getSkillsList(candidate).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{candidate.skills.length - 5} more
                              </span>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-500">
                            <span>Joined: {new Date(candidate.createdAt).toLocaleDateString()}</span>
                            {candidate.lastLogin && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Last active: {new Date(candidate.lastLogin).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {candidate.applications.length > 0 && (
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getApplicationStatusColor(candidate.applications[0].status)}`}>
                            {candidate.applications[0].status.charAt(0).toUpperCase() + candidate.applications[0].status.slice(1)}
                          </span>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Profile"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {candidate.applications.length > 0 && candidate.applications[0].resume && (
                            <button
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="View Resume"
                            >
                              <DocumentTextIcon className="h-4 w-4" />
                            </button>
                          )}
                          <a
                            href={`mailto:${candidate.email}`}
                            className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                            title="Send Email"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                  disabled={pagination.current === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))}
                  disabled={pagination.current === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.current - 1) * 20) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.current * 20, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> candidates
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                      disabled={pagination.current === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.current === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))}
                      disabled={pagination.current === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
