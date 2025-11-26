import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get Supabase credentials from environment variables
// Expo uses EXPO_PUBLIC_ prefix for environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey;

// Check if credentials are properly configured
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://your-project.supabase.co' || 
    supabaseAnonKey === 'your-anon-key') {
  console.error(
    '❌ Supabase credentials not configured!\n' +
    'Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file\n' +
    'Or configure them in app.json under extra section.'
  );
}

// Create Supabase client with AsyncStorage for React Native
export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Database helper functions
export const db = {
  users: {
    getProfile: async (userId) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },

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

    createProfile: async (profileData) => {
      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    search: async (searchQuery = '') => {
      let query = supabase
        .from('users')
        .select('id, email, first_name, last_name, user_type, profile_picture, is_verified')
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchQuery.trim()) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },

    getPublicProfile: async (userId) => {
      // Get public profile information for any user
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
        .select('*, users(*)')
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
      return data;
    },

    // Get skill by ID
    getById: async (skillId) => {
      const { data, error } = await supabase
        .from('skills')
        .select('*, users(*)')
        .eq('id', skillId)
        .single();
      
      if (error) throw error;
      return data;
    },
  },

  // Requests table operations
  requests: {
    getAll: async (filters = {}) => {
      let query = supabase
        .from('requests')
        .select('*, users(*)')
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      } else if (!filters.userId) {
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

      const page = filters.page || 1;
      const pageSize = filters.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch proposal counts
      const requestIds = data.map(r => r.id);
      const proposalCountsMap = {};
      
      if (requestIds.length > 0) {
        try {
          await Promise.all(
            requestIds.map(async (reqId) => {
              try {
                const { count } = await supabase
                  .from('proposals')
                  .select('*', { count: 'exact', head: true })
                  .eq('request_id', reqId);
                
                proposalCountsMap[reqId] = count || 0;
              } catch (err) {
                proposalCountsMap[reqId] = 0;
              }
            })
          );
        } catch (err) {
          requestIds.forEach(reqId => {
            proposalCountsMap[reqId] = 0;
          });
        }
      }
      
      return data.map(request => ({
        ...request,
        proposal_count: proposalCountsMap[request.id] || 0
      }));
    },

    getById: async (requestId) => {
      const { data, error } = await supabase
        .from('requests')
        .select('*, users(*)')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      
      let proposalCount = 0;
      try {
        const { count } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', requestId);
        
        proposalCount = count || 0;
      } catch (err) {
        console.warn('Error fetching proposal count:', err);
      }
      
      return {
        ...data,
        proposal_count: proposalCount
      };
    },

    create: async (requestData) => {
      const { data, error } = await supabase
        .from('requests')
        .insert(requestData)
        .select('*, users(*)')
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (requestId, updates) => {
      const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', requestId)
        .select('*, users(*)')
        .single();
      
      if (error) throw error;
      return data;
    },

    delete: async (requestId) => {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId);
      
      if (error) throw error;
    },

    getByUser: async (userId) => {
      const { data, error } = await supabase
        .from('requests')
        .select('*, users(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch proposal counts
      const requestIds = data.map(r => r.id);
      const proposalCountsMap = {};
      
      if (requestIds.length > 0) {
        try {
          await Promise.all(
            requestIds.map(async (reqId) => {
              try {
                const { count } = await supabase
                  .from('proposals')
                  .select('*', { count: 'exact', head: true })
                  .eq('request_id', reqId);
                
                proposalCountsMap[reqId] = count || 0;
              } catch (err) {
                proposalCountsMap[reqId] = 0;
              }
            })
          );
        } catch (err) {
          requestIds.forEach(reqId => {
            proposalCountsMap[reqId] = 0;
          });
        }
      }
      
      return data.map(request => ({
        ...request,
        proposal_count: proposalCountsMap[request.id] || 0
      }));
    },

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
            .select('views')
            .eq('id', requestId)
            .single();
          
          if (!fallbackError && fallbackData) {
            const newViews = (fallbackData.views || 0) + 1;
            await supabase
              .from('requests')
              .update({ views: newViews })
              .eq('id', requestId);
            return newViews;
          }
          return 0;
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

    create: async (proposalData) => {
      // Create without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('proposals')
        .insert(proposalData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Fetch related data separately
      let userData = null;
      let requestData = null;
      
      if (data.user_id) {
        try {
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user_id)
            .maybeSingle();
          userData = user;
        } catch (err) {
          console.warn('Error fetching user data:', err);
        }
      }
      
      if (data.request_id) {
        try {
          const { data: request } = await supabase
            .from('requests')
            .select('*')
            .eq('id', data.request_id)
            .maybeSingle();
          requestData = request;
        } catch (err) {
          console.warn('Error fetching request data:', err);
        }
      }
      
      return {
        ...data,
        users: userData,
        user: userData,
        requests: requestData,
        request: requestData
      };
    },

    update: async (proposalId, updates) => {
      // Update without relations to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', proposalId)
        .select();
      
      if (error) throw error;
      // Return the first result from array
      return data && data.length > 0 ? data[0] : data;
    },

    delete: async (proposalId) => {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId);
      
      if (error) throw error;
    },

    getById: async (proposalId) => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, users(*), requests(*)')
        .eq('id', proposalId)
        .single();
      
      if (error) throw error;
      return data;
    },

    accept: async (proposalId, requestId) => {
      // Accept the proposal - don't use .single() to avoid coercion issues
      const { data: proposalArray, error: proposalError } = await supabase
        .from('proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId)
        .select();
      
      if (proposalError) throw proposalError;
      
      const proposal = proposalArray && proposalArray.length > 0 ? proposalArray[0] : null;
      
      // Reject all other proposals for this request
      await supabase
        .from('proposals')
        .update({ status: 'rejected' })
        .eq('request_id', requestId)
        .neq('id', proposalId);
      
      // Update request status to accepted
      await supabase
        .from('requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);
      
      return proposal;
    },

    reject: async (proposalId) => {
      // Reject the proposal - don't use .single() to avoid coercion issues
      const { data, error } = await supabase
        .from('proposals')
        .update({ status: 'rejected' })
        .eq('id', proposalId)
        .select();
      
      if (error) throw error;
      // Return the first result from array
      return data && data.length > 0 ? data[0] : data;
    },
  },

  // Conversations and Messages
  conversations: {
    getUserConversations: async (userId) => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:users!conversations_user1_id_fkey(*),
          user2:users!conversations_user2_id_fkey(*),
          requests(*)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
      return data || [];
    },

    getOrCreate: async (user1Id, user2Id) => {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
        .maybeSingle();
      
      if (existing) return existing;
      
      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: user1Id < user2Id ? user1Id : user2Id,
          user2_id: user1Id < user2Id ? user2Id : user1Id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },

  messages: {
    getConversation: async (conversationId) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users!messages_sender_id_fkey(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },

    send: async (messageData) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', messageData.conversation_id);
      
      return data;
    },
  },

  // Notifications
  notifications: {
    getUserNotifications: async (userId) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },

    markAsRead: async (notificationId) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
  },

  // Payments table operations
  payments: {
    // Get payment by ID
    getById: async (paymentId) => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, proposals(*, requests(*), users(*)), payer:users!payments_payer_id_fkey(*), payee:users!payments_payee_id_fkey(*)')
        .eq('id', paymentId)
        .single();
      
      if (error) throw error;
      return data;
    },

    // Get payment by proposal ID
    getByProposal: async (proposalId) => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, proposals(*, requests(*), users(*)), payer:users!payments_payer_id_fkey(*), payee:users!payments_payee_id_fkey(*)')
        .eq('proposal_id', proposalId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },

    // Get payments for a user
    getUserPayments: async (userId) => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, proposals(*, requests(*), users(*)), payer:users!payments_payer_id_fkey(*), payee:users!payments_payee_id_fkey(*)')
        .or(`payer_id.eq.${userId},payee_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // Create payment (calls database function)
    create: async (paymentData) => {
      const { data: paymentId, error } = await supabase.rpc('create_payment_with_transaction', {
        p_proposal_id: paymentData.proposal_id,
        p_request_id: paymentData.request_id,
        p_payer_id: paymentData.payer_id,
        p_payee_id: paymentData.payee_id,
        p_amount: paymentData.amount,
        p_stripe_payment_intent_id: paymentData.stripe_payment_intent_id || null
      });
      
      if (error) throw error;
      
      // Fetch the created payment with all relations
      return await db.payments.getById(paymentId);
    },

    // Update payment status
    update: async (paymentId, updates) => {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select('*, proposals(*, requests(*), users(*)), payer:users!payments_payer_id_fkey(*), payee:users!payments_payee_id_fkey(*)')
        .single();
      
      if (error) throw error;
      return data;
    },

    // Mark payment as paid
    markAsPaid: async (paymentId, stripeChargeId) => {
      return await db.payments.update(paymentId, {
        status: 'held',
        stripe_charge_id: stripeChargeId
      });
    },

    // Release escrow funds
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
};

export default supabase;
