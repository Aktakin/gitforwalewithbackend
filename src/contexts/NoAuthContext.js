import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

// Mock admin user (your login)
const adminUser = {
  _id: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  email: 'aktakinro@gmail.com',
  userType: 'both',
  isVerified: true,
  isAdmin: true,
  adminLevel: 'super_admin',
  bio: 'SkillBridge Platform Administrator - Connecting artisans with those who value handcrafted excellence',
  profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  location: {
    city: 'San Francisco',
    state: 'CA',
    country: 'USA'
  },
  skills: [
    {
      _id: 'skill1',
      title: 'Custom Woodworking & Furniture',
      category: 'Woodworking & Carpentry',
      description: 'Handcrafted furniture and custom woodworking using traditional joinery techniques',
      hourlyRate: 85,
      tags: ['Furniture Making', 'Joinery', 'Hardwood', 'Custom Design'],
      isActive: true
    },
    {
      _id: 'skill2',
      title: 'Ceramic Arts & Pottery',
      category: 'Pottery & Ceramics',
      description: 'Wheel-thrown pottery and sculptural ceramics with custom glazing',
      hourlyRate: 75,
      tags: ['Wheel Throwing', 'Glazing', 'Functional Ceramics', 'Sculpture'],
      isActive: true
    }
  ],
  rating: {
    average: 4.9,
    count: 127
  },
  joinedAt: new Date('2023-01-15'),
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    privacy: {
      showEmail: false,
      showPhone: false
    }
  }
};

// Mock users for the platform - minimal profiles with only basic info
const mockUsers = [
  {
    _id: 'user1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    userType: 'provider',
    bio: '',
    profilePicture: '',
    isVerified: false,
    joinedAt: new Date('2024-01-15'),
    location: { city: '', state: '', country: '' },
    skills: [],
    rating: { average: 0, count: 0 },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      privacy: {
        showEmail: false,
        showPhone: false
      }
    }
  },
  {
    _id: 'user2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    userType: 'provider',
    bio: '',
    profilePicture: '',
    isVerified: false,
    joinedAt: new Date('2024-02-03'),
    location: { city: '', state: '', country: '' },
    skills: [],
    rating: { average: 0, count: 0 },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      privacy: {
        showEmail: false,
        showPhone: false
      }
    }
  },
  {
    _id: 'user3',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    userType: 'customer',
    bio: '',
    profilePicture: '',
    isVerified: false,
    joinedAt: new Date('2024-01-28'),
    location: { city: '', state: '', country: '' },
    skills: [],
    rating: { average: 0, count: 0 },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      privacy: {
        showEmail: false,
        showPhone: false
      }
    }
  },
  {
    _id: 'user4',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@example.com',
    userType: 'both',
    bio: '',
    profilePicture: '',
    isVerified: false,
    joinedAt: new Date('2024-02-10'),
    location: { city: '', state: '', country: '' },
    skills: [],
    rating: { average: 0, count: 0 },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      privacy: {
        showEmail: false,
        showPhone: false
      }
    }
  }
];

