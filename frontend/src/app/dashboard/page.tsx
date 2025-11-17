'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!user) {
      router.push('/shared/auth/login');
      return;
    }

    // Redirect to role-specific dashboard
    if (user?.role === 'recruiter') {
      router.push('/recruiter/dashboard');
    } else if (user?.role === 'student') {
      router.push('/student/dashboard');
    } else {
      // Default fallback
      router.push('/shared/auth/login');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}