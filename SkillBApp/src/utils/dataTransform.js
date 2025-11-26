// Utility functions to transform Supabase data to match component expectations

/**
 * Transform Supabase request data to component format
 */
export const transformRequest = (dbRequest) => {
  if (!dbRequest) return null;

  return {
    id: dbRequest.id,
    _id: dbRequest.id,
    title: dbRequest.title,
    description: dbRequest.description,
    category: dbRequest.category,
    budget: dbRequest.budget || { min: 0, max: 0, type: 'fixed' },
    deadline: dbRequest.deadline ? new Date(dbRequest.deadline) : null,
    urgency: dbRequest.urgency || 'medium',
    tags: dbRequest.tags || [],
    status: dbRequest.status || 'open',
    isPublic: dbRequest.is_public !== false,
    location: dbRequest.location || {},
    requirements: dbRequest.requirements || [],
    createdAt: dbRequest.created_at ? new Date(dbRequest.created_at) : new Date(),
    updatedAt: dbRequest.updated_at ? new Date(dbRequest.updated_at) : new Date(),
    userId: dbRequest.user_id,
    user_id: dbRequest.user_id,
    customer: dbRequest.users ? transformUser(dbRequest.users) : null,
    user: dbRequest.users ? transformUser(dbRequest.users) : null,
    proposals: dbRequest.proposal_count !== undefined 
      ? dbRequest.proposal_count 
      : (Array.isArray(dbRequest.proposals) ? dbRequest.proposals.length : 0),
    views: dbRequest.views || 0,
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
    bio: dbUser.bio || '',
    profilePicture: dbUser.profile_picture || '',
    userType: dbUser.user_type || 'customer',
    isVerified: dbUser.is_verified || false,
    location: dbUser.location || {},
    joinedAt: dbUser.created_at ? new Date(dbUser.created_at) : new Date(),
    name: `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim() || dbUser.email,
    avatar: dbUser.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.first_name || dbUser.email)}&background=000080&color=fff`,
  };
};

/**
 * Format time ago (e.g., "2 hours ago")
 */
export const formatTimeAgo = (date) => {
  if (!date) return 'just now';
  const now = new Date();
  const timestamp = date instanceof Date ? date : new Date(date);
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 604800)}w ago`;
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
    message: dbProposal.message || dbProposal.cover_letter || '',
    proposedPrice: dbProposal.proposed_price || dbProposal.budget || 0,
    proposed_price: dbProposal.proposed_price || dbProposal.budget || 0,
    estimatedDuration: dbProposal.estimated_duration || dbProposal.timeline || '',
    estimated_duration: dbProposal.estimated_duration || dbProposal.timeline || '',
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
 * Format deadline
 */
export const formatDeadline = (deadline) => {
  if (!deadline) return 'No deadline';
  const date = deadline instanceof Date ? deadline : new Date(deadline);
  const now = new Date();
  const diffInDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) return 'Overdue';
  if (diffInDays === 0) return 'Due today';
  if (diffInDays === 1) return 'Due tomorrow';
  if (diffInDays < 7) return `Due in ${diffInDays} days`;
  return date.toLocaleDateString();
};


