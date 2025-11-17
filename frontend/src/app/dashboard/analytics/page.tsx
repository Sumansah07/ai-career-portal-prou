'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  SparklesIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const profileViewsData = [
  { month: 'Jan', views: 45 },
  { month: 'Feb', views: 52 },
  { month: 'Mar', views: 48 },
  { month: 'Apr', views: 61 },
  { month: 'May', views: 55 },
  { month: 'Jun', views: 67 },
];

const skillsData = [
  { skill: 'React', level: 90 },
  { skill: 'TypeScript', level: 85 },
  { skill: 'Node.js', level: 80 },
  { skill: 'Python', level: 75 },
  { skill: 'AWS', level: 70 },
];

const jobMatchData = [
  { category: 'Perfect Match', value: 35, color: '#10B981' },
  { category: 'Good Match', value: 45, color: '#3B82F6' },
  { category: 'Fair Match', value: 20, color: '#F59E0B' },
];

const industryInterestData = [
  { industry: 'Technology', applications: 45 },
  { industry: 'Finance', applications: 23 },
  { industry: 'Healthcare', applications: 18 },
  { industry: 'Education', applications: 12 },
  { industry: 'Retail', applications: 8 },
];

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
              Career Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Track your career progress and get insights to improve your job search
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <EyeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">328</p>
                  <p className="text-sm text-gray-600">Profile Views</p>
                  <div className="flex items-center mt-1">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <BriefcaseIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-sm text-gray-600">Job Applications</p>
                  <div className="flex items-center mt-1">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+8%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">7</p>
                  <p className="text-sm text-gray-600">Interview Invites</p>
                  <div className="flex items-center mt-1">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+15%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <SparklesIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                  <p className="text-sm text-gray-600">Avg Match Score</p>
                  <div className="flex items-center mt-1">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Profile Views Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Profile Views</h3>
                <select className="text-sm border border-gray-300 rounded px-3 py-1">
                  <option>Last 6 months</option>
                  <option>Last year</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={profileViewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Job Match Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Job Match Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={jobMatchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {jobMatchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-4">
                {jobMatchData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skills Assessment */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Skills Assessment</h3>
              <div className="space-y-4">
                {skillsData.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{skill.skill}</span>
                      <span className="text-gray-500">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                Take Skills Assessment →
              </button>
            </div>

            {/* Industry Interest */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Industry Applications</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={industryInterestData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="industry" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity Timeline</h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {[
                    { event: 'Profile viewed by TechCorp Inc.', time: '2 hours ago', type: 'view' },
                    { event: 'Applied to Senior Developer position', time: '1 day ago', type: 'application' },
                    { event: 'Resume analysis completed', time: '2 days ago', type: 'analysis' },
                    { event: 'Skills assessment updated', time: '3 days ago', type: 'skill' },
                  ].map((item, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== 3 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              item.type === 'view' ? 'bg-blue-500' :
                              item.type === 'application' ? 'bg-green-500' :
                              item.type === 'analysis' ? 'bg-purple-500' : 'bg-orange-500'
                            }`}>
                              {item.type === 'view' && <EyeIcon className="h-4 w-4 text-white" />}
                              {item.type === 'application' && <BriefcaseIcon className="h-4 w-4 text-white" />}
                              {item.type === 'analysis' && <DocumentTextIcon className="h-4 w-4 text-white" />}
                              {item.type === 'skill' && <SparklesIcon className="h-4 w-4 text-white" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">{item.event}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time>{item.time}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
