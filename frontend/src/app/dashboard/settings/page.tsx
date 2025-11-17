'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState({
    email: {
      jobMatches: true,
      profileViews: true,
      applications: true,
      newsletter: false
    },
    push: {
      jobMatches: true,
      profileViews: false,
      applications: true,
      messages: true
    }
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowRecruiterContact: true
  });

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
  ];

  const handleNotificationChange = (type: 'email' | 'push', setting: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [setting]: value
      }
    }));
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your account preferences and privacy settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <nav className="bg-white rounded-lg shadow">
                <div className="space-y-1 p-2">
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
                </div>
              </nav>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">General Settings</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>English (US)</option>
                          <option>English (UK)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>Pacific Time (PT)</option>
                          <option>Mountain Time (MT)</option>
                          <option>Central Time (CT)</option>
                          <option>Eastern Time (ET)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Dark Mode</h4>
                          <p className="text-sm text-gray-600">Use dark theme across the application</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                          <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
                    
                    <div className="space-y-8">
                      {/* Email Notifications */}
                      <div>
                        <div className="flex items-center mb-4">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <h4 className="text-base font-medium text-gray-900">Email Notifications</h4>
                        </div>
                        <div className="space-y-4 ml-7">
                          {Object.entries(notifications.email).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {key === 'jobMatches' && 'Get notified when new jobs match your profile'}
                                  {key === 'profileViews' && 'Know when recruiters view your profile'}
                                  {key === 'applications' && 'Updates on your job applications'}
                                  {key === 'newsletter' && 'Weekly career tips and industry insights'}
                                </p>
                              </div>
                              <button
                                onClick={() => handleNotificationChange('email', key, !value)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  value ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span className={`${
                                  value ? 'translate-x-5' : 'translate-x-0'
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Push Notifications */}
                      <div>
                        <div className="flex items-center mb-4">
                          <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <h4 className="text-base font-medium text-gray-900">Push Notifications</h4>
                        </div>
                        <div className="space-y-4 ml-7">
                          {Object.entries(notifications.push).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleNotificationChange('push', key, !value)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  value ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span className={`${
                                  value ? 'translate-x-5' : 'translate-x-0'
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Privacy Settings</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                        <select 
                          value={privacy.profileVisibility}
                          onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="public">Public - Visible to everyone</option>
                          <option value="recruiters">Recruiters Only - Visible to verified recruiters</option>
                          <option value="private">Private - Only visible to you</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Show Email Address</h4>
                            <p className="text-sm text-gray-600">Allow others to see your email address</p>
                          </div>
                          <button
                            onClick={() => setPrivacy(prev => ({ ...prev, showEmail: !prev.showEmail }))}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              privacy.showEmail ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`${
                              privacy.showEmail ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Show Phone Number</h4>
                            <p className="text-sm text-gray-600">Allow others to see your phone number</p>
                          </div>
                          <button
                            onClick={() => setPrivacy(prev => ({ ...prev, showPhone: !prev.showPhone }))}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              privacy.showPhone ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`${
                              privacy.showPhone ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Allow Recruiter Contact</h4>
                            <p className="text-sm text-gray-600">Let recruiters contact you directly</p>
                          </div>
                          <button
                            onClick={() => setPrivacy(prev => ({ ...prev, allowRecruiterContact: !prev.allowRecruiterContact }))}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              privacy.allowRecruiterContact ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`${
                              privacy.allowRecruiterContact ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        Save Privacy Settings
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Change Password</h4>
                        <p className="text-sm text-gray-600 mb-4">Update your password to keep your account secure</p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                          Change Password
                        </button>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
                          Enable 2FA
                        </button>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Active Sessions</h4>
                        <p className="text-sm text-gray-600 mb-4">Manage your active login sessions</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <p className="text-sm font-medium">Current Session</p>
                              <p className="text-xs text-gray-500">Chrome on Windows • San Francisco, CA</p>
                            </div>
                            <span className="text-xs text-green-600 font-medium">Active</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-800 mb-2">Delete Account</h4>
                            <p className="text-sm text-red-700 mb-4">
                              Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                              Delete Account
                            </button>
                          </div>
                        </div>
                      </div>
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
