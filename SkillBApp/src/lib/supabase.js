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

    // Get skill by ID
    getById: async (skillId) => {
      // Fetch skill without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      // Fetch user data separately
      let userData = null;
      if (data.user_id) {
        try {
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user_id)
            .maybeSingle();
          userData = user;
        } catch (err) {
          console.warn('Error fetching user for skill:', err);
        }
      }
      
      return {
        ...data,
        users: userData,
        user: userData
      };
    },
  },

  // Requests table operations
  requests: {
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

      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch proposal counts for all requests separately
      const requestIds = data.map(r => r.id);
      const proposalCountsMap = {};
      
      if (requestIds.length > 0) {
        try {
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

    getById: async (requestId) => {
      try {
        console.log('[requests.getById] Fetching request:', requestId);
        
        // Try simple query first (without relations to avoid JSON coercion issues)
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('id', requestId)
          .maybeSingle();
        
        if (error) {
          console.error('[requests.getById] Error:', error);
          throw error;
        }
        if (!data) {
          console.warn('[requests.getById] Request not found or not accessible:', requestId);
          return null;
        }
        
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
        throw error;
      }
      
      return data;
    },

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

    delete: async (requestId) => {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId);
      
      if (error) throw error;
    },

    getByUser: async (userId) => {
      // Fetch requests without joins to avoid JSON coercion issues
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch proposal counts for all requests
      const requestIds = data.map(r => r.id);
      const proposalCountsMap = {};
      
      if (requestIds.length > 0) {
        try {
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
        try {
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
        } catch (notifError) {
          console.warn('Failed to create message notification:', notifError);
        }

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

    // Create payment (calls database function or direct insert)
    create: async (paymentData) => {
      // Try RPC function first, fallback to direct insert
      try {
        const { data: paymentId, error } = await supabase.rpc('create_payment_with_transaction', {
          p_proposal_id: paymentData.proposal_id,
          p_request_id: paymentData.request_id,
          p_payer_id: paymentData.payer_id,
          p_payee_id: paymentData.payee_id,
          p_amount: paymentData.amount,
          p_stripe_payment_intent_id: paymentData.stripe_payment_intent_id || null,
          p_is_escrow: paymentData.is_escrow !== false, // Default to true for escrow
        });
        
        if (error) throw error;
        
        // Fetch the created payment with all relations
        return await db.payments.getById(paymentId);
      } catch (rpcError) {
        // Fallback to direct insert if RPC doesn't exist
        console.warn('RPC function not available, using direct insert:', rpcError);
        
        const { data: payment, error } = await supabase
          .from('payments')
          .insert({
            proposal_id: paymentData.proposal_id,
            request_id: paymentData.request_id,
            payer_id: paymentData.payer_id,
            payee_id: paymentData.payee_id,
            amount: paymentData.amount,
            currency: paymentData.currency || 'USD',
            status: 'pending',
            payment_type: paymentData.payment_type || 'proposal_acceptance',
            stripe_payment_intent_id: paymentData.stripe_payment_intent_id || null,
            is_escrow: paymentData.is_escrow !== false, // Default to true for escrow (matching web app)
            metadata: paymentData.metadata || {},
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Create transaction record
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
              currency: paymentData.currency || 'USD',
            });
        } catch (transactionError) {
          console.warn('Transaction creation failed (non-critical):', transactionError);
        }
        
        return await db.payments.getById(payment.id);
      }
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

    // Mark payment as paid (matching web app escrow flow)
    markAsPaid: async (paymentId, stripeChargeId) => {
      // Get payment to check if escrow is enabled
      const payment = await db.payments.getById(paymentId);
      
      // If escrow is enabled, set status to 'held' (matching web app)
      // Otherwise set to 'succeeded'
      const status = payment.is_escrow !== false ? 'held' : 'succeeded';
      
      return await db.payments.update(paymentId, {
        status: status,
        stripe_charge_id: stripeChargeId,
        paid_at: new Date().toISOString(),
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
