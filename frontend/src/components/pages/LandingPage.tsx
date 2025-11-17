'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  BriefcaseIcon, 
  AcademicCapIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'AI Resume Analysis',
    description: 'Get detailed feedback on your resume with AI-powered analysis that identifies strengths, weaknesses, and improvement suggestions.',
    icon: DocumentTextIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'Smart Job Matching',
    description: 'Find the perfect job opportunities based on your skills, experience, and preferences using our intelligent matching algorithm.',
    icon: BriefcaseIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Placement Analytics',
    description: 'Access comprehensive placement statistics and market insights to make informed career decisions.',
    icon: ChartBarIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Learning Recommendations',
    description: 'Receive personalized course and skill recommendations to bridge gaps and enhance your career prospects.',
    icon: AcademicCapIcon,
    color: 'bg-orange-500',
  },
];

const stats = [
  { name: 'Resumes Analyzed', value: '10,000+' },
  { name: 'Job Matches Made', value: '5,000+' },
  { name: 'Success Rate', value: '85%' },
  { name: 'Companies', value: '500+' },
];

export function LandingPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI Career Portal</span>
            </div>
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
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Career with{' '}
              <span className="text-blue-600">AI-Powered</span> Insights
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Analyze your resume, discover perfect job matches, and get personalized career guidance 
              with our advanced AI technology. Your dream career is just one click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center"
              >
                Start Your Journey
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/demo" 
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.name} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-gray-600 mt-2">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Your Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to accelerate your career growth
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Resume</h3>
              <p className="text-gray-600">
                Simply upload your resume and let our AI analyze it for strengths and areas of improvement.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get AI Insights</h3>
              <p className="text-gray-600">
                Receive detailed feedback, skill gap analysis, and personalized recommendations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Perfect Jobs</h3>
              <p className="text-gray-600">
                Discover job opportunities that match your skills and career aspirations.
              </p>
            </div>
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
          <Link 
            href="/register" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg inline-flex items-center"
          >
            Get Started Free
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <SparklesIcon className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">AI Career Portal</span>
              </div>
              <p className="text-gray-400">
                Empowering careers with AI-driven insights and personalized guidance.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Resume Analysis</li>
                <li>Job Matching</li>
                <li>Career Insights</li>
                <li>Skill Recommendations</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Career Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
