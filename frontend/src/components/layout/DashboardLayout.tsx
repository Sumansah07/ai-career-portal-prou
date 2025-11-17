'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  ArrowRightStartOnRectangleIcon,
  PlusIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: ReactNode;
}

// Role-based navigation
const getNavigationForRole = (userRole: string) => {
  if (userRole === 'recruiter') {
    return [
      { name: 'Dashboard', href: '/recruiter/dashboard', icon: HomeIcon },
      { name: 'Post Job', href: '/recruiter/post-job', icon: PlusIcon },
      { name: 'Manage Jobs', href: '/recruiter/manage-jobs', icon: BriefcaseIcon },
      { name: 'Applications', href: '/recruiter/applications', icon: ClipboardDocumentListIcon },
      { name: 'Candidates', href: '/recruiter/candidates', icon: UserGroupIcon },
      { name: 'Analytics', href: '/recruiter/analytics', icon: ChartBarIcon },
      { name: 'AI Features', href: '/shared/ai-features', icon: SparklesIcon },
      { name: 'Profile', href: '/shared/profile', icon: UserIcon },
      { name: 'Settings', href: '/shared/settings', icon: CogIcon },
    ];
  }



  // Student navigation (default)
  return [
    { name: 'Dashboard', href: '/student/dashboard', icon: HomeIcon },
    { name: 'Resume Analyzer', href: '/student/resume', icon: DocumentTextIcon },
    { name: 'Job Matching', href: '/student/jobs', icon: BriefcaseIcon },
    { name: 'Applications', href: '/student/applications', icon: ClipboardDocumentListIcon },
    { name: 'AI Features', href: '/shared/ai-features', icon: SparklesIcon },
    { name: 'Profile', href: '/shared/profile', icon: UserIcon },
    { name: 'Settings', href: '/shared/settings', icon: CogIcon },
  ];
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Get navigation based on user role
  const navigation = getNavigationForRole(user?.role || 'student');
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };



  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <SparklesIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI Career Portal</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <item.icon className={`${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-4 h-6 w-6`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <img
                className="inline-block h-10 w-10 rounded-full"
                src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=3B82F6&color=fff`}
                alt=""
              />
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm font-medium text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <SparklesIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">AI Career Portal</span>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon className={`${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-6 w-6`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <img
                  className="inline-block h-9 w-9 rounded-full"
                  src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=3B82F6&color=fff`}
                  alt=""
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Logout"
                >
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                    placeholder="Search jobs, skills, companies..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <BellIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
