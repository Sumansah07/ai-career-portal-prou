'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/services/aiService';
import {
  BriefcaseIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  company: {
    name: string;
    location: {
      city: string;
      isRemote: boolean;
    };
  };
  workMode: string;
  employmentType: string;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  createdAt: string;
  status: 'active' | 'paused' | 'closed' | 'draft';
  applications: any[];
  views: number;
  description: string;
}

export default function ManageJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Job>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  // Fetch jobs from API
  useEffect(() => {
    fetchJobs();
  }, [pagination.current, statusFilter]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editingJob) {
        cancelEditing();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingJob]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs for recruiter...');
      console.log('Current user:', user);
      console.log('Auth token exists:', !!localStorage.getItem('token'));

      // Test backend connectivity first
      try {
        const testResponse = await fetch('http://localhost:5000/api/jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Backend connectivity test:', testResponse.status);
      } catch (testError) {
        console.log('Backend connectivity test failed:', testError);
      }

      const response = await aiService.getMyJobs(pagination.current, 10);
      console.log('Received jobs response:', response);

      if (response && response.jobs) {
        setJobs(response.jobs);
        setPagination(response.pagination || { current: 1, pages: 1, total: 0 });
        console.log('Set jobs:', response.jobs.length, 'jobs loaded');
      } else {
        console.log('No jobs in response, setting empty array');
        setJobs([]);
      }
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      console.error('Error details:', error.response?.data);
      setJobs([]);

      // Show error message to user
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        alert('Access denied. This feature is only available to recruiters.');
      } else {
        alert('Failed to load jobs. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await aiService.deleteJob(jobId);
      setJobs(jobs.filter(job => job._id !== jobId));
      alert('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await aiService.updateJob(jobId, { status: newStatus });
      setJobs(jobs.map(job =>
        job._id === jobId ? { ...job, status: newStatus as any } : job
      ));
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status. Please try again.');
    }
  };

  const startEditing = (job: Job) => {
    // Prevent editing multiple jobs at once
    if (editingJob && editingJob !== job._id) {
      alert('Please finish editing the current job before editing another one.');
      return;
    }

    setEditingJob(job._id);
    setEditForm({
      title: job.title,
      company: job.company,
      workMode: job.workMode,
      employmentType: job.employmentType,
      salary: job.salary,
      description: job.description
    });
  };

  const cancelEditing = () => {
    setEditingJob(null);
    setEditForm({});
  };

  const saveJob = async (jobId: string) => {
    try {
      setSaving(jobId);

      // Validate required fields
      if (!editForm.title?.trim()) {
        alert('Job title is required');
        setSaving(null);
        return;
      }

      if (!editForm.company?.name?.trim()) {
        alert('Company name is required');
        setSaving(null);
        return;
      }

      // Prepare update data
      const updateData: any = {};

      if (editForm.title) updateData.title = editForm.title.trim();
      if (editForm.company?.name) updateData['company.name'] = editForm.company.name.trim();
      if (editForm.workMode) updateData.workMode = editForm.workMode;
      if (editForm.employmentType) updateData.employmentType = editForm.employmentType;
      if (editForm.description) updateData.description = editForm.description.trim();
      if (editForm.salary) updateData.salary = editForm.salary;

      await aiService.updateJob(jobId, updateData);

      // Update local state
      setJobs(jobs.map(job =>
        job._id === jobId ? { ...job, ...editForm } : job
      ));

      setEditingJob(null);
      setEditForm({});

      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
      successDiv.innerHTML = `
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Job updated successfully!</span>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 3000);
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (salary?: { min?: number; max?: number; currency: string }) => {
    if (!salary) return 'Not specified';
    const { min, max, currency } = salary;
    if (min && max) {
      return `${currency === 'USD' ? '$' : currency}${min.toLocaleString()} - ${currency === 'USD' ? '$' : currency}${max.toLocaleString()}`;
    } else if (min) {
      return `${currency === 'USD' ? '$' : currency}${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${currency === 'USD' ? '$' : currency}${max.toLocaleString()}`;
    }
    return 'Not specified';
  };

  const formatLocation = (company: Job['company']) => {
    if (company.location.isRemote) return 'Remote';
    return company.location.city || 'Not specified';
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BriefcaseIcon className="h-8 w-8 text-blue-600 mr-3" />
                  Manage Jobs
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your job postings and track their performance
                </p>
              </div>
              <Link
                href="/recruiter/post-job"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Post New Job
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.filter(job => job.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600">Active Jobs</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <EyeIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.reduce((sum, job) => sum + (job.views || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Views</p>
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
                    placeholder="Search jobs..."
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
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-8 text-center">
                <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No jobs found</p>
                <p className="text-sm text-gray-400 mb-4">
                  {jobs.length === 0 ? 'You haven\'t posted any jobs yet.' : 'Try adjusting your search or filters'}
                </p>
                {jobs.length === 0 && (
                  <Link
                    href="/recruiter/post-job"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <div key={job._id} className={`p-6 transition-all duration-200 ${editingJob === job._id ? 'bg-blue-50 border-l-4 border-blue-500 shadow-lg' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingJob === job._id ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-4">
                              <PencilIcon className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">Editing Job</span>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                              <input
                                type="text"
                                value={editForm.title || ''}
                                onChange={(e) => handleEditFormChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter job title"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                              <input
                                type="text"
                                value={editForm.company?.name || ''}
                                onChange={(e) => handleEditFormChange('company.name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter company name"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                                <select
                                  value={editForm.workMode || ''}
                                  onChange={(e) => handleEditFormChange('workMode', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="Remote">Remote</option>
                                  <option value="On-site">On-site</option>
                                  <option value="Hybrid">Hybrid</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                                <select
                                  value={editForm.employmentType || ''}
                                  onChange={(e) => handleEditFormChange('employmentType', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="Full-time">Full-time</option>
                                  <option value="Part-time">Part-time</option>
                                  <option value="Contract">Contract</option>
                                  <option value="Internship">Internship</option>
                                  <option value="Temporary">Temporary</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                                <input
                                  type="number"
                                  value={editForm.salary?.min || ''}
                                  onChange={(e) => handleEditFormChange('salary.min', parseInt(e.target.value))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Minimum salary"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                                <input
                                  type="number"
                                  value={editForm.salary?.max || ''}
                                  onChange={(e) => handleEditFormChange('salary.max', parseInt(e.target.value))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Maximum salary"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                              <textarea
                                value={editForm.description || ''}
                                onChange={(e) => handleEditFormChange('description', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter job description"
                              />
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </span>
                            </div>

                            <p className="text-gray-600 mb-2">{job.company.name}</p>

                            <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                              <div className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {formatLocation(job.company)}
                              </div>
                              <div className="flex items-center">
                                <BriefcaseIcon className="h-4 w-4 mr-1" />
                                {job.employmentType}
                              </div>
                              <div className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                {formatSalary(job.salary)}
                              </div>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{job.applications?.length || 0} applications</span>
                              <span>•</span>
                              <span>{job.views || 0} views</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {editingJob === job._id ? (
                          // Edit Mode Actions
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveJob(job._id)}
                              disabled={saving === job._id}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {saving === job._id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Saving...
                                </div>
                              ) : (
                                'Save Changes'
                              )}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={saving === job._id}
                              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          // View Mode Actions
                          <>
                            <select
                              value={job.status}
                              onChange={(e) => handleStatusChange(job._id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="active">Active</option>
                              <option value="paused">Paused</option>
                              <option value="closed">Closed</option>
                              <option value="draft">Draft</option>
                            </select>

                            <div className="flex space-x-1">
                              <button
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View Job"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => startEditing(job)}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="Edit Job"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job._id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Job"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        )}
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
