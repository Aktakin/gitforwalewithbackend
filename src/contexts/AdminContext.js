import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './SupabaseAuthContext';

const AdminContext = createContext({});

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLevel, setAdminLevel] = useState('none');
  const [adminPermissions, setAdminPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Check if user has admin privileges
      setIsAdmin(user.isAdmin || false);
      setAdminLevel(user.adminLevel || 'none');
      setAdminPermissions(user.adminPermissions || []);
    } else {
      setIsAdmin(false);
      setAdminLevel('none');
      setAdminPermissions([]);
    }
    setLoading(false);
  }, [user]);

  const hasPermission = (permission) => {
    return isAdmin && adminPermissions.includes(permission);
  };

  const canAccessAdmin = () => {
    return isAdmin && ['moderator', 'admin', 'super_admin'].includes(adminLevel);
  };

  const isSuperAdmin = () => {
    return adminLevel === 'super_admin';
  };

  const isAdminLevel = (level) => {
    const levels = ['moderator', 'admin', 'super_admin'];
    const userLevelIndex = levels.indexOf(adminLevel);
    const requiredLevelIndex = levels.indexOf(level);
    return userLevelIndex >= requiredLevelIndex;
  };

  // API functions for admin operations
  const fetchDashboardStats = async () => {
    // Mock dashboard stats data
    return {
      success: true,
      data: {
        users: { total: 12457, active: 11842, growth: '+12%' },
        skills: { total: 3842, active: 3654, growth: '+8%' },
        requests: { total: 1284, pending: 23, growth: '+15%' },
        revenue: { total: 284592, growth: '+15%' },
        engagement: { messages: 8432, reviews: 1847 }
      }
    };
  };

  const fetchUsers = async (params = {}) => {
    // Mock users data
    return {
      success: true,
      data: {
        users: [
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Provider', status: 'Active', joinDate: '2024-01-15' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Customer', status: 'Active', joinDate: '2024-01-14' },
          { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Both', status: 'Suspended', joinDate: '2024-01-13' }
        ],
        pagination: { page: 1, limit: 20, total: 3, pages: 1 }
      }
    };
  };

  const updateUser = async (userId, updateData) => {
    // Mock user update
    return { success: true, message: 'User updated successfully' };
  };

  const toggleUserSuspension = async (userId) => {
    // Mock suspension toggle
    return { success: true, message: 'User status updated successfully' };
  };

  const promoteUser = async (userId, adminLevel, permissions = []) => {
    // Mock user promotion
    return { success: true, message: 'User promoted successfully' };
  };

  const demoteUser = async (userId) => {
    // Mock user demotion
    return { success: true, message: 'User demoted successfully' };
  };

  const fetchAnalytics = async (params = {}) => {
    // Mock analytics data
    return {
      success: true,
      data: {
        userGrowth: [
          { date: '2024-01-01', count: 100 },
          { date: '2024-01-02', count: 120 },
          { date: '2024-01-03', count: 150 }
        ],
        topCategories: [
          { category: 'Technology', count: 45, percentage: 35 },
          { category: 'Design', count: 36, percentage: 28 },
          { category: 'Writing', count: 24, percentage: 19 }
        ]
      }
    };
  };

  const value = {
    isAdmin,
    adminLevel,
    adminPermissions,
    loading,
    hasPermission,
    canAccessAdmin,
    isSuperAdmin,
    isAdminLevel,
    fetchDashboardStats,
    fetchUsers,
    updateUser,
    toggleUserSuspension,
    promoteUser,
    demoteUser,
    fetchAnalytics,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
