'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { aiService } from '@/services/aiService';
import { mockAIService } from '@/services/mockDataService';
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  HeartIcon,
  ShareIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  matchScore: number;
  description: string;
  requirements: string[];
  benefits: string[];
  isRemote: boolean;
  companyLogo: string;
  applicants: number;
  saved: boolean;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120k - $150k',
    postedDate: '2024-01-15',
    matchScore: 95,
    description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
    requirements: ['React', 'TypeScript', 'Next.js', '5+ years experience'],
    benefits: ['Health Insurance', 'Remote Work', '401k', 'Stock Options'],
    isRemote: true,
    companyLogo: 'https://ui-avatars.com/api/?name=TechCorp&background=3B82F6&color=fff',
    applicants: 45,
    saved: true
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$100k - $130k',
    postedDate: '2024-01-14',
    matchScore: 88,
    description: 'Join our fast-growing startup as a Full Stack Engineer...',
    requirements: ['Node.js', 'React', 'MongoDB', '3+ years experience'],
    benefits: ['Equity', 'Flexible Hours', 'Learning Budget'],
    isRemote: false,
    companyLogo: 'https://ui-avatars.com/api/?name=StartupXYZ&background=10B981&color=fff',
    applicants: 23,
    saved: false
  },
  {
    id: '3',
    title: 'React Developer',
    company: 'Digital Agency Pro',
    location: 'Austin, TX',
    type: 'Contract',
    salary: '$80 - $100/hr',
    postedDate: '2024-01-13',
    matchScore: 82,
    description: 'We need a skilled React Developer for a 6-month project...',
    requirements: ['React', 'JavaScript', 'CSS', '2+ years experience'],
    benefits: ['Flexible Schedule', 'Remote Work'],
    isRemote: true,
    companyLogo: 'https://ui-avatars.com/api/?name=Digital+Agency&background=F59E0B&color=fff',
    applicants: 67,
    saved: false
  }
];

export default function JobMatchingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    type: '',
    location: '',
    remote: false,
    minSalary: ''
  });

  // Load AI-matched jobs on component mount
  useEffect(() => {
    loadAIJobs();
  }, []);

  const loadAIJobs = async () => {
    try {
      setLoading(true);
      let jobData;
      try {
        jobData = await aiService.getAIJobMatches(selectedFilters);
      } catch (error) {
        console.log('Using mock job data for development');
        jobData = await mockAIService.getAIJobMatches(selectedFilters);
      }

      // Transform the data to match our Job interface
      const transformedJobs = jobData.jobs.map((job: any) => ({
        id: job._id,
        title: job.title,
        company: job.company?.name || 'Unknown Company',
        location: job.company?.location?.city || 'Remote',
        type: job.employmentType || 'Full-time',
        salary: job.salary ? `$${job.salary.min}k - $${job.salary.max}k` : 'Competitive',
        postedDate: job.createdAt,
        matchScore: job.aiMatch?.matchScore || 75,
        description: job.description || 'No description available',
        requirements: job.requirements?.skills?.map((s: any) => s.name) || [],
        benefits: ['Health Insurance', 'Remote Work', '401k'],
        isRemote: job.workMode === 'remote',
        companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company?.name || 'Company')}&background=3B82F6&color=fff`,
        applicants: Math.floor(Math.random() * 100) + 10,
        saved: false
      }));

      setJobs(transformedJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, saved: !job.saved } : job
    ));
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
              AI Job Matching
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Discover personalized job opportunities based on your skills and preferences
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs, companies, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-4">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
                
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="san-francisco">San Francisco</option>
                  <option value="new-york">New York</option>
                </select>
                
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  More Filters
                </button>
              </div>
            </div>
          </div>

          {/* Job Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : filteredJobs.length}</p>
                  <p className="text-sm text-gray-600">Available Jobs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <SparklesIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredJobs.filter(job => job.matchScore >= 90).length}
                  </p>
                  <p className="text-sm text-gray-600">Perfect Matches</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <HeartSolidIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.filter(job => job.saved).length}
                  </p>
                  <p className="text-sm text-gray-600">Saved Jobs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">24h</p>
                  <p className="text-sm text-gray-600">Avg Response</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading AI-matched jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No jobs found matching your criteria</p>
                <p className="text-sm text-gray-400">Try adjusting your filters</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Company Logo */}
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-12 h-12 rounded-lg"
                    />
                    
                    {/* Job Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                          onClick={() => {
                            setSelectedJob(job);
                            setShowJobDetails(true);
                          }}
                        >
                          {job.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchScoreColor(job.matchScore)}`}>
                          {job.matchScore}% Match
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                          {job.company}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {job.location}
                          {job.isRemote && <span className="ml-1 text-green-600">(Remote)</span>}
                        </div>
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          {job.salary}
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(job.postedDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                      
                      {/* Requirements */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.requirements.slice(0, 4).map((req, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {req}
                          </span>
                        ))}
                        {job.requirements.length > 4 && (
                          <span className="text-xs text-gray-500">+{job.requirements.length - 4} more</span>
                        )}
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {job.applicants} applicants
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {job.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className={`p-2 rounded-full transition-colors ${
                              job.saved 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            {job.saved ? (
                              <HeartSolidIcon className="h-5 w-5" />
                            ) : (
                              <HeartIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                            <ShareIcon className="h-5 w-5" />
                          </button>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-8">
            <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Load More Jobs
            </button>
          </div>

          {/* Job Details Modal */}
          {selectedJob && (
            <JobDetailsModal
              isOpen={showJobDetails}
              onClose={() => setShowJobDetails(false)}
              job={selectedJob}
              onSave={toggleSaveJob}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
