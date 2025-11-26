import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../../lib/supabase';
import { db } from '../../lib/supabase';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback - Supabase automatically processes the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login', { 
            state: { error: 'Authentication failed. Please try again.' } 
          });
          return;
        }

        if (session?.user) {
          // Check if user profile exists, create if not
          try {
            let existingProfile;
            try {
              existingProfile = await db.users.getProfile(session.user.id);
            } catch (getError) {
              // Profile doesn't exist (PGRST116 = no rows returned)
              if (getError.code === 'PGRST116' || getError.message?.includes('No rows')) {
                existingProfile = null;
              } else {
                throw getError;
              }
            }

            if (!existingProfile) {
              // Create profile for OAuth user
              const profileData = {
                id: session.user.id,
                email: session.user.email,
                first_name: session.user.user_metadata?.full_name?.split(' ')[0] || 
                           session.user.user_metadata?.name?.split(' ')[0] || 
                           session.user.user_metadata?.firstName || '',
                last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 
                          session.user.user_metadata?.name?.split(' ').slice(1).join(' ') || 
                          session.user.user_metadata?.lastName || '',
                user_type: 'customer',
                profile_picture: session.user.user_metadata?.avatar_url || 
                               session.user.user_metadata?.picture || null,
                created_at: new Date().toISOString(),
              };
              await db.users.createProfile(profileData);
            }
          } catch (profileError) {
            console.error('Profile check/create error:', profileError);
            // Continue anyway - profile can be created later
          }
          
          // Redirect to dashboard
          // Force a page reload to update auth state
          window.location.href = '/dashboard';
        } else {
          // No session found - wait a bit for Supabase to process
          setTimeout(() => {
            const checkSession = async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession?.user) {
                window.location.href = '/dashboard';
              } else {
                navigate('/login', { 
                  state: { error: 'No session found. Please try again.' } 
                });
              }
            };
            checkSession();
          }, 1000);
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/login', { 
          state: { error: 'An error occurred during authentication.' } 
        });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 3 
      }}>
        <CircularProgress size={48} />
        <Typography variant="h6" color="text.secondary">
          Completing sign in...
        </Typography>
      </Box>
    </Container>
  );
};

export default AuthCallbackPage;

