import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if credentials are properly configured
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://your-project.supabase.co' || 
    supabaseAnonKey === 'your-anon-key') {
  console.error(
    '❌ Supabase credentials not configured!\n' +
    'Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file\n' +
    'See SUPABASE_FRESH_START.md for setup instructions.'
  );
  
  // Show alert in browser console and potentially UI
  if (typeof window !== 'undefined') {
    console.error('Current values:', {
      url: supabaseUrl || 'NOT SET',
      key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET'
    });
  }
}

// Create a single supabase client for the app
export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key'
);

// Test connection on initialization
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message.includes('fetch')) {
      throw new Error('Failed to connect to Supabase. Please check your credentials in .env file');
    }
    return { success: true };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Database helper functions
export const db = {
  // Users table operations
  users: {
    // Get user profile by ID
    getProfile: async (userId) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },

    // Update user profile
    updateProfile: async (userId, updates) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Create user profile (after auth signup)
    createProfile: async (profileData) => {
      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Get public profile for any user (for viewing other user profiles)
    getPublicProfile: async (userId) => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          bio,
          user_type,
          profile_picture,
          is_verified,
          location,
          website,
          linkedin_url,
          github_url,
          phone_number,
          created_at,
          rating
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
  },

  // Skills table operations
  skills: {
    // Get all skills for a user
    getUserSkills: async (userId) => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // Create a new skill
    create: async (skillData) => {
      const { data, error } = await supabase
        .from('skills')
        .insert(skillData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Update a skill
    update: async (skillId, updates) => {
      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', skillId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Delete a skill
    delete: async (skillId) => {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);
      
      if (error) throw error;
    },

    // Get all public skills with filters
    getPublicSkills: async (filters = {}) => {
      let query = supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true);

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch user data separately for each skill
      const skillsWithUsers = await Promise.all(
        data.map(async (skill) => {
          let userData = null;
          if (skill.user_id) {
            try {
              const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', skill.user_id)
                .maybeSingle();
              userData = user;
            } catch (err) {
              console.warn('Error fetching user for skill:', err);
            }
          }
          return {
            ...skill,
            users: userData,
            user: userData
          };
        })
      );
      
      return skillsWithUsers;
    },
  },

  // Requests table operations
  requests: {
    // Get all requests
    getAll: async (filters = {}) => {
      // Fetch requests without joins to avoid JSON coercion issues
      let query = supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      } else if (!filters.userId) {
        // Only default to open requests if not filtering by user
        // (users should see all their own requests)
        query = query.eq('status', 'open');
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.urgency) {
        query = query.eq('urgency', filters.urgency);
      }
      if (filters.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic);
      }

      // Apply pagination
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error} = await query;
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch proposal counts for all requests separately
      // Use count queries which respect RLS but still give us totals
      const requestIds = data.map(r => r.id);
      const proposalCountsMap = {};
      
      if (requestIds.length > 0) {
        try {
          // Fetch proposal counts for each request individually
          // This ensures RLS policies work correctly
          await Promise.all(
            requestIds.map(async (reqId) => {
              try {
                const { count, error: countError } = await supabase
                  .from('proposals')
                  .select('*', { count: 'exact', head: true })
                  .eq('request_id', reqId);
                
                if (!countError && count !== null) {
                  proposalCountsMap[reqId] = count;
                } else {
                  proposalCountsMap[reqId] = 0;
                }
              } catch (err) {
                console.warn(`Error fetching proposal count for request ${reqId}:`, err);
                proposalCountsMap[reqId] = 0;
              }
            })
          );
        } catch (err) {
          console.warn('Error fetching proposal counts:', err);
          // Set all to 0 if there's an error
          requestIds.forEach(reqId => {
            proposalCountsMap[reqId] = 0;
          });
        }
      }
      
      // Fetch user data separately for each request
      const requestsWithUsers = await Promise.all(
        data.map(async (request) => {
          let userData = null;
          if (request.user_id) {
            try {
              const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', request.user_id)
                .maybeSingle();
              userData = user;
            } catch (err) {
              console.warn('Error fetching user for request:', err);
            }
          }
          return {
            ...request,
            users: userData,
            user: userData,
            proposal_count: proposalCountsMap[request.id] || 0
          };
        })
      );
      
      return requestsWithUsers;
    },

    // Count requests (for pagination)
    count: async (filters = {}) => {
      let query = supabase
        .from('requests')
        .select('*', { count: 'exact', head: true });

      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.eq('status', 'open');
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { count, error } = await query;
      
      if (error) throw error;
      return count || 0;
    },

    // Get single request
    getById: async (requestId) => {
      try {
        console.log('[requests.getById] Fetching request:', requestId);
        
        // Try simple query first (without relations to avoid JSON coercion issues)
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('id', requestId)
          .maybeSingle();
        
        console.log('[requests.getById] Query result:', { data, error });
        
        if (error) {
          console.error('[requests.getById] Error:', error);
          throw error;
        }
        if (!data) {
          console.warn('[requests.getById] Request not found or not accessible:', requestId);
          return null;
        }
        
        console.log('[requests.getById] Request found:', data.id, data.title, data.status);
        
        // Fetch user data separately
        let userData = null;
        if (data.user_id) {
          try {
            const { data: user, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user_id)
              .maybeSingle();
            
            if (!userError && user) {
              userData = user;
            }
          } catch (userErr) {
            console.warn('Error fetching user data:', userErr);
          }
        }
        
        // Fetch proposal count separately to get accurate count
        let proposalCount = 0;
        try {
          const { count, error: countError } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .eq('request_id', requestId);
          
          if (!countError && count !== null) {
            proposalCount = count;
          }
        } catch (err) {
          console.warn('Error fetching proposal count:', err);
        }
        
        // Return with user data and proposal count
        return {
          ...data,
          users: userData,
          user: userData,
          proposal_count: proposalCount
        };
      } catch (err) {
        console.error('Error fetching request:', err);
        throw err;
      }
    },

    // Delete a request
    delete: async (requestId) => {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId);
      
      if (error) throw error;
    },

    // Create a new request
    create: async (requestData) => {
      console.log('[db.requests.create] Input data:', requestData);
      
      const { data, error } = await supabase
        .from('requests')
        .insert(requestData)
        .select()
        .single();
      
      console.log('[db.requests.create] Supabase response:', { data, error });
      
      if (error) {
        console.error('[db.requests.create] Supabase error:', error);
        console.error('[db.requests.create] Error code:', error.code);
        console.error('[db.requests.create] Error message:', error.message);
        console.error('[db.requests.create] Error details:', error.details);
        console.error('[db.requests.create] Error hint:', error.hint);
        throw error;
      }
      
      return data;
    },

    // Update a request
    update: async (requestId, updates) => {
      const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Increment view count for a request
    incrementViews: async (requestId) => {
      try {
        // Call the database function to increment views
        const { data, error } = await supabase.rpc('increment_request_views', {
          request_id_param: requestId
        });

        if (error) {
          console.warn('Error incrementing views via RPC:', error);
          // Fallback: increment directly
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('requests')
            .update({ views: supabase.raw('COALESCE(views, 0) + 1') })
            .eq('id', requestId)
            .select('views')
            .single();
          
          if (fallbackError) throw fallbackError;
          return fallbackData?.views || 0;
        }

        return data || 0;
      } catch (err) {
        console.error('Error incrementing request views:', err);
        return 0;
      }
    },
  },

  // Proposals table operations
  proposals: {
    // Get proposals for a request
    getByRequest: async (requestId) => {
      // Fetch proposals without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch user data separately for each proposal
      if (data && data.length > 0) {
        const proposalsWithUsers = await Promise.all(
          data.map(async (proposal) => {
            let userData = null;
            if (proposal.user_id) {
              try {
                const { data: user } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', proposal.user_id)
                  .maybeSingle();
                userData = user;
              } catch (err) {
                console.warn('Error fetching user for proposal:', err);
              }
            }
            return {
              ...proposal,
              users: userData,
              user: userData
            };
          })
        );
        return proposalsWithUsers;
      }
      
      return data;
    },

    // Get proposals for a user
    getUserProposals: async (userId) => {
      // Fetch proposals without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch request data separately for each proposal
      if (data && data.length > 0) {
        const proposalsWithRequests = await Promise.all(
          data.map(async (proposal) => {
            let requestData = null;
            if (proposal.request_id) {
              try {
                const { data: request } = await supabase
                  .from('requests')
                  .select('*')
                  .eq('id', proposal.request_id)
                  .maybeSingle();
                requestData = request;
              } catch (err) {
                console.warn('Error fetching request for proposal:', err);
              }
            }
            return {
              ...proposal,
              requests: requestData,
              request: requestData
            };
          })
        );
        return proposalsWithRequests;
      }
      
      return data;
    },

    // Check if user already has a proposal for this request
    checkExisting: async (requestId, userId) => {
      const { data, error } = await supabase
        .from('proposals')
        .select('id, status, created_at')
        .eq('request_id', requestId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },

    // Create a proposal
    create: async (proposalData) => {
      // Check if user already has a proposal for this request
      const existing = await db.proposals.checkExisting(proposalData.request_id, proposalData.user_id);
      
      if (existing) {
        throw new Error('You have already submitted a proposal for this request. You can only submit one proposal per request.');
      }

      const { data, error } = await supabase
        .from('proposals')
        .insert(proposalData)
        .select()
        .single();
      
      if (error) {
        // Check if it's a unique constraint violation
        if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
          throw new Error('You have already submitted a proposal for this request. You can only submit one proposal per request.');
        }
        throw error;
      }

      // Get request details to notify the request owner
      const { data: requestData } = await supabase
        .from('requests')
        .select('user_id, title')
        .eq('id', proposalData.request_id)
        .maybeSingle();

      if (requestData && requestData.user_id !== proposalData.user_id) {
        // Get proposal submitter info
        const { data: submitterData } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', proposalData.user_id)
          .maybeSingle();

        const submitterName = submitterData
          ? `${submitterData.first_name || ''} ${submitterData.last_name || ''}`.trim() || submitterData.email
          : 'An artisan';

        // Create notification for request owner
        await supabase
          .from('notifications')
          .insert({
            user_id: requestData.user_id,
            title: 'New Proposal Received',
            message: `${submitterName} submitted a proposal for "${requestData.title}"`,
            type: 'proposal',
            related_id: data.id,
            read: false
          });
      }

      return data;
    },

    // Update a proposal (allows request owner to accept/reject)
    update: async (proposalId, updates) => {
      try {
        // First get the proposal without relations to avoid JSON coercion issues
        const { data: proposal, error: fetchError } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', proposalId)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!proposal) throw new Error('Proposal not found');

        const oldStatus = proposal.status;

        // Get request data separately
        let requestData = null;
        if (proposal.request_id) {
          const { data: request } = await supabase
            .from('requests')
            .select('id, user_id, title')
            .eq('id', proposal.request_id)
            .maybeSingle();
          requestData = request;
        }

        // Update the proposal - don't use .single() to avoid coercion issues
        console.log('[Proposals.update] Updating proposal:', proposalId, 'with updates:', updates);
        const { data: updateResult, error } = await supabase
          .from('proposals')
          .update(updates)
          .eq('id', proposalId)
          .select();
        
        if (error) {
          console.error('[Proposals.update] Update error:', error);
          throw error;
        }

        console.log('[Proposals.update] Update result:', updateResult);

        // Get the first result from the array
        const updatedProposal = updateResult && updateResult.length > 0 ? updateResult[0] : proposal;
        console.log('[Proposals.update] Returning updated proposal:', updatedProposal);

        // If status changed, notify the proposal submitter
        if (updates.status && updates.status !== oldStatus && requestData) {
          // Get request owner info for notification
          let requestOwnerData = null;
          try {
            const result = await supabase
              .from('users')
              .select('first_name, last_name, email')
              .eq('id', requestData.user_id)
              .maybeSingle();
            requestOwnerData = result.data;
          } catch (err) {
            console.warn('Failed to fetch request owner data:', err);
          }

          const ownerName = requestOwnerData
            ? `${requestOwnerData.first_name || ''} ${requestOwnerData.last_name || ''}`.trim() || requestOwnerData.email
            : 'A client';

          const requestTitle = requestData.title || 'your request';

          const statusMessages = {
            accepted: `Your proposal for "${requestTitle}" was accepted by ${ownerName}! 🎉`,
            rejected: `Your proposal for "${requestTitle}" was not selected.`,
          };

          const message = statusMessages[updates.status] || `Your proposal status was updated to ${updates.status}`;

          // Create notification for proposal submitter
          try {
            await supabase
              .from('notifications')
              .insert({
                user_id: proposal.user_id,
                title: updates.status === 'accepted' ? 'Proposal Accepted!' : 'Proposal Update',
                message: message,
                type: 'proposal',
                related_id: proposalId,
                read: false
              });
          } catch (notifError) {
            console.warn('Failed to create notification:', notifError);
            // Don't throw - notification failure shouldn't fail the whole update
          }
        }

        return updatedProposal;
      } catch (err) {
        console.error('Error updating proposal:', err);
        throw err;
      }
    },

    // Get proposal by ID
    getById: async (proposalId) => {
      try {
        const { data: proposal, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', proposalId)
          .maybeSingle();

        if (error) throw error;
        if (!proposal) return null;

        // Fetch related data separately
        const [userData, requestData] = await Promise.all([
          proposal.user_id ? supabase
            .from('users')
            .select('*')
            .eq('id', proposal.user_id)
            .maybeSingle()
            .then(r => r.data)
            .catch(() => null) : Promise.resolve(null),
          proposal.request_id ? supabase
            .from('requests')
            .select('*')
            .eq('id', proposal.request_id)
            .maybeSingle()
            .then(r => r.data)
            .catch(() => null) : Promise.resolve(null)
        ]);

        return {
          ...proposal,
          user: userData,
          request: requestData
        };
      } catch (err) {
        console.error('Error fetching proposal by ID:', err);
        throw err;
      }
    },

    // Request budget change approval from artisan
    requestBudgetChange: async ({ proposalId, newAmount, originalAmount, message, requestId, artisanId, clientId }) => {
      try {
        // Get proposal data
        const { data: proposal, error: proposalError } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', proposalId)
          .maybeSingle();

        if (proposalError) throw proposalError;
        if (!proposal) throw new Error('Proposal not found');

        // Get request data
        const { data: requestData } = await supabase
          .from('requests')
          .select('title')
          .eq('id', requestId)
          .maybeSingle();

        // Get client data for notification
        const { data: clientData } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', clientId)
          .maybeSingle();

        const clientName = clientData
          ? `${clientData.first_name || ''} ${clientData.last_name || ''}`.trim() || clientData.email
          : 'A client';

        const requestTitle = requestData?.title || 'your request';

        // Store budget change request in proposal metadata
        const metadata = proposal.metadata || {};
        metadata.budget_change_request = {
          new_amount: newAmount,
          original_amount: originalAmount,
          message: message,
          status: 'pending',
          requested_at: new Date().toISOString(),
          client_id: clientId
        };

        // Update proposal with metadata
        await supabase
          .from('proposals')
          .update({ metadata: metadata })
          .eq('id', proposalId);

        // Create notification for artisan
        const { data: notificationData, error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: artisanId,
            title: 'Budget Change Request',
            message: `${clientName} requested a budget change for "${requestTitle}" from $${originalAmount.toLocaleString()} to $${newAmount.toLocaleString()}. Please review and approve or reject.`,
            type: 'budget_change_request',
            related_id: proposalId,
            metadata: {
              proposal_id: proposalId,
              request_id: requestId,
              new_amount: newAmount,
              original_amount: originalAmount,
              message: message,
              action: 'approve_reject'
            },
            read: false
          })
          .select()
          .single();

        if (notifError) {
          console.error('Error creating budget change notification:', notifError);
          // Don't throw - notification failure shouldn't fail the whole request
          // But log it so we can debug
        } else {
          console.log('Budget change notification created successfully:', notificationData);
        }

        return { success: true };
      } catch (err) {
        console.error('Error requesting budget change:', err);
        throw err;
      }
    },

    // Approve or reject budget change
    respondToBudgetChange: async ({ proposalId, approved, artisanId, clientId, requestId }) => {
      try {
        // Get proposal data
        const { data: proposal, error: proposalError } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', proposalId)
          .maybeSingle();

        if (proposalError) throw proposalError;
        if (!proposal) throw new Error('Proposal not found');

        const metadata = proposal.metadata || {};
        const budgetChangeRequest = metadata.budget_change_request;

        if (!budgetChangeRequest || budgetChangeRequest.status !== 'pending') {
          throw new Error('No pending budget change request found');
        }

        // Get request and artisan data for notifications
        const { data: requestData } = await supabase
          .from('requests')
          .select('title')
          .eq('id', requestId)
          .maybeSingle();

        const { data: artisanData } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', artisanId)
          .maybeSingle();

        const artisanName = artisanData
          ? `${artisanData.first_name || ''} ${artisanData.last_name || ''}`.trim() || artisanData.email
          : 'The artisan';

        const requestTitle = requestData?.title || 'your request';

        if (approved) {
          // Update proposal with new price
          await supabase
            .from('proposals')
            .update({
              proposed_price: budgetChangeRequest.new_amount,
              metadata: {
                ...metadata,
                budget_change_request: {
                  ...budgetChangeRequest,
                  status: 'approved',
                  approved_at: new Date().toISOString()
                }
              }
            })
            .eq('id', proposalId);

          // Create notification for client
          await supabase
            .from('notifications')
            .insert({
              user_id: clientId,
              title: 'Budget Change Approved',
              message: `${artisanName} approved your budget change request for "${requestTitle}". You can now proceed with payment.`,
              type: 'budget_change_approved',
              related_id: proposalId,
              metadata: {
                proposal_id: proposalId,
                request_id: requestId,
                new_amount: budgetChangeRequest.new_amount,
                action: 'proceed_to_payment'
              },
              read: false
            });
        } else {
          // Mark as rejected
          await supabase
            .from('proposals')
            .update({
              metadata: {
                ...metadata,
                budget_change_request: {
                  ...budgetChangeRequest,
                  status: 'rejected',
                  rejected_at: new Date().toISOString()
                }
              }
            })
            .eq('id', proposalId);

          // Create notification for client
          await supabase
            .from('notifications')
            .insert({
              user_id: clientId,
              title: 'Budget Change Rejected',
              message: `${artisanName} rejected your budget change request for "${requestTitle}". The original proposal amount remains.`,
              type: 'budget_change_rejected',
              related_id: proposalId,
              metadata: {
                proposal_id: proposalId,
                request_id: requestId,
                action: 'view_proposal'
              },
              read: false
            });
        }

        return { success: true, approved };
      } catch (err) {
        console.error('Error responding to budget change:', err);
        throw err;
      }
    },
  },

  // Conversations table operations
  conversations: {
    // Get or create a conversation between two users
    getOrCreate: async (user1Id, user2Id, requestId = null) => {
      // First try to find existing conversation
      let query = supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`);
      
      if (requestId) {
        query = query.eq('request_id', requestId);
      }

      const { data: existing, error: findError } = await query.maybeSingle();
      
      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          request_id: requestId,
        })
        .select()
        .single();
      
      if (createError) throw createError;
      return newConv;
    },

    // Get all conversations for a user
    getUserConversations: async (userId) => {
      // Fetch conversations without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch related data for each conversation
      const conversationsWithData = await Promise.all(
        data.map(async (conv) => {
          try {
            // Fetch user1, user2, request, and last message in parallel
            const [user1Data, user2Data, requestData, lastMessage] = await Promise.all([
              conv.user1_id ? supabase.from('users').select('*').eq('id', conv.user1_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
              conv.user2_id ? supabase.from('users').select('*').eq('id', conv.user2_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
              conv.request_id ? supabase.from('requests').select('*').eq('id', conv.request_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
              supabase.from('messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(1).maybeSingle().then(r => r.data).catch(() => null)
            ]);
            
            return {
              ...conv,
              user1: user1Data,
              user2: user2Data,
              requests: requestData,
              request: requestData,
              last_message: lastMessage?.content || null,
              last_message_sender_id: lastMessage?.sender_id || null,
              last_message_created_at: lastMessage?.created_at || null,
            };
          } catch (err) {
            console.error('Error fetching data for conversation:', conv.id, err);
            return {
              ...conv,
              user1: null,
              user2: null,
              requests: null,
              request: null,
              last_message: null,
              last_message_sender_id: null,
              last_message_created_at: null,
            };
          }
        })
      );
      
      return conversationsWithData;
    },
  },

  // Messages table operations
  messages: {
    // Get messages for a conversation
    getConversation: async (conversationId) => {
      // Fetch messages without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch sender data separately for each message
      const messagesWithSenders = await Promise.all(
        data.map(async (message) => {
          let senderData = null;
          if (message.sender_id) {
            try {
              const { data: sender } = await supabase
                .from('users')
                .select('*')
                .eq('id', message.sender_id)
                .maybeSingle();
              senderData = sender;
            } catch (err) {
              console.warn('Error fetching sender for message:', err);
            }
          }
          return {
            ...message,
            sender: senderData
          };
        })
      );
      
      return messagesWithSenders;
    },

    // Send a message
    send: async (messageData) => {
      // Insert without join to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Fetch sender data separately
      let senderData = null;
      if (data && data.sender_id) {
        try {
          const { data: sender } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.sender_id)
            .maybeSingle();
          senderData = sender;
        } catch (err) {
          console.warn('Error fetching sender data:', err);
        }
      }
      
      const messageWithSender = {
        ...data,
        sender: senderData
      };

      // Get conversation to find the recipient
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', messageData.conversation_id)
        .maybeSingle();

      if (!convError && conversation) {
        // Determine the recipient (the other user in the conversation)
        const recipientId = conversation.user1_id === messageData.sender_id 
          ? conversation.user2_id 
          : conversation.user1_id;

        // Use already fetched senderData for notification
        const senderName = senderData 
          ? `${senderData.first_name || ''} ${senderData.last_name || ''}`.trim() || senderData.email
          : 'Someone';

        // Create notification for the recipient
        await supabase
          .from('notifications')
          .insert({
            user_id: recipientId,
            title: 'New Message',
            message: `${senderName} sent you a message`,
            type: 'message',
            related_id: messageData.conversation_id,
            read: false
          });

        // Update conversation's last_message_at
        await supabase
          .from('conversations')
          .update({ 
            last_message_at: new Date().toISOString()
          })
          .eq('id', messageData.conversation_id);
      } else {
        // Fallback: just update last_message_at if we can't find recipient
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', messageData.conversation_id);
      }
      
      return messageWithSender;
    },

    // Mark messages as read
    markAsRead: async (conversationId, userId) => {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('read', false);
      
      if (error) throw error;
    },
  },

  // Notifications table operations
  notifications: {
    // Get user notifications
    getUserNotifications: async (userId) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Mark all notifications as read for a user
    markAllAsRead: async (userId) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (error) throw error;
    },

    // Get unread count
    getUnreadCount: async (userId) => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (error) throw error;
      return count || 0;
    },

    // Create notification
    create: async (notificationData) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Delete notification
    delete: async (notificationId) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
    },
  },

  // Payments table operations
  payments: {
    // Get payment by ID
    getById: async (paymentId) => {
      try {
        // Fetch payment without relations to avoid JSON coercion issues
        const { data: payment, error } = await supabase
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .maybeSingle();
        
        if (error) throw error;
        if (!payment) {
          console.warn('Payment not found or not accessible:', paymentId);
          return null;
        }
        
        // Fetch related data separately
        const [payer, payee, request, proposal] = await Promise.all([
          payment.payer_id ? supabase.from('users').select('*').eq('id', payment.payer_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
          payment.payee_id ? supabase.from('users').select('*').eq('id', payment.payee_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
          payment.request_id ? supabase.from('requests').select('*').eq('id', payment.request_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
          payment.proposal_id ? supabase.from('proposals').select('*').eq('id', payment.proposal_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null)
        ]);
        
        return {
          ...payment,
          payer,
          payee,
          request,
          proposal
        };
      } catch (err) {
        console.error('Error fetching payment:', err);
        throw err;
      }
    },

    // Get payment by proposal ID
    getByProposal: async (proposalId) => {
      // Fetch payment without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('proposal_id', proposalId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      // Fetch related data separately
      try {
        const [proposal, payer, payee, request] = await Promise.all([
          data.proposal_id ? supabase.from('proposals').select('*').eq('id', data.proposal_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
          data.payer_id ? supabase.from('users').select('*').eq('id', data.payer_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
          data.payee_id ? supabase.from('users').select('*').eq('id', data.payee_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
          data.request_id ? supabase.from('requests').select('*').eq('id', data.request_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null)
        ]);
        
        return {
          ...data,
          proposal,
          payer,
          payee,
          request
        };
      } catch (err) {
        console.error('Error fetching payment related data:', err);
        return data; // Return payment without related data if fetch fails
      }
    },

    // Get payments for a user (as payer or payee)
    getUserPayments: async (userId) => {
      // Fetch payments without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .or(`payer_id.eq.${userId},payee_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch related data separately for each payment
      const paymentsWithRelatedData = await Promise.all(
        data.map(async (payment) => {
          try {
            const [proposal, payer, payee, request] = await Promise.all([
              payment.proposal_id ? supabase.from('proposals').select('*').eq('id', payment.proposal_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
              payment.payer_id ? supabase.from('users').select('*').eq('id', payment.payer_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
              payment.payee_id ? supabase.from('users').select('*').eq('id', payment.payee_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
              payment.request_id ? supabase.from('requests').select('*').eq('id', payment.request_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null)
            ]);
            
            return {
              ...payment,
              proposal,
              payer,
              payee,
              request
            };
          } catch (err) {
            console.warn('Error fetching related data for payment:', err);
            return payment; // Return payment without related data if fetch fails
          }
        })
      );
      
      return paymentsWithRelatedData;
    },

    // Create payment (calls database function or creates directly)
    create: async (paymentData) => {
      // Skip RPC and use direct insert to avoid JSON coercion issues
      // The RPC function returns UUID scalar which causes parsing issues
      return await db.payments.createDirect(paymentData);
    },

    // Direct payment creation (fallback when RPC doesn't exist)
    createDirect: async (paymentData) => {
      console.log('[Payment Create] Starting with data:', paymentData);
      
      // Create payment record directly - Don't use .single() to avoid coercion issues
      const { data: paymentArray, error: paymentError } = await supabase
        .from('payments')
        .insert({
          proposal_id: paymentData.proposal_id,
          request_id: paymentData.request_id,
          payer_id: paymentData.payer_id,
          payee_id: paymentData.payee_id,
          amount: paymentData.amount,
          status: 'pending',
          stripe_payment_intent_id: paymentData.stripe_payment_intent_id || null,
          currency: 'USD'
        })
        .select();
      
      if (paymentError) {
        console.error('[Payment Create] Insert error:', paymentError);
        throw paymentError;
      }
      
      // Get first payment from array
      const payment = paymentArray && paymentArray.length > 0 ? paymentArray[0] : null;
      if (!payment) {
        throw new Error('Payment creation failed - no data returned');
      }
      
      console.log('[Payment Create] Payment inserted:', payment.id);
      
      // Create initial transaction record
      try {
        await supabase
          .from('transactions')
          .insert({
            payment_id: payment.id,
            user_id: paymentData.payer_id,
            type: 'payment',
            amount: paymentData.amount,
            status: 'pending',
            description: 'Payment initiated for proposal',
            currency: 'USD'
          });
        console.log('[Payment Create] Transaction created');
      } catch (transactionError) {
        console.warn('[Payment Create] Transaction creation failed (non-critical):', transactionError);
        // Continue even if transaction creation fails
      }
      
      // Update proposal with payment_id if possible
      try {
        await supabase
          .from('proposals')
          .update({ payment_id: payment.id })
          .eq('id', paymentData.proposal_id);
        console.log('[Payment Create] Proposal updated');
      } catch (proposalError) {
        console.warn('[Payment Create] Proposal update failed (non-critical):', proposalError);
        // Continue even if proposal update fails
      }
      
      // Return basic payment object - skip getById to avoid relation issues
      console.log('[Payment Create] Returning payment:', payment);
      return payment;
    },

    // Update payment status
    update: async (paymentId, updates) => {
      // Update without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select();
      
      if (error) throw error;
      const payment = data && data.length > 0 ? data[0] : null;
      if (!payment) return null;
      
      // Fetch related data separately
      try {
        const [proposal, payer, payee, request] = await Promise.all([
          payment.proposal_id ? supabase.from('proposals').select('*').eq('id', payment.proposal_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
          payment.payer_id ? supabase.from('users').select('*').eq('id', payment.payer_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
          payment.payee_id ? supabase.from('users').select('*').eq('id', payment.payee_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null),
          payment.request_id ? supabase.from('requests').select('*').eq('id', payment.request_id).maybeSingle().then(r => r.data).catch(() => null) : Promise.resolve(null)
        ]);
        
        return {
          ...payment,
          proposal,
          payer,
          payee,
          request
        };
      } catch (err) {
        console.error('Error fetching payment related data:', err);
        return payment; // Return payment without related data if fetch fails
      }
    },

    // Mark payment as paid (after Stripe confirmation)
    markAsPaid: async (paymentId, stripeChargeId) => {
      return await db.payments.update(paymentId, {
        status: 'held',
        stripe_charge_id: stripeChargeId
      });
    },

    // Release escrow funds (calls database function)
    releaseEscrow: async (paymentId, releasedBy) => {
      const { data, error } = await supabase.rpc('release_escrow_funds', {
        p_payment_id: paymentId,
        p_released_by: releasedBy
      });
      
      if (error) throw error;
      
      // Fetch updated payment
      return await db.payments.getById(paymentId);
    },
  },

  // Transactions table operations
  transactions: {
    // Get transactions for a payment
    getByPayment: async (paymentId) => {
      // Fetch transactions without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_id', paymentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch user data separately for each transaction
      const transactionsWithUsers = await Promise.all(
        data.map(async (transaction) => {
          let userData = null;
          if (transaction.user_id) {
            try {
              const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', transaction.user_id)
                .maybeSingle();
              userData = user;
            } catch (err) {
              console.warn('Error fetching user for transaction:', err);
            }
          }
          return {
            ...transaction,
            users: userData,
            user: userData
          };
        })
      );
      
      return transactionsWithUsers;
    },

    // Get user transactions
    getUserTransactions: async (userId) => {
      // Fetch transactions without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch payment data separately for each transaction
      const transactionsWithPayments = await Promise.all(
        data.map(async (transaction) => {
          let paymentData = null;
          if (transaction.payment_id) {
            try {
              const { data: payment } = await supabase
                .from('payments')
                .select('*')
                .eq('id', transaction.payment_id)
                .maybeSingle();
              
              // Fetch proposal for the payment if exists
              let proposalData = null;
              if (payment && payment.proposal_id) {
                try {
                  const { data: proposal } = await supabase
                    .from('proposals')
                    .select('*')
                    .eq('id', payment.proposal_id)
                    .maybeSingle();
                  
                  // Fetch request for the proposal if exists
                  let requestData = null;
                  if (proposal && proposal.request_id) {
                    try {
                      const { data: request } = await supabase
                        .from('requests')
                        .select('*')
                        .eq('id', proposal.request_id)
                        .maybeSingle();
                      requestData = request;
                    } catch (err) {
                      console.warn('Error fetching request for proposal:', err);
                    }
                  }
                  
                  proposalData = {
                    ...proposal,
                    request: requestData
                  };
                } catch (err) {
                  console.warn('Error fetching proposal for payment:', err);
                }
              }
              
              paymentData = {
                ...payment,
                proposal: proposalData
              };
            } catch (err) {
              console.warn('Error fetching payment for transaction:', err);
            }
          }
          return {
            ...transaction,
            payments: paymentData,
            payment: paymentData
          };
        })
      );
      
      return transactionsWithPayments;
    },
  },
  // Expose supabase client for direct access
  supabase,
};

export default supabase;

