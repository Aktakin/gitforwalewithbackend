import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

const AuthContext = createContext({});

// Mock admin user data
const mockAdminUser = {
  _id: 'admin123',
  firstName: 'Super',
  lastName: 'Admin',
  email: 'admin@skillbridge.com',
  userType: 'both',
  isAdmin: true,
  adminLevel: 'super_admin',
  adminPermissions: [
    'view_users', 'edit_users', 'delete_users', 'suspend_users',
    'view_content', 'moderate_content', 'delete_content',
    'view_reports', 'resolve_reports',
    'view_analytics', 'export_data',
    'manage_payments', 'resolve_disputes',
    'manage_admins', 'system_settings'
  ],
  bio: 'Platform Super Administrator with full access to all features.',
  profilePicture: '',
  isVerified: true,
  isActive: true,
  phone: '+1234567890',
  location: {
    city: 'San Francisco',
    state: 'CA',
    country: 'USA'
  },
  skills: [],
  rating: {
    average: 5.0,
    count: 0
  },
  preferences: {
    notifications: {
      email: true,
      push: true,
      messages: true
    },
    privacy: {
      showEmail: false,
      showPhone: false
    }
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(mockAdminUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Mock token
  const token = 'mock-admin-token-123456';

  // Mock login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Always succeed with admin login for demo
    setUser(mockAdminUser);
    setIsAuthenticated(true);
    setLoading(false);
    
    return { success: true, user: mockAdminUser };
  };

  // Mock register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a new user based on registration data but make them admin
    const newUser = {
      ...mockAdminUser,
      _id: 'user' + Date.now(),
      firstName: userData.firstName || 'Demo',
      lastName: userData.lastName || 'User',
      email: userData.email || 'demo@skillbridge.com',
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
    setLoading(false);
    
    return { success: true, user: newUser };
  };

  // Mock logout function
  const logout = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  // Mock update user function
  const updateUser = async (updates) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    setLoading(false);
    
    return { success: true, user: updatedUser };
  };

  // Mock forgot password function
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoading(false);
    return { success: true, message: 'Password reset email sent (mock)' };
  };

  // Mock reset password function
  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoading(false);
    return { success: true, message: 'Password reset successful (mock)' };
  };

  // Auto-login on mount (simulate checking existing session)
  useEffect(() => {
    // For demo purposes, we're already logged in as admin
    setUser(mockAdminUser);
    setIsAuthenticated(true);
    setLoading(false);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

