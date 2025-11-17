'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/services/aiService';
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface JobFormData {
  title: string;
  company: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  requirements: string;
  benefits: string;
  skills: string[];
  applicationDeadline: string;
}

export default function PostJobPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    workMode: 'remote',
    employmentType: 'full-time',
    experience: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    benefits: '',
    skills: [],
    applicationDeadline: ''
  });

  const [skillInput, setSkillInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map employment type to match backend enum
      const mapEmploymentType = (type: string) => {
        const mapping: { [key: string]: string } = {
          'full-time': 'Full-time',
          'part-time': 'Part-time',
          'contract': 'Contract',
          'internship': 'Internship'
        };
        return mapping[type] || 'Full-time';
      };

      // Map work mode to match backend enum
      const mapWorkMode = (mode: string) => {
        const mapping: { [key: string]: string } = {
          'remote': 'Remote',
          'onsite': 'On-site',
          'hybrid': 'Hybrid'
        };
        return mapping[mode] || 'On-site';
      };

      const jobData = {
        title: formData.title,
        company: {
          name: formData.company,
          location: {
            city: formData.location,
            isRemote: formData.workMode === 'remote'
          }
        },
        description: formData.description,
        employmentType: mapEmploymentType(formData.employmentType),
        workMode: mapWorkMode(formData.workMode),
        requirements: {
          experience: {
            min: 0,
            level: 'Entry Level'
          },
          skills: formData.skills.map(skill => ({
            name: skill,
            level: 'Basic',
            isRequired: true
          }))
        },
        responsibilities: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : [],
        benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : [],
        salary: formData.salaryMin || formData.salaryMax ? {
          min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
          max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
          currency: 'USD',
          period: 'yearly'
        } : undefined,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : undefined
      };

      console.log('Sending job data:', jobData);
      await aiService.createJob(jobData);
      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          title: '',
          company: '',
          location: '',
          workMode: 'remote',
          employmentType: 'full-time',
          experience: '',
          salaryMin: '',
          salaryMax: '',
          description: '',
          requirements: '',
          benefits: '',
          skills: [],
          applicationDeadline: ''
        });
      }, 3000);
    } catch (error: any) {
      console.error('Error posting job:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to post job';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
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

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Posted Successfully!</h2>
            <p className="text-gray-600">Your job posting is now live and candidates can apply.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-blue-600 mr-3" />
              Post New Job
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Create a new job posting to attract top talent
            </p>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. TechCorp Inc."
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>

                <div>
                  <label htmlFor="workMode" className="block text-sm font-medium text-gray-700 mb-2">
                    Work Mode *
                  </label>
                  <select
                    id="workMode"
                    name="workMode"
                    required
                    value={formData.workMode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type *
                  </label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    required
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <input
                    type="text"
                    id="experience"
                    name="experience"
                    required
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 3-5 years"
                  />
                </div>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Salary (Annual)
                  </label>
                  <input
                    type="number"
                    id="salaryMin"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 80000"
                  />
                </div>

                <div>
                  <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Salary (Annual)
                  </label>
                  <input
                    type="number"
                    id="salaryMax"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 120000"
                  />
                </div>
              </div>

              {/* Application Deadline */}
              <div>
                <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                />
              </div>

              {/* Requirements */}
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements *
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  required
                  rows={4}
                  value={formData.requirements}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List the required qualifications, experience, and skills..."
                />
              </div>

              {/* Benefits */}
              <div>
                <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits & Perks
                </label>
                <textarea
                  id="benefits"
                  name="benefits"
                  rows={3}
                  value={formData.benefits}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Health insurance, remote work, flexible hours, etc..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting Job...
                    </>
                  ) : (
                    <>
                      <BriefcaseIcon className="h-4 w-4 mr-2" />
                      Post Job
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
