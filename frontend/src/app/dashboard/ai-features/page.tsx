'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockAIService } from '@/services/mockDataService';
import {
  SparklesIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartLineIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const aiFeatures = [
  {
    id: 'resume-analysis',
    name: 'AI Resume Analysis',
    description: 'Get comprehensive feedback on your resume with AI-powered insights',
    icon: DocumentTextIcon,
    color: 'bg-blue-500',
    demo: true
  },
  {
    id: 'job-matching',
    name: 'Smart Job Matching',
    description: 'Find personalized job opportunities based on your profile',
    icon: BriefcaseIcon,
    color: 'bg-green-500',
    demo: true
  },
  {
    id: 'interview-prep',
    name: 'Interview Questions',
    description: 'Generate tailored interview questions for any job position',
    icon: ChatBubbleLeftRightIcon,
    color: 'bg-purple-500',
    demo: true
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter Generator',
    description: 'Create compelling cover letters tailored to specific jobs',
    icon: DocumentTextIcon,
    color: 'bg-orange-500',
    demo: true
  },
  {
    id: 'market-analysis',
    name: 'Job Market Analysis',
    description: 'Get insights into job market trends and salary data',
    icon: PresentationChartLineIcon,
    color: 'bg-indigo-500',
    demo: true
  },
  {
    id: 'career-path',
    name: 'Career Path Planning',
    description: 'Receive personalized career guidance and skill recommendations',
    icon: RocketLaunchIcon,
    color: 'bg-pink-500',
    demo: true
  }
];

export default function AIFeaturesPage() {
  const [activeFeature, setActiveFeature] = useState('resume-analysis');
  const [loading, setLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);

  const runDemo = async (featureId: string) => {
    setLoading(true);
    setDemoResult(null);

    try {
      let result;
      switch (featureId) {
        case 'resume-analysis':
          result = await mockAIService.getResumeAnalysis('1');
          break;
        case 'job-matching':
          result = await mockAIService.getAIJobMatches();
          break;
        case 'interview-prep':
          result = await mockAIService.generateInterviewQuestions('1', ['React', 'TypeScript']);
          break;
        case 'cover-letter':
          result = await mockAIService.generateCoverLetter('1');
          break;
        case 'market-analysis':
          result = await mockAIService.getMarketAnalysis('Technology', 'San Francisco');
          break;
        case 'career-path':
          result = {
            shortTermGoals: ['Master React ecosystem', 'Learn TypeScript', 'Build portfolio projects'],
            longTermGoals: ['Become Senior Developer', 'Lead development team', 'Contribute to open source'],
            skillsToLearn: [
              { skill: 'AWS', priority: 'high', reason: 'High demand in job market', resources: ['AWS Documentation', 'Cloud Practitioner Course'] },
              { skill: 'Docker', priority: 'medium', reason: 'DevOps integration', resources: ['Docker Tutorial', 'Kubernetes Basics'] }
            ],
            actionPlan: ['Complete AWS certification', 'Build 3 full-stack projects', 'Contribute to open source']
          };
          break;
        default:
          result = { message: 'Demo not available' };
      }
      setDemoResult(result);
    } catch (error) {
      console.error('Demo failed:', error);
      setDemoResult({ error: 'Demo failed to load' });
    } finally {
      setLoading(false);
    }
  };

  const renderDemoResult = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">AI is analyzing...</span>
        </div>
      );
    }

    if (!demoResult) {
      return (
        <div className="text-center py-12 text-gray-500">
          <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Click "Run Demo" to see AI in action</p>
        </div>
      );
    }

    if (demoResult.error) {
      return (
        <div className="text-center py-12 text-red-500">
          <p>Error: {demoResult.error}</p>
        </div>
      );
    }

    switch (activeFeature) {
      case 'resume-analysis':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900">Overall Score: {demoResult.overallScore}%</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">Strengths</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  {demoResult.strengths?.slice(0, 3).map((strength: string, index: number) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2">Improvements</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {demoResult.suggestions?.slice(0, 3).map((suggestion: string, index: number) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'job-matching':
        return (
          <div className="space-y-4">
            {demoResult.jobs?.slice(0, 2).map((job: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{job.title}</h4>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {job.aiMatch?.matchScore}% Match
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{job.company?.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.aiMatch?.matchingSkills?.slice(0, 3).map((skill: string, skillIndex: number) => (
                    <span key={skillIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'interview-prep':
        return (
          <div className="space-y-4">
            {demoResult.questions?.slice(0, 2).map((q: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    q.type === 'technical' ? 'bg-blue-100 text-blue-800' :
                    q.type === 'behavioral' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {q.type}
                  </span>
                  <span className="text-sm text-gray-500">{q.difficulty}</span>
                </div>
                <p className="font-medium mb-2">{q.question}</p>
                <p className="text-sm text-gray-600">{q.sampleAnswer}</p>
              </div>
            ))}
          </div>
        );

      case 'cover-letter':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Generated Cover Letter</h4>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {demoResult.coverLetter?.substring(0, 300)}...
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <h5 className="font-medium text-blue-800 mb-1">Key Points</h5>
                <ul className="text-sm text-blue-700">
                  {demoResult.keyPoints?.map((point: string, index: number) => (
                    <li key={index}>• {point}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <h5 className="font-medium text-green-800 mb-1">Tone</h5>
                <p className="text-sm text-green-700 capitalize">{demoResult.tone}</p>
              </div>
            </div>
          </div>
        );

      case 'market-analysis':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded text-center">
                <div className="text-lg font-bold text-blue-600">{demoResult.totalJobs}</div>
                <div className="text-xs text-blue-600">Total Jobs</div>
              </div>
              <div className="bg-green-50 p-3 rounded text-center">
                <div className="text-lg font-bold text-green-600 capitalize">{demoResult.marketHealth}</div>
                <div className="text-xs text-green-600">Market Health</div>
              </div>
              <div className="bg-purple-50 p-3 rounded text-center">
                <div className="text-lg font-bold text-purple-600">{demoResult.averageSalary}</div>
                <div className="text-xs text-purple-600">Avg Salary</div>
              </div>
              <div className="bg-orange-50 p-3 rounded text-center">
                <div className="text-lg font-bold text-orange-600 capitalize">{demoResult.competitionLevel}</div>
                <div className="text-xs text-orange-600">Competition</div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Top Skills in Demand</h5>
              <div className="flex flex-wrap gap-2">
                {demoResult.topSkills?.map((skill: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'career-path':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">Short-term Goals</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  {demoResult.shortTermGoals?.map((goal: string, index: number) => (
                    <li key={index}>• {goal}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">Long-term Goals</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  {demoResult.longTermGoals?.map((goal: string, index: number) => (
                    <li key={index}>• {goal}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h5 className="font-medium text-purple-800 mb-2">Skills to Learn</h5>
              <div className="space-y-2">
                {demoResult.skillsToLearn?.map((skill: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      skill.priority === 'high' ? 'bg-red-100 text-red-800' :
                      skill.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {skill.priority} priority
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Demo result not available</div>;
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
              AI-Powered Features
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Explore our advanced AI capabilities that transform your career journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feature List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">AI Features</h3>
                </div>
                <div className="space-y-1 p-2">
                  {aiFeatures.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(feature.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        activeFeature === feature.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`${feature.color} p-2 rounded-lg mr-3`}>
                          <feature.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{feature.name}</div>
                          <div className="text-sm text-gray-600">{feature.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Demo Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {aiFeatures.find(f => f.id === activeFeature)?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {aiFeatures.find(f => f.id === activeFeature)?.description}
                      </p>
                    </div>
                    <button
                      onClick={() => runDemo(activeFeature)}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      {loading ? 'Running...' : 'Run Demo'}
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {renderDemoResult()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