// Mock requests
const mockRequests = [
  {
    _id: 'req1',
    title: 'Custom Dining Table for Family Home',
    description: 'Looking for a skilled woodworker to create a custom dining table that seats 8 people. Prefer reclaimed wood with modern farmhouse style.',
    category: 'Woodworking & Carpentry',
    budget: { min: 2000, max: 4000, type: 'fixed' },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    urgency: 'medium',
    serviceType: 'local',
    tags: ['Custom Furniture', 'Reclaimed Wood', 'Farmhouse Style', 'Dining Table'],
    customer: mockUsers[2],
    status: 'open',
    isPublic: true,
    location: { city: 'New York', state: 'NY', country: 'USA' },
    requirements: [
      'Seats 8 people comfortably',
      'Reclaimed or sustainable wood',
      'Modern farmhouse aesthetic',
      'Durable finish for daily use'
    ],
    proposals: 12,
    views: 156,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'req2',
    title: 'Wedding Portrait Commission',
    description: 'Need a talented artist to create a custom oil painting portrait from our wedding photos. Looking for realistic style with romantic atmosphere.',
    category: 'Painting & Fine Arts',
    budget: { min: 1500, max: 2500, type: 'fixed' },
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    urgency: 'high',
    serviceType: 'remote',
    tags: ['Oil Painting', 'Portrait', 'Wedding', 'Realistic Style'],
    customer: mockUsers[3],
    status: 'open',
    isPublic: true,
    location: { city: 'Los Angeles', state: 'CA', country: 'USA' },
    requirements: [
      'Realistic oil painting style',
      'Based on wedding photographs',
      '24x36 inch canvas',
      'Romantic, timeless atmosphere'
    ],
    proposals: 8,
    views: 89,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'req3',
    title: 'Handmade Ceramic Dinnerware Set',
    description: 'Looking for a potter to create a complete dinnerware set for 6 people. Prefer earthy, organic shapes with natural glazes.',
    category: 'Pottery & Ceramics',
    budget: { min: 800, max: 1200, type: 'fixed' },
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    urgency: 'medium',
    serviceType: 'remote',
    tags: ['Dinnerware', 'Ceramic', 'Natural Glazes', 'Organic Shapes'],
    customer: adminUser,
    status: 'open',
    isPublic: true,
    location: { city: 'Austin', state: 'TX', country: 'USA' },
    requirements: [
      'Service for 6 people',
      'Plates, bowls, and mugs',
      'Earthy, natural aesthetic',
      'Food-safe glazes'
    ],
    proposals: 15,
    views: 203,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'req4',
    title: 'Custom Engagement Ring Design',
    description: 'Need a skilled jeweler to create a unique engagement ring. Looking for vintage-inspired design with ethically sourced diamonds.',
    category: 'Jewelry Making',
    budget: { min: 3000, max: 8000, type: 'fixed' },
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    urgency: 'urgent',
    serviceType: 'local',
    tags: ['Engagement Ring', 'Custom Jewelry', 'Ethical Diamonds', 'Vintage Style'],
    customer: mockUsers[2],
    status: 'in_review',
    isPublic: true,
    location: { city: 'Miami', state: 'FL', country: 'USA' },
    requirements: [
      'Vintage-inspired design',
      'Ethically sourced diamonds',
      '14k or 18k gold setting',
      'Detailed design consultation'
    ],
    proposals: 23,
    views: 178,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'req5',
    title: 'Garden Gate Ironwork',
    description: 'Need a blacksmith to create a decorative iron gate for our garden entrance. Looking for traditional scrollwork with modern touches.',
    category: 'Metalworking & Blacksmithing',
    budget: { min: 1500, max: 3000, type: 'fixed' },
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    urgency: 'low',
    serviceType: 'local',
    tags: ['Ironwork', 'Garden Gate', 'Scrollwork', 'Traditional Craft'],
    customer: mockUsers[3],
    status: 'open',
    isPublic: true,
    location: { city: 'Seattle', state: 'WA', country: 'USA' },
    requirements: [
      'Traditional scrollwork design',
      'Weather-resistant finish',
      '6 feet wide, 4 feet tall',
      'Self-closing mechanism'
    ],
    proposals: 7,
    views: 134,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

// Mock notifications
const mockNotifications = [
  {
    _id: 'notif1',
    title: 'New proposal received',
    message: 'Sarah Johnson submitted a proposal for your Custom Dining Table project',
    type: 'proposal',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    relatedRequest: mockRequests[0]
  },
  {
    _id: 'notif2',
    title: 'Project deadline reminder',
    message: 'Your Wedding Portrait Commission deadline is in 3 days',
    type: 'deadline',
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    _id: 'notif3',
    title: 'Payment received',
    message: 'Payment of $1,250 has been processed for Handmade Ceramic Dinnerware project',
    type: 'payment',
    read: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(adminUser); // Start with admin for demo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Mock functions - admin gets rich data, others get basic profiles
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let userToLogin;
      
      // If admin email, return admin with rich data
      if (email === 'aktakinro@gmail.com') {
        userToLogin = adminUser;
        console.log('✅ Admin login - showing rich mock data');
      } else {
        // Find user by email or create new basic user
        userToLogin = mockUsers.find(user => user.email === email);
        
        if (!userToLogin) {
          // Create new basic user if email not found
          userToLogin = {
            _id: 'new_' + Date.now(),
            firstName: email.split('@')[0].split('.')[0] || 'User',
            lastName: email.split('@')[0].split('.')[1] || '',
            email: email,
            userType: 'customer',
            bio: '',
            profilePicture: '',
            isVerified: false,
            joinedAt: new Date(),
            location: { city: '', state: '', country: '' },
            skills: [],
            rating: { average: 0, count: 0 },
            preferences: {
              emailNotifications: true,
              smsNotifications: false,
              marketingEmails: false,
              privacy: {
                showEmail: false,
                showPhone: false
              }
            }
          };
          console.log('✅ New user login - clean profile created');
        } else {
          console.log('✅ Existing user login - basic profile data');
        }
      }
      
      setUser(userToLogin);
      setIsAuthenticated(true);
      
      return { success: true, user: userToLogin };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create clean new user profile (no pre-filled data)
      const newUser = {
        _id: 'new_' + Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        userType: userData.userType,
        bio: '',
        profilePicture: '',
        isVerified: false,
        joinedAt: new Date(),
        location: { city: '', state: '', country: '' },
        skills: [],
        rating: { average: 0, count: 0 },
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
          privacy: {
            showEmail: false,
            showPhone: false
          }
        }
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      console.log('✅ New user registered - clean profile created');
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Mock logout successful');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Deep merge the profile data with existing user data
      const updatedUser = {
        ...user,
        ...profileData,
        location: {
          ...user.location,
          ...profileData.location
        },
        preferences: {
          ...user.preferences,
          ...profileData.preferences,
          privacy: {
            ...user.preferences?.privacy,
            ...profileData.preferences?.privacy
          }
        },
        // Ensure skills are properly updated
        skills: profileData.skills || user.skills || [],
        // Update timestamp
        updatedAt: new Date()
      };
      
      setUser(updatedUser);
      console.log('✅ Profile updated successfully:', updatedUser.email);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Quick user switcher for testing
  const switchUser = async (email) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (email === 'aktakinro@gmail.com') {
        setUser(adminUser);
        console.log('✅ Switched to admin - rich profile');
      } else {
        const targetUser = mockUsers.find(u => u.email === email);
        if (targetUser) {
          setUser(targetUser);
          console.log('✅ Switched to basic user profile');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    switchUser, // For testing different profiles
    clearError: () => setError(null),
    
    // Expose mock data for components to use
    mockData: {
      users: [adminUser, ...mockUsers],
      requests: mockRequests,
      notifications: mockNotifications
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
