-- =====================================================
-- SKILLBRIDGE DATABASE SCHEMA - COMPLETE & FIXED
-- Run this in your Supabase SQL Editor
-- =====================================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  profile_picture TEXT,
  user_type TEXT CHECK (user_type IN ('customer', 'provider', 'both')) DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  admin_level TEXT CHECK (admin_level IN ('none', 'moderator', 'admin', 'super_admin')) DEFAULT 'none',
  admin_permissions JSONB DEFAULT '[]'::jsonb,
  location JSONB,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;

-- Policies for users table
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. SKILLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  hourly_rate DECIMAL(10, 2),
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read public skills" ON public.skills;
DROP POLICY IF EXISTS "Users can manage their own skills" ON public.skills;
DROP POLICY IF EXISTS "skills_select_policy" ON public.skills;
DROP POLICY IF EXISTS "skills_insert_policy" ON public.skills;
DROP POLICY IF EXISTS "skills_update_policy" ON public.skills;
DROP POLICY IF EXISTS "skills_delete_policy" ON public.skills;

-- Policies for skills table
CREATE POLICY "skills_select_policy" ON public.skills
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR (is_public = true AND is_active = true)
  );

CREATE POLICY "skills_insert_policy" ON public.skills
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skills_update_policy" ON public.skills
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skills_delete_policy" ON public.skills
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 3. REQUESTS TABLE (WITH VIEWS COLUMN)
-- ============================================
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  budget JSONB,
  deadline TIMESTAMP WITH TIME ZONE,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  service_type TEXT CHECK (service_type IN ('local', 'remote', 'both')) DEFAULT 'both',
  tags TEXT[],
  status TEXT CHECK (status IN ('open', 'in_review', 'accepted', 'completed', 'cancelled')) DEFAULT 'open',
  is_public BOOLEAN DEFAULT true,
  location JSONB,
  requirements TEXT[],
  views BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read public requests" ON public.requests;
DROP POLICY IF EXISTS "Users can manage their own requests" ON public.requests;
DROP POLICY IF EXISTS "requests_select_policy" ON public.requests;
DROP POLICY IF EXISTS "requests_insert_policy" ON public.requests;
DROP POLICY IF EXISTS "requests_update_policy" ON public.requests;
DROP POLICY IF EXISTS "requests_delete_policy" ON public.requests;
DROP POLICY IF EXISTS "Allow users to view public requests" ON public.requests;
DROP POLICY IF EXISTS "Allow users to view requests" ON public.requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.requests;
DROP POLICY IF EXISTS "debug_allow_all_requests" ON public.requests;

-- Policies for requests table
CREATE POLICY "requests_select_policy" ON public.requests
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR
    status = 'open' OR
    is_public = true OR
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE proposals.request_id = requests.id 
      AND proposals.user_id = auth.uid()
    )
  );

CREATE POLICY "requests_insert_policy" ON public.requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "requests_update_policy" ON public.requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "requests_delete_policy" ON public.requests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 4. PROPOSALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  proposed_price DECIMAL(10, 2),
  estimated_duration TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read proposals for their requests" ON public.proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "proposals_select_policy" ON public.proposals;
DROP POLICY IF EXISTS "proposals_insert_policy" ON public.proposals;
DROP POLICY IF EXISTS "proposals_update_policy" ON public.proposals;
DROP POLICY IF EXISTS "proposals_delete_policy" ON public.proposals;
DROP POLICY IF EXISTS "Allow proposal updates by owner or request owner" ON public.proposals;
DROP POLICY IF EXISTS "Allow users to view relevant proposals" ON public.proposals;

-- Policies for proposals table
CREATE POLICY "proposals_select_policy" ON public.proposals
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM public.requests WHERE id = proposals.request_id
    )
  );

CREATE POLICY "proposals_insert_policy" ON public.proposals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "proposals_update_policy" ON public.proposals
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM public.requests WHERE id = proposals.request_id
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM public.requests WHERE id = proposals.request_id
    )
  );

CREATE POLICY "proposals_delete_policy" ON public.proposals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 5. CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id, request_id)
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversations_select_policy" ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert_policy" ON public.conversations;

-- Policies for conversations table
CREATE POLICY "conversations_select_policy" ON public.conversations
  FOR SELECT TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "conversations_insert_policy" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- 6. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;

-- Policies for messages table
CREATE POLICY "messages_select_policy" ON public.messages
  FOR SELECT TO authenticated USING (
    auth.uid() = sender_id OR
    auth.uid() IN (
      SELECT user1_id FROM public.conversations WHERE id = messages.conversation_id
      UNION
      SELECT user2_id FROM public.conversations WHERE id = messages.conversation_id
    )
  );

CREATE POLICY "messages_insert_policy" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_policy" ON public.messages
  FOR UPDATE TO authenticated USING (
    auth.uid() = sender_id OR
    auth.uid() IN (
      SELECT user1_id FROM public.conversations WHERE id = messages.conversation_id
      UNION
      SELECT user2_id FROM public.conversations WHERE id = messages.conversation_id
    )
  );

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;

-- Policies for notifications table
CREATE POLICY "notifications_select_policy" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_insert_policy" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "notifications_delete_policy" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_is_active ON public.skills(is_active);

CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_category ON public.requests(category);

CREATE INDEX IF NOT EXISTS idx_proposals_request_id ON public.proposals(request_id);
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON public.conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON public.conversations(user2_id);

-- ============================================
-- 9. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_skills_updated_at ON public.skills;
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_requests_updated_at ON public.requests;
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposals_updated_at ON public.proposals;
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment request views
CREATE OR REPLACE FUNCTION increment_request_views(request_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.requests
  SET views = views + 1
  WHERE id = request_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName',
    COALESCE(NEW.raw_user_meta_data->>'userType', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 10. VERIFY SCHEMA
-- ============================================

-- Verify all policies are correctly created
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname LIKE '%_policy' THEN '✅'
    ELSE '⚠️'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'skills', 'requests', 'proposals', 'conversations', 'messages', 'notifications')
ORDER BY tablename, cmd;

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Good'
    ELSE '⚠️ Check'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'skills', 'requests', 'proposals', 'conversations', 'messages', 'notifications')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- DONE!
-- =====================================================
-- Schema setup complete with all fixes applied!
-- 
-- Key Improvements:
-- ✅ Proper RLS policies for all tables
-- ✅ Request owners can accept/reject proposals
-- ✅ Users can view open/public requests to submit proposals
-- ✅ Views tracking for requests
-- ✅ Unique constraint on proposals (one per user per request)
-- ✅ Proper notification permissions
-- ✅ Admin columns in users table
-- =====================================================


