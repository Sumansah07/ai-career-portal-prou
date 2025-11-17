'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
  location: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  jobType: string;
  salary: string;
  matchScore: number;
  lastUpdate: string;
  interviewDate?: string;
  notes?: string;
}

// Mock data - replace with real API calls
const mockApplications: Application[] = [
  {
    id: '1',
    jobTitle: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    companyLogo: 'https://ui-avatars.com/api/?name=TechCorp+Inc&background=3B82F6&color=fff',
    location: 'San Francisco, CA',
    appliedDate: '2024-01-15',
    status: 'interviewed',
    jobType: 'Full-time',
    salary: '$120k - $150k',
    matchScore: 92,
    lastUpdate: '2024-01-20',
    interviewDate: '2024-01-22',
    notes: 'Technical interview scheduled for next week'
  },
  {
    id: '2',
    jobTitle: 'Full Stack Engineer',
    company: 'StartupXYZ',
    companyLogo: 'https://ui-avatars.com/api/?name=StartupXYZ&background=10B981&color=fff',
    location: 'New York, NY',
    appliedDate: '2024-01-12',
    status: 'shortlisted',
    jobType: 'Full-time',
    salary: '$100k - $130k',
    matchScore: 88,
    lastUpdate: '2024-01-18',
    notes: 'Moved to second round of interviews'
  },
  {
    id: '3',
    jobTitle: 'React Developer',
    company: 'Innovation Labs',
    companyLogo: 'https://ui-avatars.com/api/?name=Innovation+Labs&background=F59E0B&color=fff',
    location: 'Austin, TX',
    appliedDate: '2024-01-10',
    status: 'reviewed',
    jobType: 'Contract',
    salary: '$80/hour',
    matchScore: 85,
    lastUpdate: '2024-01-16'
  },
  {
    id: '4',
    jobTitle: 'UI/UX Designer',
    company: 'Design Studio',
    companyLogo: 'https://ui-avatars.com/api/?name=Design+Studio&background=8B5CF6&color=fff',
    location: 'Remote',
    appliedDate: '2024-01-08',
    status: 'rejected',
    jobType: 'Full-time',
    salary: '$90k - $110k',
    matchScore: 75,
    lastUpdate: '2024-01-14',
    notes: 'Position filled by internal candidate'
  },
  {
    id: '5',
    jobTitle: 'Backend Developer',
    company: 'CloudTech Solutions',
    companyLogo: 'https://ui-avatars.com/api/?name=CloudTech+Solutions&background=EF4444&color=fff',
    location: 'Seattle, WA',
    appliedDate: '2024-01-05',
    status: 'pending',
    jobType: 'Full-time',
    salary: '$110k - $140k',
    matchScore: 90,
    lastUpdate: '2024-01-05'
  }
];

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('appliedDate');

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'company':
          return a.company.localeCompare(b.company);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'matchScore':
          return b.matchScore - a.matchScore;
        case 'appliedDate':
        default:
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'reviewed': return <EyeIcon className="h-4 w-4" />;
      case 'shortlisted': return <CheckCircleIcon className="h-4 w-4" />;
      case 'interviewed': return <CalendarIcon className="h-4 w-4" />;
      case 'hired': return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-yellow-100 text-yellow-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Redirect if not student
  if (user?.role !== 'student' && user?.role !== 'recruiter') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">This page is only accessible to students.</p>
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
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 mr-3" />
              My Applications
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Track your job applications and their status
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
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
                    {applications.filter(app => ['pending', 'reviewed', 'shortlisted'].includes(app.status)).length}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
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
                  <p className="text-sm text-gray-600">Interviews</p>
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
                    {applications.filter(app => app.status === 'hired').length}
                  </p>
                  <p className="text-sm text-gray-600">Offers</p>
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
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="appliedDate">Applied Date</option>
                  <option value="company">Company</option>
                  <option value="status">Status</option>
                  <option value="matchScore">Match Score</option>
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
                <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                          src={application.companyLogo}
                          alt={application.company}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                            <span className="text-sm font-medium text-blue-600">
                              {application.matchScore}% match
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-2">{application.company}</p>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {application.location}
                            </div>
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                              {application.jobType}
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">{application.salary}</span>
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Updated: {new Date(application.lastUpdate).toLocaleDateString()}</span>
                            {application.interviewDate && (
                              <>
                                <span>•</span>
                                <span className="text-purple-600 font-medium">
                                  Interview: {new Date(application.interviewDate).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>

                          {application.notes && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                              {application.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status}</span>
                        </span>
                        
                        <div className="flex space-x-2">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Job Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="View Application"
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
