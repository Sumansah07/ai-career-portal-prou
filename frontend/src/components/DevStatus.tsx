'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export function DevStatus() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/health');
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${
        backendStatus === 'online' 
          ? 'bg-green-100 text-green-800 border border-green-200'
          : backendStatus === 'offline'
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          : 'bg-gray-100 text-gray-800 border border-gray-200'
      }`}>
        {backendStatus === 'online' && (
          <>
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Backend Online
          </>
        )}
        {backendStatus === 'offline' && (
          <>
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            Using Mock Data
          </>
        )}
        {backendStatus === 'checking' && (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Checking...
          </>
        )}
      </div>
    </div>
  );
}
