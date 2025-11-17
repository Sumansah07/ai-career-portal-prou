'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data - replace with real API calls
const applicationTrendsData = [
  { month: 'Jan', applications: 45, hires: 8 },
  { month: 'Feb', applications: 52, hires: 12 },
  { month: 'Mar', applications: 48, hires: 9 },
  { month: 'Apr', applications: 61, hires: 15 },
  { month: 'May', applications: 55, hires: 11 },
  { month: 'Jun', applications: 67, hires: 18 }
];

const jobPerformanceData = [
  { job: 'Frontend Dev', applications: 24, views: 156 },
  { job: 'Backend Dev', applications: 18, views: 89 },
  { job: 'Full Stack', applications: 31, views: 203 },
  { job: 'DevOps', applications: 12, views: 67 },
  { job: 'UI/UX', applications: 15, views: 98 }
];

const candidateSourceData = [
  { name: 'Job Boards', value: 35, color: '#3B82F6' },
  { name: 'LinkedIn', value: 28, color: '#10B981' },
  { name: 'Referrals', value: 20, color: '#F59E0B' },
  { name: 'Company Website', value: 12, color: '#EF4444' },
  { name: 'Other', value: 5, color: '#8B5CF6' }
];

const recentActivities = [
  { id: 1, type: 'application', message: 'New application for Senior Frontend Developer', time: '2 hours ago' },
  { id: 2, type: 'hire', message: 'Candidate hired for Full Stack Engineer position', time: '5 hours ago' },
  { id: 3, type: 'job_posted', message: 'New job posted: React Developer Intern', time: '1 day ago' },
  { id: 4, type: 'interview', message: 'Interview scheduled with John Doe', time: '2 days ago' },
  { id: 5, type: 'application', message: 'New application for DevOps Engineer', time: '3 days ago' }
];

export default function RecruiterAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                  Recruitment Analytics
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Track your hiring performance and candidate insights
                </p>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-600">Active Jobs</p>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+2 this month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">248</p>
                  <p className="text-sm text-gray-600">Total Applicants</p>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+18% vs last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">23</p>
                  <p className="text-sm text-gray-600">Successful Hires</p>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+5 this month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">14</p>
                  <p className="text-sm text-gray-600">Avg. Days to Hire</p>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-600">-2 days vs last month</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Application Trends */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={applicationTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="hires" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Job Performance */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="job" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#3B82F6" />
                  <Bar dataKey="views" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Candidate Sources */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Sources</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={candidateSourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {candidateSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'application' ? 'bg-blue-500' :
                      activity.type === 'hire' ? 'bg-green-500' :
                      activity.type === 'job_posted' ? 'bg-purple-500' :
                      activity.type === 'interview' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
