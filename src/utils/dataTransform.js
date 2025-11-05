// Utility functions to transform Supabase data to match component expectations

/**
 * Transform Supabase request data to component format
 */
export const transformRequest = (dbRequest) => {
  if (!dbRequest) return null;

  return {
    id: dbRequest.id,
    _id: dbRequest.id, // For backward compatibility
    title: dbRequest.title,
    description: dbRequest.description,
    category: dbRequest.category,
    budget: dbRequest.budget || { min: 0, max: 0, type: 'fixed' },
    deadline: dbRequest.deadline ? new Date(dbRequest.deadline) : null,
    urgency: dbRequest.urgency || 'medium',
    serviceType: dbRequest.service_type || 'both',
    tags: dbRequest.tags || [],
    status: dbRequest.status || 'open',
    isPublic: dbRequest.is_public !== false,
    location: dbRequest.location || {},
    requirements: dbRequest.requirements || [],
    createdAt: dbRequest.created_at ? new Date(dbRequest.created_at) : new Date(),
    updatedAt: dbRequest.updated_at ? new Date(dbRequest.updated_at) : new Date(),
    // User ID - critical for owner checks
    userId: dbRequest.user_id,
    user_id: dbRequest.user_id,
    // Transform user data
    customer: dbRequest.users ? transformUser(dbRequest.users) : null,
    user: dbRequest.users ? transformUser(dbRequest.users) : null,
    // Count proposals - handle both array and count formats
    proposals: dbRequest.proposal_count !== undefined 
      ? dbRequest.proposal_count 
      : (Array.isArray(dbRequest.proposals) ? dbRequest.proposals.length : 0),
    views: 0, // TODO: Add views tracking to database
  };
};

/**
 * Transform Supabase user data to component format
 */
export const transformUser = (dbUser) => {
  if (!dbUser) return null;

  return {
    id: dbUser.id,
    _id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name || '',
    lastName: dbUser.last_name || '',
    first_name: dbUser.first_name,
    last_name: dbUser.last_name,
    bio: dbUser.bio || '',
    profilePicture: dbUser.profile_picture || '',
    profile_picture: dbUser.profile_picture || '',
    userType: dbUser.user_type || 'customer',
    user_type: dbUser.user_type || 'customer',
    isVerified: dbUser.is_verified || false,
    is_verified: dbUser.is_verified || false,
    location: dbUser.location || {},
    preferences: dbUser.preferences || {},
    joinedAt: dbUser.created_at ? new Date(dbUser.created_at) : new Date(),
    created_at: dbUser.created_at,
    // For display
    name: `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim() || dbUser.email,
    avatar: dbUser.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.first_name || dbUser.email)}&background=000080&color=fff`,
  };
};

/**
 * Transform Supabase skill data to component format
 */
export const transformSkill = (dbSkill) => {
  if (!dbSkill) return null;

  return {
    id: dbSkill.id,
    _id: dbSkill.id,
    title: dbSkill.title,
    description: dbSkill.description || '',
    category: dbSkill.category,
    hourlyRate: dbSkill.hourly_rate || 0,
    hourly_rate: dbSkill.hourly_rate || 0,
    tags: dbSkill.tags || [],
    isActive: dbSkill.is_active !== false,
    is_active: dbSkill.is_active !== false,
    isPublic: dbSkill.is_public !== false,
    is_public: dbSkill.is_public !== false,
    createdAt: dbSkill.created_at ? new Date(dbSkill.created_at) : new Date(),
    updatedAt: dbSkill.updated_at ? new Date(dbSkill.updated_at) : new Date(),
    // Transform user if included
    user: dbSkill.users ? transformUser(dbSkill.users) : null,
    userId: dbSkill.user_id,
    user_id: dbSkill.user_id,
  };
};

/**
 * Transform Supabase proposal data to component format
 */
export const transformProposal = (dbProposal) => {
  if (!dbProposal) return null;

  return {
    id: dbProposal.id,
    _id: dbProposal.id,
    requestId: dbProposal.request_id,
    request_id: dbProposal.request_id,
    message: dbProposal.message,
    proposedPrice: dbProposal.proposed_price || 0,
    proposed_price: dbProposal.proposed_price || 0,
    estimatedDuration: dbProposal.estimated_duration || '',
    estimated_duration: dbProposal.estimated_duration || '',
    status: dbProposal.status || 'pending',
    createdAt: dbProposal.created_at ? new Date(dbProposal.created_at) : new Date(),
    updatedAt: dbProposal.updated_at ? new Date(dbProposal.updated_at) : new Date(),
    // Transform user if included
    user: dbProposal.users ? transformUser(dbProposal.users) : null,
    userId: dbProposal.user_id,
    user_id: dbProposal.user_id,
    // Transform request if included
    request: dbProposal.requests ? transformRequest(dbProposal.requests) : null,
  };
};

/**
 * Transform Supabase notification data to component format
 */
export const transformNotification = (dbNotification) => {
  if (!dbNotification) return null;

  return {
    id: dbNotification.id,
    _id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message,
    type: dbNotification.type || 'info',
    read: dbNotification.read || false,
    isRead: dbNotification.read || false,
    relatedId: dbNotification.related_id,
    related_id: dbNotification.related_id,
    createdAt: dbNotification.created_at ? new Date(dbNotification.created_at) : new Date(),
    timestamp: dbNotification.created_at ? new Date(dbNotification.created_at) : new Date(),
  };
};

/**
 * Transform Supabase message data to component format
 */
export const transformMessage = (dbMessage) => {
  if (!dbMessage) return null;

  return {
    id: dbMessage.id,
    _id: dbMessage.id,
    conversationId: dbMessage.conversation_id,
    conversation_id: dbMessage.conversation_id,
    content: dbMessage.content,
    read: dbMessage.read || false,
    isRead: dbMessage.read || false,
    createdAt: dbMessage.created_at ? new Date(dbMessage.created_at) : new Date(),
    timestamp: dbMessage.created_at ? new Date(dbMessage.created_at) : new Date(),
    // Transform sender if included
    sender: dbMessage.sender || (dbMessage.users ? transformUser(dbMessage.users) : null),
    senderId: dbMessage.sender_id,
    sender_id: dbMessage.sender_id,
  };
};

/**
 * Format time ago (e.g., "2 hours ago")
 */
export const formatTimeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const then = date instanceof Date ? date : new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return then.toLocaleDateString();
};

/**
 * Format deadline (e.g., "6 weeks" or "3 days")
 */
export const formatDeadline = (deadline) => {
  if (!deadline) return 'No deadline';
  
  const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
  const now = new Date();
  const diffInDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return 'Overdue';
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays < 7) return `${diffInDays} days`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`;
  
  return `${Math.floor(diffInDays / 365)} years`;
};

