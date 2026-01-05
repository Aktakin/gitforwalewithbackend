import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, db } from '../lib/supabase';

const SupabaseAuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false); // START AS FALSE - CRITICAL FIX
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    let timeoutId;
    let fallbackTimeout;
    let isMounted = true;

    // Check initial session with timeout
    const initAuth = async () => {
      try {
        // Check if Supabase is configured
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey || 
            supabaseUrl === 'https://your-project.supabase.co' || 
            supabaseAnonKey === 'your-anon-key') {
          console.warn('Supabase not configured - skipping auth check');
          // Already loading = false, just return
          return;
        }

        // Quick background check without blocking
        checkSession().catch(err => {
          console.warn('Background auth check failed:', err);
        });
      } catch (error) {
        console.error('Initial auth check failed:', error);
      }
    };

    initAuth();

    // Listen for auth state changes
    let subscription;
    try {
      // Only set up listener if Supabase is configured
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey && 
          supabaseUrl !== 'https://your-project.supabase.co' && 
          supabaseAnonKey !== 'your-anon-key') {
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
            }
          }
        });
        subscription = sub;
      }
    } catch (error) {
      console.error('Failed to set up auth listener:', error);
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
      }
    } catch (error) {
      console.error('Session check error:', error);
      setError(error.message || 'Failed to check authentication');
    }
  };

  const loadUserProfile = async (authUser) => {
    // Set user immediately so user.id is available - CRITICAL for app to work
    setUser(authUser);
    setIsAuthenticated(true);
    console.log('User authenticated, loading profile in background');

    // Load profile in background - non-blocking
    (async () => {
      try {
        // Quick profile fetch with short timeout
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
        
        // Try to check if profile exists (with timeout)
        try {
          const profileExists = await Promise.race([
            supabase
              .from('users')
              .select('id')
              .eq('id', authUser.id)
              .maybeSingle(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Check timeout')), 2000)
            )
          ]);
          
          if (profileExists.data) {
            // Profile exists, try fetching full profile again
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
            // Profile doesn't exist, try to create it
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
          // Continue without profile - user.id is already available
        }
      }
    })();
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'https://your-project.supabase.co' || 
          supabaseKey === 'your-anon-key') {
        console.warn('Supabase not configured - login will fail');
        throw new Error(
          'Supabase not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file. See BACKEND_CONNECTION_GUIDE.md for instructions.'
        );
      }

      console.log('Attempting login with email:', email);
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        
        // Provide more specific error messages
        if (authError.message.includes('fetch') || authError.message.includes('Failed to fetch')) {
          throw new Error(
            'Failed to connect to Supabase. Please check:\n' +
            '1. Your .env file has correct REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY\n' +
            '2. You restarted your dev server after creating .env\n' +
            '3. Your Supabase project is active and not paused\n' +
            '4. Your internet connection is working'
          );
        }
        
        // Check for email not verified error
        if (authError.message?.includes('Email not confirmed') || 
            authError.message?.includes('email_not_confirmed') ||
            authError.message?.includes('Email not verified')) {
          throw new Error('Email not verified. Please check your email and verify your account before signing in.');
        }
        
        // Handle specific Supabase auth errors
        if (authError.message.includes('Invalid login credentials') || 
            authError.message.includes('Invalid credentials') ||
            authError.status === 400) {
          throw new Error('Invalid email or password. Please try again.');
        }
        
        throw authError;
      }
      
      // Check if email is verified after successful login
      if (data.user && !data.user.email_confirmed_at) {
        // Sign out the user if email is not verified
        await supabase.auth.signOut();
        throw new Error('Email not verified. Please check your email and verify your account before signing in.');
      }

      if (data.user) {
        await loadUserProfile(data.user);
        return { success: true, user: data.user, profile };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = error.message || 'Login failed. Please check your credentials.';
      
      // Handle network errors more gracefully
      if (error.message && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to Supabase. Please check your .env configuration and restart the server.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'https://your-project.supabase.co' || 
          supabaseKey === 'your-anon-key') {
        throw new Error(
          'Supabase not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.'
        );
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            userType: userData.userType,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) {
        // Provide user-friendly error messages
        if (authError.message?.includes('already registered') || 
            authError.message?.includes('User already registered') ||
            authError.message?.includes('email address is already registered') ||
            authError.message?.includes('already exists') ||
            authError.code === '23505') {
          throw new Error('This email address is already registered. Please use a different email or try logging in.');
        }
        throw authError;
      }

      if (authData.user) {
        // Create user profile in database
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
          // User is created but profile failed - they can complete it later
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
      
      // Provide specific error messages
      let errorMessage = error.message || 'Registration failed. Please try again.';
      
      // Handle email already exists
      if (error.message?.includes('already registered') || 
          error.message?.includes('already exists') ||
          error.message?.includes('email address is already registered') ||
          error.code === '23505') {
        errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
      }
      
      // Handle invalid email
      if (error.message?.includes('Invalid email') || error.message?.includes('email format')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      // Handle weak password
      if (error.message?.includes('Password')) {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
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

  const updateProfile = async (profileData) => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    setLoading(true);
    setError(null);

    try {
      // Map frontend profile data to database schema
      const updates = {
        first_name: profileData.firstName || profileData.first_name,
        last_name: profileData.lastName || profileData.last_name,
        bio: profileData.bio,
        profile_picture: profileData.profilePicture || profileData.profile_picture,
        user_type: profileData.userType || profileData.user_type,
        location: profileData.location,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined fields
      Object.keys(updates).forEach(key => 
        updates[key] === undefined && delete updates[key]
      );

      const updatedProfile = await db.users.updateProfile(user.id, updates);
      setProfile(updatedProfile);

      return { success: true, user: user, profile: updatedProfile };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'https://your-project.supabase.co' || 
          supabaseKey === 'your-anon-key') {
        throw new Error(
          'Supabase not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.'
        );
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      return { 
        success: true, 
        message: 'Password reset email sent! Please check your inbox and click the link to reset your password.' 
      };
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error.message || 'Failed to send reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'https://your-project.supabase.co' || 
          supabaseKey === 'your-anon-key') {
        throw new Error(
          'Supabase not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.'
        );
      }

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) throw oauthError;

      // OAuth redirect will happen automatically
      return { success: true, data };
    } catch (error) {
      console.error('Google sign-in error:', error);
      const errorMessage = error.message || 'Failed to sign in with Google';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Combine user and profile for backward compatibility
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
      // Admin fields
      isAdmin: profile?.is_admin || false,
      adminLevel: profile?.admin_level || 'none',
      adminPermissions: profile?.admin_permissions || [],
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
    updateProfile,
    resetPassword,
    signInWithGoogle,
    clearError: () => setError(null),
    // Expose Supabase client for direct use if needed
    supabase,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export default SupabaseAuthProvider;

