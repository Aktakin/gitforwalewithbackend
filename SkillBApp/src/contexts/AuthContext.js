import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, db } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey || 
            supabaseUrl === 'https://your-project.supabase.co' || 
            supabaseAnonKey === 'your-anon-key') {
          console.warn('Supabase not configured - skipping auth check');
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        await checkSession();
      } catch (error) {
        console.error('Initial auth check failed:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    let subscription;
    try {
      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (isMounted) {
          if (session?.user) {
            await loadUserProfile(session.user);
          } else {
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
        }
      });
      subscription = sub;
    } catch (error) {
      console.error('Failed to set up auth listener:', error);
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const checkSession = async () => {
    try {
      console.log('Checking Supabase session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (session?.user) {
        console.log('Session found, loading user profile...');
        await loadUserProfile(session.user);
      } else {
        console.log('No session found - user not logged in');
        setLoading(false);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setError(error.message || 'Failed to check authentication');
      setLoading(false);
    }
  };

  const loadUserProfile = async (authUser) => {
    setUser(authUser);
    setIsAuthenticated(true);
    setLoading(false);
    console.log('Auth loading complete (user set, profile loading in background)');

    // Load profile in background
    (async () => {
      try {
        const userProfile = await Promise.race([
          db.users.getProfile(authUser.id),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          )
        ]);
        setProfile(userProfile);
        console.log('Profile loaded successfully');
      } catch (profileError) {
        console.error('Error loading user profile:', profileError);
        
        try {
          const { data: profileExists } = await supabase
            .from('users')
            .select('id')
            .eq('id', authUser.id)
            .maybeSingle();
          
          if (profileExists) {
            console.log('Profile exists, retrying fetch...');
            try {
              const userProfile = await Promise.race([
                db.users.getProfile(authUser.id),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Retry timeout')), 3000)
                )
              ]);
              setProfile(userProfile);
              console.log('Profile loaded on retry');
            } catch (retryError) {
              console.warn('Profile load failed on retry:', retryError);
            }
          } else {
            console.log('Profile does not exist, creating...');
            try {
              const newProfile = await Promise.race([
                db.users.createProfile({
                  id: authUser.id,
                  email: authUser.email,
                  first_name: authUser.user_metadata?.firstName || '',
                  last_name: authUser.user_metadata?.lastName || '',
                  user_type: authUser.user_metadata?.userType || 'customer',
                  created_at: new Date().toISOString(),
                }),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Profile creation timeout')), 3000)
                )
              ]);
              setProfile(newProfile);
              console.log('Profile created successfully');
            } catch (createError) {
              console.error('Error creating profile:', createError);
              console.warn('Continuing without profile - user object is still available');
            }
          }
        } catch (checkError) {
          console.warn('Could not check/create profile:', checkError);
        }
      }
    })();
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        await loadUserProfile(authData.user);
        return { success: true, user: authData.user, profile };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            userType: userData.userType,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        try {
          const profileData = {
            id: authData.user.id,
            email: authData.user.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            user_type: userData.userType || 'customer',
            created_at: new Date().toISOString(),
          };

          const newProfile = await db.users.createProfile(profileData);
          setProfile(newProfile);
          setUser(authData.user);
          setIsAuthenticated(true);

          return { success: true, user: authData.user, profile: newProfile };
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
          return { 
            success: true, 
            user: authData.user, 
            warning: 'Account created but profile setup incomplete' 
          };
        }
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error: logoutError } = await supabase.auth.signOut();
      
      if (logoutError) throw logoutError;

      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'skillbridge://reset-password',
      });

      if (resetError) throw resetError;

      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error.message || 'Failed to send reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getUserData = () => {
    if (!user) return null;
    
    return {
      ...user,
      ...profile,
      _id: user.id,
      id: user.id,
      email: user.email,
      firstName: profile?.first_name || user.user_metadata?.firstName,
      lastName: profile?.last_name || user.user_metadata?.lastName,
      userType: profile?.user_type || user.user_metadata?.userType,
      bio: profile?.bio,
      profilePicture: profile?.profile_picture,
      location: profile?.location,
      isVerified: profile?.is_verified || false,
      joinedAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
      isAdmin: profile?.is_admin || false,
    };
  };

  const value = {
    user: getUserData(),
    profile,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    clearError: () => setError(null),
    supabase,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
