'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/services/aiService';
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
  _id: string;
  id?: string;
  job: {
    _id: string;
    title: string;
    company: {
      name: string;
      logo?: string;
      location?: {
        city?: string;
        isRemote?: boolean;
      };
    };
    employmentType: string;
    salary?: {
      min: number;
      max: number;
      type: string;
    };
  };
  applicant: string;
  resume?: {
    _id: string;
    originalName: string;
    analysis?: any;
  };
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string;
  notes?: string;
  matchScore?: number;
}

// Mock data removed - now using real API calls

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('appliedDate');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  // Load applications from API
  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await aiService.getMyApplications(
        statusFilter === 'all' ? undefined : statusFilter,
        pagination.current,
        10
      );

      if (response.applications) {
        setApplications(response.applications);
        setPagination(response.pagination);
      }
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load applications on component mount and when filters change
  useEffect(() => {
    loadApplications();
  }, [statusFilter, pagination.current]);

  // Filter and sort applications (client-side filtering for search)
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'company':
          return a.job.company.name.localeCompare(b.job.company.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'matchScore':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'appliedDate':
        default:
          return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
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
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
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
            ) : error ? (
              <div className="p-8 text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 mb-2">{error}</p>
                <button
                  onClick={loadApplications}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Try Again
                </button>
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
                  <div key={application._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <img
                          src={application.job.company.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(application.job.company.name)}&background=3B82F6&color=fff`}
                          alt={application.job.company.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{application.job.title}</h3>
                            {application.matchScore && (
                              <span className="text-sm font-medium text-blue-600">
                                {application.matchScore}% match
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 mb-2">{application.job.company.name}</p>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {application.job.company.location?.city || 'Remote'}
                            </div>
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                              {application.job.employmentType}
                            </div>
                            {application.job.salary && (
                              <div className="flex items-center">
                                <span className="font-medium">
                                  ${application.job.salary.min?.toLocaleString()} - ${application.job.salary.max?.toLocaleString()} {application.job.salary.type}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
                            {application.resume && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 font-medium">
                                  Resume: {application.resume.originalName}
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
