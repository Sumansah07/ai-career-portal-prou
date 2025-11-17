'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
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
  PhoneIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  experience: string;
  education: string;
  skills: string[];
  appliedJobs: string[];
  resumeScore: number;
  matchScore: number;
  status: 'new' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  appliedDate: string;
  avatar: string;
  starred: boolean;
}

// Mock data - replace with real API calls
const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Senior Frontend Developer',
    experience: '5+ years',
    education: 'BS Computer Science, Stanford',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    appliedJobs: ['Senior Frontend Developer', 'Full Stack Engineer'],
    resumeScore: 92,
    matchScore: 88,
    status: 'shortlisted',
    appliedDate: '2024-01-15',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=3B82F6&color=fff',
    starred: true
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
    title: 'Full Stack Developer',
    experience: '3+ years',
    education: 'MS Software Engineering, MIT',
    skills: ['Python', 'Django', 'React', 'PostgreSQL'],
    appliedJobs: ['Full Stack Engineer'],
    resumeScore: 85,
    matchScore: 82,
    status: 'reviewed',
    appliedDate: '2024-01-12',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10B981&color=fff',
    starred: false
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 456-7890',
    location: 'Austin, TX',
    title: 'React Developer',
    experience: '2+ years',
    education: 'BS Computer Science, UT Austin',
    skills: ['React', 'JavaScript', 'CSS', 'Git'],
    appliedJobs: ['React Developer Intern'],
    resumeScore: 78,
    matchScore: 75,
    status: 'new',
    appliedDate: '2024-01-10',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=F59E0B&color=fff',
    starred: false
  }
];

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('appliedDate');

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'matchScore':
          return b.matchScore - a.matchScore;
        case 'resumeScore':
          return b.resumeScore - a.resumeScore;
        case 'appliedDate':
        default:
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      }
    });

  const handleStatusChange = async (candidateId: string, newStatus: Candidate['status']) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate
    ));
    // TODO: API call to update candidate status
  };

  const toggleStar = async (candidateId: string) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId ? { ...candidate, starred: !candidate.starred } : candidate
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
                  <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
                  <p className="text-sm text-gray-600">Total Candidates</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <EyeIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {candidates.filter(c => c.status === 'new').length}
                  </p>
                  <p className="text-sm text-gray-600">New Applications</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <StarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {candidates.filter(c => c.status === 'shortlisted').length}
                  </p>
                  <p className="text-sm text-gray-600">Shortlisted</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BriefcaseIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {candidates.filter(c => c.status === 'hired').length}
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
                    placeholder="Search candidates..."
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
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="appliedDate">Applied Date</option>
                  <option value="name">Name</option>
                  <option value="matchScore">Match Score</option>
                  <option value="resumeScore">Resume Score</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidates List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading candidates...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
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
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                            <button
                              onClick={() => toggleStar(candidate.id)}
                              className="text-gray-400 hover:text-yellow-500"
                            >
                              {candidate.starred ? (
                                <StarIconSolid className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <StarIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          
                          <p className="text-gray-600 mb-2">{candidate.title}</p>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {candidate.location}
                            </div>
                            <div className="flex items-center">
                              <BriefcaseIcon className="h-4 w-4 mr-1" />
                              {candidate.experience}
                            </div>
                            <div className="flex items-center">
                              <AcademicCapIcon className="h-4 w-4 mr-1" />
                              {candidate.education}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 mr-2">Resume Score:</span>
                              <span className="font-semibold text-blue-600">{candidate.resumeScore}%</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 mr-2">Match Score:</span>
                              <span className="font-semibold text-green-600">{candidate.matchScore}%</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {candidate.skills.slice(0, 4).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{candidate.skills.length - 4} more
                              </span>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-500">
                            <span>Applied: {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>Jobs: {candidate.appliedJobs.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                          {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                        </span>
                        
                        <select
                          value={candidate.status}
                          onChange={(e) => handleStatusChange(candidate.id, e.target.value as Candidate['status'])}
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
                          <button
                            className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                            title="Send Email"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
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
