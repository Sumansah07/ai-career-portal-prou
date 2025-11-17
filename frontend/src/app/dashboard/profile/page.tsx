'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  UserIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  LinkIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);

  const [experiences] = useState<Experience[]>([
    {
      id: '1',
      company: 'TechCorp Inc.',
      position: 'Frontend Developer',
      startDate: '2022-01',
      endDate: '2024-01',
      current: false,
      description: 'Developed responsive web applications using React and TypeScript...'
    },
    {
      id: '2',
      company: 'StartupXYZ',
      position: 'Junior Developer',
      startDate: '2021-06',
      endDate: '2021-12',
      current: false,
      description: 'Built full-stack applications using Node.js and MongoDB...'
    }
  ]);

  const [education] = useState<Education[]>([
    {
      id: '1',
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2018-09',
      endDate: '2022-05',
      gpa: '3.8'
    }
  ]);

  const [skills] = useState<Skill[]>([
    { id: '1', name: 'React', level: 'Advanced', category: 'Frontend' },
    { id: '2', name: 'TypeScript', level: 'Advanced', category: 'Programming' },
    { id: '3', name: 'Node.js', level: 'Intermediate', category: 'Backend' },
    { id: '4', name: 'Python', level: 'Intermediate', category: 'Programming' },
    { id: '5', name: 'AWS', level: 'Beginner', category: 'Cloud' },
  ]);

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: UserIcon },
    { id: 'experience', name: 'Experience', icon: BriefcaseIcon },
    { id: 'education', name: 'Education', icon: AcademicCapIcon },
    { id: 'skills', name: 'Skills', icon: StarIcon },
  ];

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-green-100 text-green-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Beginner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your personal information and career details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                {/* Profile Photo */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <img
                      className="w-24 h-24 rounded-full mx-auto"
                      src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=3B82F6&color=fff&size=96`}
                      alt="Profile"
                    />
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profile Completion</span>
                    <span className="text-sm font-medium text-blue-600">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Profile Views</span>
                      <span className="text-sm font-medium">89</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Job Matches</span>
                      <span className="text-sm font-medium">24</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-6 bg-white rounded-lg shadow">
                <nav className="space-y-1 p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="mr-3 h-5 w-5" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow">
                {/* Tab Content */}
                {activeTab === 'personal' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={user?.firstName || ''}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={user?.lastName || ''}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="flex">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-2.5 mr-3" />
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled={!isEditing}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <div className="flex">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mt-2.5 mr-3" />
                          <input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            disabled={!isEditing}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <div className="flex">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-2.5 mr-3" />
                          <input
                            type="text"
                            placeholder="San Francisco, CA"
                            disabled={!isEditing}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                          rows={4}
                          placeholder="Tell us about yourself..."
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                      <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Experience
                      </button>
                    </div>

                    <div className="space-y-6">
                      {experiences.map((exp) => (
                        <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">{exp.position}</h4>
                              <p className="text-blue-600 font-medium">{exp.company}</p>
                              <div className="flex items-center mt-2 text-sm text-gray-600">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(exp.startDate).toLocaleDateString()} - {
                                  exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()
                                }
                              </div>
                              <p className="mt-3 text-gray-700">{exp.description}</p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button className="p-2 text-gray-400 hover:text-blue-600">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Education</h3>
                      <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Education
                      </button>
                    </div>

                    <div className="space-y-6">
                      {education.map((edu) => (
                        <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">{edu.degree}</h4>
                              <p className="text-blue-600 font-medium">{edu.institution}</p>
                              <p className="text-gray-600">{edu.field}</p>
                              <div className="flex items-center mt-2 text-sm text-gray-600">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(edu.startDate).toLocaleDateString()} - {new Date(edu.endDate).toLocaleDateString()}
                              </div>
                              {edu.gpa && (
                                <p className="mt-2 text-sm text-gray-600">GPA: {edu.gpa}</p>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button className="p-2 text-gray-400 hover:text-blue-600">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Skills & Expertise</h3>
                      <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Skill
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {skills.map((skill) => (
                        <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{skill.name}</h4>
                            <button className="text-gray-400 hover:text-red-600">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{skill.category}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                            {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
