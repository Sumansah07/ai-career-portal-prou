'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { aiService } from '@/services/aiService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  DocumentTextIcon,
  BriefcaseIcon,
  ChartBarIcon,
  EyeIcon,
  UserIcon,
  TrophyIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  BookOpenIcon,
  AcademicCapIcon,
  LightBulbIcon,
  FireIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface StudentStats {
  resumesUploaded: number;
  jobMatches: number;
  profileViews: number;
  avgMatchScore: number;
  applications: number;
  interviews: number;
}

interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  salary: string;
  type: string;
  postedDate: string;
}

interface ApplicationStatus {
  id: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'reviewing' | 'interview' | 'rejected' | 'offered';
  appliedDate: string;
  lastUpdate: string;
}

interface SkillProgress {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
}

interface LearningRecommendation {
  id: string;
  title: string;
  type: 'course' | 'certification' | 'skill';
  provider: string;
  duration: string;
  relevance: number;
}

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<StudentStats>({
    resumesUploaded: 0,
    jobMatches: 0,
    profileViews: 0,
    avgMatchScore: 0,
    applications: 0,
    interviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for enhanced dashboard
  const [recommendedJobs] = useState<RecommendedJob[]>([
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      matchScore: 95,
      salary: '$80k - $120k',
      type: 'Full-time',
      postedDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'React Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      matchScore: 88,
      salary: '$70k - $100k',
      type: 'Full-time',
      postedDate: '2024-01-14'
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      company: 'Design Studio',
      location: 'New York, NY',
      matchScore: 82,
      salary: '$65k - $90k',
      type: 'Contract',
      postedDate: '2024-01-13'
    }
  ]);

  const [applicationStatuses] = useState<ApplicationStatus[]>([
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      company: 'Google',
      status: 'interview',
      appliedDate: '2024-01-10',
      lastUpdate: '2024-01-15'
    },
    {
      id: '2',
      jobTitle: 'React Developer',
      company: 'Facebook',
      status: 'reviewing',
      appliedDate: '2024-01-08',
      lastUpdate: '2024-01-12'
    },
    {
      id: '3',
      jobTitle: 'Full Stack Developer',
      company: 'Netflix',
      status: 'applied',
      appliedDate: '2024-01-05',
      lastUpdate: '2024-01-05'
    }
  ]);

  const [skillProgress] = useState<SkillProgress[]>([
    { skill: 'React', currentLevel: 7, targetLevel: 9, progress: 78 },
    { skill: 'TypeScript', currentLevel: 6, targetLevel: 8, progress: 75 },
    { skill: 'Node.js', currentLevel: 5, targetLevel: 8, progress: 63 },
    { skill: 'Python', currentLevel: 4, targetLevel: 7, progress: 57 }
  ]);

  const [learningRecommendations] = useState<LearningRecommendation[]>([
    {
      id: '1',
      title: 'Advanced React Patterns',
      type: 'course',
      provider: 'Udemy',
      duration: '8 hours',
      relevance: 95
    },
    {
      id: '2',
      title: 'AWS Cloud Practitioner',
      type: 'certification',
      provider: 'AWS',
      duration: '40 hours',
      relevance: 88
    },
    {
      id: '3',
      title: 'System Design Fundamentals',
      type: 'skill',
      provider: 'Coursera',
      duration: '12 hours',
      relevance: 82
    }
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/shared/auth/login');
      return;
    }

    if (user?.role !== 'student') {
      setError('Access denied. This feature is only available to students.');
      return;
    }

    fetchStudentData();
  }, [isAuthenticated, user, router]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const userStats = await aiService.getUserStats();
      
      setStats({
        resumesUploaded: userStats.resumes?.total || 0,
        jobMatches: userStats.jobMatches?.total || 0,
        profileViews: userStats.profileViews || 0,
        avgMatchScore: userStats.resumes?.averageScore || 0,
        applications: userStats.applications || 0,
        interviews: userStats.interviews || 0
      });
      
    } catch (error) {
      console.error('Error fetching student data:', error);
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
      name: 'Resumes Uploaded',
      value: stats.resumesUploaded.toString(),
      change: '+1',
      changeType: 'increase',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      description: 'Total resumes analyzed'
    },
    {
      name: 'Job Matches',
      value: stats.jobMatches.toString(),
      change: '+5',
      changeType: 'increase',
      icon: BriefcaseIcon,
      color: 'bg-green-500',
      description: 'Personalized job recommendations'
    },
    {
      name: 'Applications',
      value: stats.applications.toString(),
      change: '+2',
      changeType: 'increase',
      icon: UserIcon,
      color: 'bg-purple-500',
      description: 'Job applications submitted'
    },
    {
      name: 'Avg. Match Score',
      value: `${stats.avgMatchScore}%`,
      change: '+3%',
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      description: 'Average job compatibility'
    },
    {
      name: 'Profile Views',
      value: stats.profileViews.toString(),
      change: '+8',
      changeType: 'increase',
      icon: EyeIcon,
      color: 'bg-indigo-500',
      description: 'Recruiter profile views'
    },
    {
      name: 'Interviews',
      value: stats.interviews.toString(),
      change: '+1',
      changeType: 'increase',
      icon: TrophyIcon,
      color: 'bg-pink-500',
      description: 'Interview invitations'
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Student Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName}! Here's your career journey overview
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
          {/* Left Column - Recommended Jobs & Application Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recommended Jobs */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recommended Jobs</h3>
                  <FireIcon className="h-5 w-5 text-orange-500" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recommendedJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">{job.location}</span>
                            <span className="text-xs text-gray-500">{job.salary}</span>
                            <span className="text-xs text-gray-500">{job.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <StarIcon className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900">{job.matchScore}%</span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800">
                            <ArrowRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/student/jobs')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all jobs →
                  </button>
                </div>
              </div>
            </div>

            {/* Application Status */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Application Status</h3>
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {applicationStatuses.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{application.jobTitle}</h4>
                        <p className="text-sm text-gray-600">{application.company}</p>
                        <p className="text-xs text-gray-500 mt-1">Applied {application.appliedDate}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          application.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'interview' ? 'bg-green-100 text-green-800' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {application.status}
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
                    onClick={() => router.push('/student/applications')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all applications →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Skill Progress & Learning */}
          <div className="space-y-6">
            {/* Skill Progress */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Skill Progress</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {skillProgress.map((skill) => (
                    <div key={skill.skill}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                        <span className="text-xs text-gray-500">{skill.currentLevel}/{skill.targetLevel}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${skill.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Update skills →
                  </button>
                </div>
              </div>
            </div>

            {/* Learning Recommendations */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Learning Recommendations</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {learningRecommendations.map((recommendation) => (
                    <div key={recommendation.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        recommendation.type === 'course' ? 'bg-blue-100' :
                        recommendation.type === 'certification' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        {recommendation.type === 'course' && <BookOpenIcon className="h-4 w-4 text-blue-600" />}
                        {recommendation.type === 'certification' && <AcademicCapIcon className="h-4 w-4 text-green-600" />}
                        {recommendation.type === 'skill' && <LightBulbIcon className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{recommendation.title}</p>
                        <p className="text-xs text-gray-500">{recommendation.provider} • {recommendation.duration}</p>
                        <div className="flex items-center mt-1">
                          <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-xs text-gray-600">{recommendation.relevance}% relevant</span>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View all recommendations →
                  </button>
                </div>
              </div>
            </div>

            {/* Career Tip */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-900 mb-2">Career Tip</h4>
                    <p className="text-sm text-green-800">
                      Update your resume regularly and tailor it for each application.
                      Customized resumes get 40% more responses from recruiters.
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
