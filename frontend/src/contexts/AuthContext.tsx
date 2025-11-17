'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'admin' | 'recruiter';
  profile?: {
    avatar?: string;
    bio?: string;
    phone?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  skills?: Array<{
    name: string;
    level: string;
    category?: string;
  }>;
  preferences?: {
    jobTypes?: string[];
    industries?: string[];
    locations?: string[];
    salaryRange?: {
      min?: number;
      max?: number;
    };
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'student' | 'recruiter';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios defaults
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Define logout function first so it can be used in other functions
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Add axios interceptor for handling auth errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('401 error, logging out user');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const fetchUser = async () => {
    try {
      console.log('Fetching user from /auth/me...');
      const response = await axios.get('/auth/me');
      console.log('User fetch response:', response.data);
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      console.log('Error details:', {
        status: error.response?.status,
        code: error.code,
        message: error.message
      });

      // Handle different error types
      if (error.response?.status === 401) {
        // Invalid or expired token - clear auth state
        console.log('Token invalid (401), logging out user');
        logout();
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        // Backend not available
        console.log('Backend not available');
        logout();
      } else {
        // Other errors - clear auth state
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', { email, password });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;

        setToken(newToken);
        setUser(userData);

        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle backend connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }

      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;
        
        setToken(newToken);
        setUser(newUser);
        
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };



  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
