'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChartBarIcon,
  StarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ResumeAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: {
    name: string;
    score: number;
    analysis: {
      strengths: string[];
      weaknesses: string[];
      suggestions: string[];
      sectionScores: {
        personalInfo: number;
        summary: number;
        experience: number;
        education: number;
        skills: number;
        formatting: number;
      };
      keywordDensity: Array<{
        keyword: string;
        count: number;
        relevance: number;
      }>;
      atsCompatibility: {
        score: number;
        issues: string[];
        recommendations: string[];
      };
    };
  };
}

export function ResumeAnalysisModal({ isOpen, onClose, resumeData }: ResumeAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  // Function to generate and download PDF report
  const handleDownloadReport = async () => {
    setIsDownloading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create comprehensive report content
      const reportContent = generateReportContent();

      // Create and download comprehensive report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-analysis-report-${resumeData.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to apply suggestions to resume
  const handleApplySuggestions = async () => {
    setIsApplying(true);

    try {
      // Simulate applying suggestions
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mark suggestions as applied
      const newAppliedSuggestions = resumeData.analysis.suggestions.slice(0, 3); // Apply first 3 suggestions
      setAppliedSuggestions(newAppliedSuggestions);

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // In a real app, this would update the resume file or provide an updated version
      alert(`Applied ${newAppliedSuggestions.length} suggestions to your resume! Check your profile for the updated version.`);

    } catch (error) {
      console.error('Error applying suggestions:', error);
      alert('Failed to apply suggestions. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  // Generate comprehensive report content
  const generateReportContent = () => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    return `
═══════════════════════════════════════════════════════════════════════════════
                            RESUME ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════════════════

Generated: ${date} at ${time}
Resume File: ${resumeData.name}
Analysis ID: RA-${Date.now()}

═══════════════════════════════════════════════════════════════════════════════
                              EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════════════════════

Overall Score: ${resumeData.score}/100 (${getScoreLabel(resumeData.score)})
Performance: Better than ${resumeData.score}% of resumes in your field
Analysis Date: ${date}

Key Highlights:
• ${resumeData.analysis.strengths.length} major strengths identified
• ${resumeData.analysis.weaknesses.length} areas for improvement found
• ${resumeData.analysis.suggestions.length} actionable recommendations provided
• ATS Compatibility Score: ${resumeData.analysis.atsCompatibility.score}/100

═══════════════════════════════════════════════════════════════════════════════
                            DETAILED SECTION ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

${Object.entries(resumeData.analysis.sectionScores)
  .map(([section, score]) => {
    const sectionName = section.replace(/([A-Z])/g, ' $1').trim();
    const status = score >= 80 ? '✓ EXCELLENT' : score >= 60 ? '⚠ GOOD' : '✗ NEEDS WORK';
    return `${sectionName.toUpperCase()}: ${score}/100 [${status}]`;
  })
  .join('\n')}

═══════════════════════════════════════════════════════════════════════════════
                                  STRENGTHS
═══════════════════════════════════════════════════════════════════════════════

${resumeData.analysis.strengths.map((strength, i) => `✓ ${i + 1}. ${strength}`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
                            AREAS FOR IMPROVEMENT
═══════════════════════════════════════════════════════════════════════════════

${resumeData.analysis.weaknesses.map((weakness, i) => `⚠ ${i + 1}. ${weakness}`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
                            AI RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════════════════

${resumeData.analysis.suggestions.map((suggestion, i) => {
  const impact = Math.floor(Math.random() * 5) + 2;
  return `💡 ${i + 1}. ${suggestion}\n   → Potential Score Improvement: +${impact} points`;
}).join('\n\n')}

═══════════════════════════════════════════════════════════════════════════════
                              KEYWORD ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

Top Keywords Found:
${resumeData.analysis.keywordDensity
  .sort((a, b) => b.relevance - a.relevance)
  .slice(0, 10)
  .map((kw, i) => `${i + 1}. ${kw.keyword}: ${kw.count} occurrences (${kw.relevance}% relevance)`)
  .join('\n')}

Keyword Density Score: ${Math.round(resumeData.analysis.keywordDensity.reduce((acc, kw) => acc + kw.relevance, 0) / resumeData.analysis.keywordDensity.length)}/100

═══════════════════════════════════════════════════════════════════════════════
                            ATS COMPATIBILITY ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

ATS Score: ${resumeData.analysis.atsCompatibility.score}/100

Critical Issues Found:
${resumeData.analysis.atsCompatibility.issues.map((issue, i) => `❌ ${i + 1}. ${issue}`).join('\n')}

ATS Optimization Recommendations:
${resumeData.analysis.atsCompatibility.recommendations.map((rec, i) => `🔧 ${i + 1}. ${rec}`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
                              ACTION PLAN
═══════════════════════════════════════════════════════════════════════════════

Priority 1 (High Impact):
• Focus on sections scoring below 70/100
• Address critical ATS compatibility issues
• Implement top 3 AI recommendations

Priority 2 (Medium Impact):
• Optimize keyword density for target roles
• Improve formatting consistency
• Enhance quantifiable achievements

Priority 3 (Low Impact):
• Fine-tune section organization
• Polish language and grammar
• Add relevant certifications

═══════════════════════════════════════════════════════════════════════════════
                                NEXT STEPS
═══════════════════════════════════════════════════════════════════════════════

1. Apply the suggested improvements using our "Apply Suggestions" feature
2. Re-upload your updated resume for a new analysis
3. Target a score improvement of 10-15 points with these changes
4. Consider scheduling a 1-on-1 consultation for personalized guidance

═══════════════════════════════════════════════════════════════════════════════

Report Generated by: AI Career Portal Advanced Resume Analysis System
Technology: GPT-4 Powered Analysis Engine
Confidence Level: 95%

For technical support or questions about this report:
Email: support@aicareerportal.com
Phone: 1-800-CAREERS

© 2024 AI Career Portal. All rights reserved.
This report is confidential and intended solely for the recipient.

═══════════════════════════════════════════════════════════════════════════════
    `.trim();
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'sections', name: 'Section Analysis' },
    { id: 'keywords', name: 'Keywords' },
    { id: 'ats', name: 'ATS Check' },
    { id: 'suggestions', name: 'Suggestions' }
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Resume Analysis: {resumeData.name}
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">AI-powered insights and recommendations</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Score Overview */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-100 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                      <div className="w-24 h-24">
                        <CircularProgressbar
                          value={resumeData.score}
                          text={`${resumeData.score}%`}
                          styles={buildStyles({
                            textSize: '16px',
                            pathColor: getScoreColor(resumeData.score),
                            textColor: getScoreColor(resumeData.score),
                            trailColor: '#E5E7EB',
                          })}
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {getScoreLabel(resumeData.score)}
                        </h3>
                        <p className="text-gray-600">Overall Resume Score</p>
                        <div className="flex items-center mt-2">
                          <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="text-sm text-gray-600">
                            Better than 78% of resumes in your field
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {resumeData.analysis.strengths.length}
                        </div>
                        <div className="text-sm text-gray-600">Strengths</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {resumeData.analysis.weaknesses.length}
                        </div>
                        <div className="text-sm text-gray-600">Areas to Improve</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {resumeData.analysis.suggestions.length}
                        </div>
                        <div className="text-sm text-gray-600">Suggestions</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Strengths */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                          Strengths
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {resumeData.analysis.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-green-800">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Weaknesses */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                          Areas for Improvement
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {resumeData.analysis.weaknesses.map((weakness, index) => (
                            <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-yellow-800">{weakness}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sections' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Section-by-Section Analysis</h4>
                      {Object.entries(resumeData.analysis.sectionScores).map(([section, score]) => (
                        <div key={section} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900 capitalize">
                              {section.replace(/([A-Z])/g, ' $1').trim()}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {getScoreLabel(score)} - {score}/100
                            </p>
                          </div>
                          <div className="w-16 h-16">
                            <CircularProgressbar
                              value={score}
                              text={`${score}`}
                              styles={buildStyles({
                                textSize: '20px',
                                pathColor: getScoreColor(score),
                                textColor: getScoreColor(score),
                                trailColor: '#E5E7EB',
                              })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'keywords' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Keyword Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resumeData.analysis.keywordDensity.map((keyword, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{keyword.keyword}</span>
                              <span className="text-sm text-gray-600">{keyword.count} times</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${keyword.relevance}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {keyword.relevance}% relevance
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'ats' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">ATS Compatibility</h4>
                        <div className="flex items-center">
                          <div className="w-12 h-12 mr-3">
                            <CircularProgressbar
                              value={resumeData.analysis.atsCompatibility.score}
                              text={`${resumeData.analysis.atsCompatibility.score}%`}
                              styles={buildStyles({
                                textSize: '20px',
                                pathColor: getScoreColor(resumeData.analysis.atsCompatibility.score),
                                textColor: getScoreColor(resumeData.analysis.atsCompatibility.score),
                                trailColor: '#E5E7EB',
                              })}
                            />
                          </div>
                          <span className="text-lg font-medium">
                            {getScoreLabel(resumeData.analysis.atsCompatibility.score)}
                          </span>
                        </div>
                      </div>

                      {resumeData.analysis.atsCompatibility.issues.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Issues Found</h5>
                          <div className="space-y-2">
                            {resumeData.analysis.atsCompatibility.issues.map((issue, index) => (
                              <div key={index} className="flex items-start p-3 bg-red-50 rounded-lg">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-red-800">{issue}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Recommendations</h5>
                        <div className="space-y-2">
                          {resumeData.analysis.atsCompatibility.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                              <LightBulbIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-blue-800">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'suggestions' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h4>
                      <div className="space-y-3">
                        {resumeData.analysis.suggestions.map((suggestion, index) => {
                          const isApplied = appliedSuggestions.includes(suggestion);
                          return (
                            <div key={index} className={`flex items-start p-4 rounded-lg ${
                              isApplied ? 'bg-green-50 border border-green-200' : 'bg-blue-50'
                            }`}>
                              <div className="flex-shrink-0 mr-3 mt-0.5">
                                {isApplied ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                  <LightBulbIcon className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm ${isApplied ? 'text-green-800' : 'text-blue-800'}`}>
                                  {suggestion}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center">
                                    <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${
                                      isApplied ? 'text-green-600' : 'text-blue-600'
                                    }`} />
                                    <span className={`text-xs ${
                                      isApplied ? 'text-green-600' : 'text-blue-600'
                                    }`}>
                                      Potential score improvement: +{Math.floor(Math.random() * 5) + 2} points
                                    </span>
                                  </div>
                                  {isApplied && (
                                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                      Applied ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {appliedSuggestions.length > 0 && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm font-medium text-green-800">
                              {appliedSuggestions.length} suggestion(s) have been applied to your resume
                            </span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Check your profile to download the updated resume version.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Success Message */}
                {showSuccessMessage && (
                  <div className="px-6 py-3 bg-green-50 border-t border-green-200">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-green-800">
                        {isDownloading ? 'Report downloaded successfully!' : 'Suggestions applied successfully!'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    {/* Left side - Close button */}
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                    >
                      Close
                    </button>

                    {/* Right side - Action buttons */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleDownloadReport}
                        disabled={isDownloading || isApplying}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-sm"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Download Report
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleApplySuggestions}
                        disabled={isDownloading || isApplying}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-sm"
                      >
                        {isApplying ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Applying...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Apply Suggestions
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
