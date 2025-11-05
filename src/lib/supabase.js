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
  },

  // Requests table operations
  requests: {
    // Get all requests
    getAll: async (filters = {}) => {
      // First fetch requests
      let query = supabase
        .from('requests')
        .select('*, users(*)')
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

      const { data, error } = await query;
      
      if (error) throw error;
      
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
      
      // Process the data to add proposal count
      const requestsWithCounts = data.map(request => ({
        ...request,
        proposal_count: proposalCountsMap[request.id] || 0
      }));
      
      return requestsWithCounts;
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
      const { data, error } = await supabase
        .from('requests')
        .select('*, users(*)')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      
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
      
      // Add proposal count
      const requestWithCount = {
        ...data,
        proposal_count: proposalCount
      };
      
      return requestWithCount;
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
      const { data, error } = await supabase
        .from('requests')
        .insert(requestData)
        .select()
        .single();
      
      if (error) throw error;
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
  },

  // Proposals table operations
  proposals: {
    // Get proposals for a request
    getByRequest: async (requestId) => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, users(*)')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // Get proposals for a user
    getUserProposals: async (userId) => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, requests(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
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
        .single();

      if (requestData && requestData.user_id !== proposalData.user_id) {
        // Get proposal submitter info
        const { data: submitterData } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', proposalData.user_id)
          .single();

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
      // First get the proposal with request info to check permissions and get old status
      const { data: proposal, error: fetchError } = await supabase
        .from('proposals')
        .select('*, requests!inner(id, user_id, title)')
        .eq('id', proposalId)
        .single();

      if (fetchError) throw fetchError;

      const oldStatus = proposal.status;
      const requestData = Array.isArray(proposal.requests) ? proposal.requests[0] : proposal.requests;

      // Update the proposal
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', proposalId)
        .select()
        .single();
      
      if (error) throw error;

      // If status changed, notify the proposal submitter
      if (updates.status && updates.status !== oldStatus && requestData) {
        // Get request owner info for notification
        const { data: requestOwnerData } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', requestData.user_id)
          .single();

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
      }

      return data;
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
      const { data, error } = await supabase
        .from('conversations')
        .select('*, user1:users!conversations_user1_id_fkey(*), user2:users!conversations_user2_id_fkey(*), requests(*)')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch last message for each conversation
      const conversationsWithMessages = await Promise.all(
        data.map(async (conv) => {
          try {
            // Get the last message for this conversation
            const { data: lastMessages } = await supabase
              .from('messages')
              .select('*, sender_id, content, created_at')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            return {
              ...conv,
              last_message: lastMessages?.content || null,
              last_message_sender_id: lastMessages?.sender_id || null,
              last_message_created_at: lastMessages?.created_at || null,
            };
          } catch (err) {
            console.error('Error fetching last message for conversation:', conv.id, err);
            return {
              ...conv,
              last_message: null,
              last_message_sender_id: null,
              last_message_created_at: null,
            };
          }
        })
      );
      
      return conversationsWithMessages;
    },
  },

  // Messages table operations
  messages: {
    // Get messages for a conversation
    getConversation: async (conversationId) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users!messages_sender_id_fkey(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },

    // Send a message
    send: async (messageData) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select('*, sender:users!messages_sender_id_fkey(*)')
        .single();
      
      if (error) throw error;

      // Get conversation to find the recipient
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', messageData.conversation_id)
        .single();

      if (!convError && conversation) {
        // Determine the recipient (the other user in the conversation)
        const recipientId = conversation.user1_id === messageData.sender_id 
          ? conversation.user2_id 
          : conversation.user1_id;

        // Get sender info for notification
        const { data: senderData } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', messageData.sender_id)
          .single();

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
      
      return data;
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
};

export default supabase;

