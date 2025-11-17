'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface JobApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantAvatar: string;
  jobTitle: string;
  jobId: string;
  appliedDate: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  resumeScore: number;
  matchScore: number;
  experience: string;
  location: string;
  education: string;
  skills: string[];
  coverLetter?: string;
  notes?: string;
  starred: boolean;
  lastActivity: string;
}

// Mock data - replace with real API calls
const mockApplications: JobApplication[] = [
  {
    id: '1',
    applicantName: 'Sarah Johnson',
    applicantEmail: 'sarah.johnson@email.com',
    applicantAvatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=3B82F6&color=fff',
    jobTitle: 'Senior Frontend Developer',
    jobId: 'job-1',
    appliedDate: '2024-01-15',
    status: 'shortlisted',
    resumeScore: 92,
    matchScore: 88,
    experience: '5+ years',
    location: 'San Francisco, CA',
    education: 'BS Computer Science, Stanford',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    coverLetter: 'I am excited to apply for this position...',
    notes: 'Strong technical background, good cultural fit',
    starred: true,
    lastActivity: '2024-01-18'
  },
  {
    id: '2',
    applicantName: 'Michael Chen',
    applicantEmail: 'michael.chen@email.com',
    applicantAvatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10B981&color=fff',
    jobTitle: 'Full Stack Engineer',
    jobId: 'job-2',
    appliedDate: '2024-01-12',
    status: 'interviewed',
    resumeScore: 85,
    matchScore: 82,
    experience: '3+ years',
    location: 'New York, NY',
    education: 'MS Software Engineering, MIT',
    skills: ['Python', 'Django', 'React', 'PostgreSQL'],
    notes: 'Interview went well, waiting for final decision',
    starred: false,
    lastActivity: '2024-01-19'
  },
  {
    id: '3',
    applicantName: 'Emily Rodriguez',
    applicantEmail: 'emily.rodriguez@email.com',
    applicantAvatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=F59E0B&color=fff',
    jobTitle: 'React Developer Intern',
    jobId: 'job-3',
    appliedDate: '2024-01-10',
    status: 'new',
    resumeScore: 78,
    matchScore: 75,
    experience: '1+ years',
    location: 'Austin, TX',
    education: 'BS Computer Science, UT Austin',
    skills: ['React', 'JavaScript', 'CSS', 'Git'],
    starred: false,
    lastActivity: '2024-01-10'
  },
  {
    id: '4',
    applicantName: 'David Kim',
    applicantEmail: 'david.kim@email.com',
    applicantAvatar: 'https://ui-avatars.com/api/?name=David+Kim&background=8B5CF6&color=fff',
    jobTitle: 'Backend Developer',
    jobId: 'job-4',
    appliedDate: '2024-01-08',
    status: 'reviewed',
    resumeScore: 88,
    matchScore: 90,
    experience: '4+ years',
    location: 'Seattle, WA',
    education: 'MS Computer Science, University of Washington',
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
    notes: 'Excellent backend skills, strong system design knowledge',
    starred: true,
    lastActivity: '2024-01-16'
  },
  {
    id: '5',
    applicantName: 'Lisa Wang',
    applicantEmail: 'lisa.wang@email.com',
    applicantAvatar: 'https://ui-avatars.com/api/?name=Lisa+Wang&background=EF4444&color=fff',
    jobTitle: 'DevOps Engineer',
    jobId: 'job-5',
    appliedDate: '2024-01-05',
    status: 'rejected',
    resumeScore: 72,
    matchScore: 68,
    experience: '2+ years',
    location: 'Denver, CO',
    education: 'BS Information Technology, Colorado State',
    skills: ['Docker', 'Kubernetes', 'Jenkins', 'AWS'],
    notes: 'Good technical skills but lacks senior-level experience',
    starred: false,
    lastActivity: '2024-01-12'
  }
];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('appliedDate');

  // Get unique job titles for filter
  const uniqueJobs = Array.from(new Set(applications.map(app => app.jobTitle)));

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesJob = jobFilter === 'all' || app.jobTitle === jobFilter;
      return matchesSearch && matchesStatus && matchesJob;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.applicantName.localeCompare(b.applicantName);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'matchScore':
          return b.matchScore - a.matchScore;
        case 'resumeScore':
          return b.resumeScore - a.resumeScore;
        case 'appliedDate':
        default:
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      }
    });

  const handleStatusChange = async (applicationId: string, newStatus: JobApplication['status']) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, status: newStatus, lastActivity: new Date().toISOString() } : app
    ));
    // TODO: API call to update application status
  };

  const toggleStar = async (applicationId: string) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, starred: !app.starred } : app
    ));
    // TODO: API call to update starred status
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Redirect if not recruiter
  if (user?.role !== 'recruiter') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">This page is only accessible to recruiters.</p>
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
              <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
              Job Applications
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and manage applications for your job postings
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === 'new').length}
                  </p>
                  <p className="text-sm text-gray-600">New</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === 'shortlisted').length}
                  </p>
                  <p className="text-sm text-gray-600">Shortlisted</p>
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
                    {applications.filter(app => app.status === 'interviewed').length}
                  </p>
                  <p className="text-sm text-gray-600">Interviewed</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <UserIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === 'hired').length}
                  </p>
                  <p className="text-sm text-gray-600">Hired</p>
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
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Jobs</option>
                  {uniqueJobs.map(job => (
                    <option key={job} value={job}>{job}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="appliedDate">Applied Date</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="matchScore">Match Score</option>
                  <option value="resumeScore">Resume Score</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-8 text-center">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <img
                          src={application.applicantAvatar}
                          alt={application.applicantName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{application.applicantName}</h3>
                            <button
                              onClick={() => toggleStar(application.id)}
                              className="text-gray-400 hover:text-yellow-500"
                            >
                              {application.starred ? (
                                <StarIconSolid className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <StarIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          
                          <p className="text-blue-600 font-medium mb-1">{application.jobTitle}</p>
                          <p className="text-gray-600 text-sm mb-2">{application.applicantEmail}</p>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {application.location}
                            </div>
                            <div className="flex items-center">
                              <BriefcaseIcon className="h-4 w-4 mr-1" />
                              {application.experience}
                            </div>
                            <div className="flex items-center">
                              <AcademicCapIcon className="h-4 w-4 mr-1" />
                              {application.education}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 mr-2">Resume Score:</span>
                              <span className="font-semibold text-blue-600">{application.resumeScore}%</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 mr-2">Match Score:</span>
                              <span className="font-semibold text-green-600">{application.matchScore}%</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {application.skills.slice(0, 4).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {application.skills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{application.skills.length - 4} more
                              </span>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-500">
                            <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>Last activity: {new Date(application.lastActivity).toLocaleDateString()}</span>
                          </div>

                          {application.notes && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                              <strong>Notes:</strong> {application.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        
                        <select
                          value={application.status}
                          onChange={(e) => handleStatusChange(application.id, e.target.value as JobApplication['status'])}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        <div className="flex space-x-2">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Profile"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="View Resume"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
