'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  SparklesIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UserIcon,
  PlayIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'AI Resume Analysis',
    description: 'Upload your resume and get instant AI-powered feedback with detailed insights and improvement suggestions.',
    icon: DocumentTextIcon,
    color: 'bg-blue-500',
    demo: 'resume-analysis'
  },
  {
    name: 'Smart Job Matching',
    description: 'Discover personalized job opportunities that match your skills, experience, and career preferences.',
    icon: BriefcaseIcon,
    color: 'bg-green-500',
    demo: 'job-matching'
  },
  {
    name: 'Career Analytics',
    description: 'Track your career progress with comprehensive analytics and insights to optimize your job search.',
    icon: ChartBarIcon,
    color: 'bg-purple-500',
    demo: 'analytics'
  },
  {
    name: 'Profile Management',
    description: 'Build a comprehensive professional profile that showcases your skills and experience.',
    icon: UserIcon,
    color: 'bg-orange-500',
    demo: 'profile'
  }
];

const demoSteps = [
  {
    step: 1,
    title: 'Upload Your Resume',
    description: 'Simply drag and drop your resume or click to browse. We support PDF, DOC, and DOCX formats.',
    image: '/demo/upload.png'
  },
  {
    step: 2,
    title: 'AI Analysis',
    description: 'Our AI analyzes your resume for strengths, weaknesses, ATS compatibility, and keyword optimization.',
    image: '/demo/analysis.png'
  },
  {
    step: 3,
    title: 'Get Recommendations',
    description: 'Receive personalized suggestions to improve your resume and increase your job match score.',
    image: '/demo/recommendations.png'
  },
  {
    step: 4,
    title: 'Find Perfect Jobs',
    description: 'Browse AI-matched job opportunities tailored to your skills and career preferences.',
    image: '/demo/jobs.png'
  }
];

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState('resume-analysis');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI Career Portal</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Experience the Future of{' '}
            <span className="text-blue-600">Career Development</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            See how our AI-powered platform transforms your career journey with intelligent resume analysis, 
            personalized job matching, and comprehensive career insights.
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center mx-auto">
            <PlayIcon className="h-6 w-6 mr-2" />
            Watch Interactive Demo
          </button>
        </div>
      </section>

      {/* Features Demo */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our AI-Powered Features
            </h2>
            <p className="text-xl text-gray-600">
              Click on any feature to see it in action
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {features.map((feature) => (
              <button
                key={feature.demo}
                onClick={() => setActiveDemo(feature.demo)}
                className={`p-6 rounded-xl text-left transition-all transform hover:scale-105 ${
                  activeDemo === feature.demo
                    ? 'bg-blue-50 border-2 border-blue-200 shadow-lg'
                    : 'bg-white border border-gray-200 hover:shadow-md'
                }`}
              >
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
                {activeDemo === feature.demo && (
                  <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Active Demo
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Demo Content */}
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="bg-white rounded-lg p-8 text-left">
                {activeDemo === 'resume-analysis' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Resume Analysis Demo</h3>
                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                        <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-4" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Resume Uploaded: Software_Engineer_Resume.pdf</h4>
                          <p className="text-gray-600">AI Analysis Score: 85/100</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">5</div>
                          <div className="text-sm text-gray-600">Strengths Found</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">3</div>
                          <div className="text-sm text-gray-600">Areas to Improve</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">78%</div>
                          <div className="text-sm text-gray-600">ATS Compatible</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDemo === 'job-matching' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Job Matching Demo</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">Senior Frontend Developer</h4>
                          <p className="text-gray-600">TechCorp Inc. • San Francisco, CA</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">95% Match</div>
                          <div className="text-sm text-gray-500">Perfect Fit</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded">
                          <h5 className="font-medium text-blue-900">Matching Skills</h5>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {['React', 'TypeScript', 'Node.js'].map(skill => (
                              <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded">
                          <h5 className="font-medium text-yellow-900">Skills to Learn</h5>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {['AWS', 'Docker'].map(skill => (
                              <span key={skill} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDemo === 'analytics' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Analytics Demo</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">328</div>
                        <div className="text-sm text-gray-600">Profile Views</div>
                        <div className="text-xs text-green-600 mt-1">↑ +12%</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">24</div>
                        <div className="text-sm text-gray-600">Applications</div>
                        <div className="text-xs text-green-600 mt-1">↑ +8%</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">7</div>
                        <div className="text-sm text-gray-600">Interviews</div>
                        <div className="text-xs text-green-600 mt-1">↑ +15%</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">85%</div>
                        <div className="text-sm text-gray-600">Match Score</div>
                        <div className="text-xs text-green-600 mt-1">↑ +3%</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDemo === 'profile' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Profile Management Demo</h3>
                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                          JD
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">John Doe</h4>
                          <p className="text-gray-600">Senior Software Engineer</p>
                          <div className="flex items-center mt-1">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <span className="text-sm text-gray-600">85% Complete</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-lg font-bold text-green-600">12</div>
                          <div className="text-xs text-gray-600">Skills Added</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-lg font-bold text-blue-600">3</div>
                          <div className="text-xs text-gray-600">Work Experience</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="text-lg font-bold text-purple-600">2</div>
                          <div className="text-xs text-gray-600">Certifications</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              This is a live demo of our AI-powered features. 
              <Link href="/register" className="text-blue-400 hover:text-blue-300 ml-1">
                Sign up to try it yourself →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {demoSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have already accelerated their careers with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg inline-flex items-center justify-center"
            >
              Get Started Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/login" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
