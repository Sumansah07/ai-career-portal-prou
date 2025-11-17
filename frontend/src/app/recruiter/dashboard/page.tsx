'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { aiService } from '@/services/aiService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface RecruiterStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalViews: number;
  avgMatchScore: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'job_posted' | 'interview' | 'hire';
  title: string;
  description: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

interface TopCandidate {
  id: string;
  name: string;
  position: string;
  matchScore: number;
  avatar?: string;
  skills: string[];
}

interface RecentJob {
  id: string;
  title: string;
  applications: number;
  views: number;
  status: 'active' | 'paused' | 'closed';
  postedDate: string;
}

export default function RecruiterDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<RecruiterStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalViews: 0,
    avgMatchScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for enhanced dashboard
  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'application',
      title: 'New Application Received',
      description: 'Sarah Johnson applied for Senior Developer position',
      timestamp: '2 hours ago',
      status: 'pending'
    },
    {
      id: '2',
      type: 'interview',
      title: 'Interview Scheduled',
      description: 'Interview with Mike Chen for Product Manager role',
      timestamp: '4 hours ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'job_posted',
      title: 'Job Posted Successfully',
      description: 'Frontend Developer position is now live',
      timestamp: '1 day ago',
      status: 'completed'
    },
    {
      id: '4',
      type: 'hire',
      title: 'Candidate Hired',
      description: 'Alex Rodriguez accepted the UX Designer offer',
      timestamp: '2 days ago',
      status: 'completed'
    }
  ]);

  const [topCandidates] = useState<TopCandidate[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      position: 'Senior Developer',
      matchScore: 95,
      skills: ['React', 'Node.js', 'TypeScript']
    },
    {
      id: '2',
      name: 'Mike Chen',
      position: 'Product Manager',
      matchScore: 88,
      skills: ['Product Strategy', 'Analytics', 'Leadership']
    },
    {
      id: '3',
      name: 'Emily Davis',
      position: 'UX Designer',
      matchScore: 92,
      skills: ['Figma', 'User Research', 'Prototyping']
    }
  ]);

  const [recentJobs] = useState<RecentJob[]>([
    {
      id: '1',
      title: 'Senior Full Stack Developer',
      applications: 24,
      views: 156,
      status: 'active',
      postedDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Product Manager',
      applications: 18,
      views: 89,
      status: 'active',
      postedDate: '2024-01-12'
    },
    {
      id: '3',
      title: 'UX Designer',
      applications: 31,
      views: 203,
      status: 'paused',
      postedDate: '2024-01-10'
    }
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/shared/auth/login');
      return;
    }

    if (user?.role !== 'recruiter') {
      setError('Access denied. This feature is only available to recruiters.');
      return;
    }

    fetchRecruiterData();
  }, [isAuthenticated, user, router]);

  const fetchRecruiterData = async () => {
    try {
      setLoading(true);
      const analyticsData = await aiService.getRecruiterAnalytics();
      
      setStats({
        totalJobs: analyticsData.totalJobs || 0,
        activeJobs: analyticsData.activeJobs || 0,
        totalApplications: analyticsData.totalApplications || 0,
        pendingApplications: analyticsData.pendingApplications || 0,
        totalViews: analyticsData.totalViews || 0,
        avgMatchScore: analyticsData.avgMatchScore || 0
      });
      
    } catch (error) {
      console.error('Error fetching recruiter data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/shared/auth/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Jobs',
      value: stats.totalJobs.toString(),
      change: '+2',
      changeType: 'increase',
      icon: BriefcaseIcon,
      color: 'bg-blue-500',
      description: 'Jobs posted this month'
    },
    {
      name: 'Active Jobs',
      value: stats.activeJobs.toString(),
      change: '+1',
      changeType: 'increase',
      icon: ClockIcon,
      color: 'bg-green-500',
      description: 'Currently accepting applications'
    },
    {
      name: 'Total Applications',
      value: stats.totalApplications.toString(),
      change: '+12',
      changeType: 'increase',
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
      description: 'Applications received'
    },
    {
      name: 'Pending Reviews',
      value: stats.pendingApplications.toString(),
      change: '+5',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'bg-orange-500',
      description: 'Applications awaiting review'
    },
    {
      name: 'Profile Views',
      value: stats.totalViews.toString(),
      change: '+8',
      changeType: 'increase',
      icon: EyeIcon,
      color: 'bg-indigo-500',
      description: 'Job posting views'
    },
    {
      name: 'Avg. Match Score',
      value: `${stats.avgMatchScore}%`,
      change: '+3%',
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'bg-pink-500',
      description: 'Average candidate compatibility'
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Recruiter Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName}! Here's your recruitment overview
          </p>
        </div>

        {/* Compact Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.name} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <card.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className={`text-xs font-medium ${
                    card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1">{card.name}</p>
                <p className="text-xl font-bold text-gray-900 mb-1">{card.value}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Recent Activity & Top Candidates */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  <BellIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'application' ? 'bg-blue-100' :
                        activity.type === 'interview' ? 'bg-green-100' :
                        activity.type === 'job_posted' ? 'bg-purple-100' :
                        'bg-yellow-100'
                      }`}>
                        {activity.type === 'application' && <DocumentTextIcon className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'interview' && <CalendarIcon className="h-4 w-4 text-green-600" />}
                        {activity.type === 'job_posted' && <BriefcaseIcon className="h-4 w-4 text-purple-600" />}
                        {activity.type === 'hire' && <CheckCircleIcon className="h-4 w-4 text-yellow-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                      </div>
                      {activity.status && (
                        <div className={`flex-shrink-0 px-2 py-1 text-xs rounded-full ${
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.status}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View all activities →
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Job Postings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Job Postings</h3>
                  <button
                    onClick={() => router.push('/recruiter/post-job')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Post New Job
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{job.title}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">{job.applications} applications</span>
                          <span className="text-xs text-gray-500">{job.views} views</span>
                          <span className="text-xs text-gray-500">Posted {job.postedDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' :
                          job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {job.status}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800">
                          <ArrowRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/recruiter/manage-jobs')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all jobs →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Top Candidates & Quick Actions */}
          <div className="space-y-6">
            {/* Top Candidates */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Candidates</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-xs text-gray-500">{candidate.position}</p>
                        <div className="flex items-center mt-1">
                          <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-xs text-gray-600">{candidate.matchScore}% match</span>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/recruiter/candidates')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all candidates →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/recruiter/post-job')}
                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <PlusIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Post New Job</span>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => router.push('/recruiter/applications')}
                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Review Applications</span>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => router.push('/recruiter/analytics')}
                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <ChartBarIcon className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">View Analytics</span>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recruitment Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Recruitment Tip</h4>
                    <p className="text-sm text-blue-800">
                      Consider posting jobs during Tuesday-Thursday for maximum visibility.
                      Applications typically peak during these days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </DashboardLayout>
  );
}
