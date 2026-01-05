import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import SkillsPage from './pages/skills/SkillsPage';
import SkillDetailPage from './pages/skills/SkillDetailPage';
import CreateSkillPage from './pages/skills/CreateSkillPage';
import RequestsPage from './pages/requests/RequestsPage';
import RequestDetailPage from './pages/requests/RequestDetailPage';
import CreateRequestPage from './pages/requests/CreateRequestPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileEditPage from './pages/profile/ProfileEditPage';
import EditProfilePage from './pages/profile/EditProfilePage';
import MessagesPage from './pages/messages/MessagesPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import BrowseSkillsPage from './pages/browse/BrowseSkillsPage';
import CreateProposalPage from './pages/proposals/CreateProposalPage';
import ViewProposalsPage from './pages/proposals/ViewProposalsPage';
// import PaymentPage from './pages/payment/PaymentPage'; // Temporarily disabled
import SupportPage from './pages/support/SupportPage';
import SettingsPage from './pages/settings/SettingsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ContactSellerPage from './pages/contact/ContactSellerPage';

// Static Pages
import AboutPage from './pages/static/AboutPage';
import PrivacyPage from './pages/static/PrivacyPage';
import TermsPage from './pages/static/TermsPage';
import ContactPage from './pages/static/ContactPage';
import HowItWorksPage from './pages/static/HowItWorksPage';
import CareersPage from './pages/static/CareersPage';
import SafetyPage from './pages/static/SafetyPage';
import BusinessPage from './pages/static/BusinessPage';
import SuccessStoriesPage from './pages/static/SuccessStoriesPage';
import GuidelinesPage from './pages/static/GuidelinesPage';
import EnterprisePage from './pages/static/EnterprisePage';
import PartnershipsPage from './pages/static/PartnershipsPage';
import BlogPage from './pages/static/BlogPage';

// Context hooks
import { useAuth } from './contexts/SupabaseAuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return !user ? children : <Navigate to="/dashboard" replace />;
};

// Page Animation Wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

function App() {
  const { loading } = useAuth();

  // Log to verify App component is rendering
  console.log('App component rendering, loading:', loading);

  if (loading) {
    console.log('Showing loading spinner...');
    return <LoadingSpinner />;
  }

  console.log('Rendering main app...');
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'background.default'
    }}>
      <Navbar />
      
      <Box component="main" sx={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <PageWrapper>
                  <HomePage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <PageWrapper>
                    <LoginPage />
                  </PageWrapper>
                </PublicRoute>
              } 
            />
            
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <PageWrapper>
                    <RegisterPage />
                  </PageWrapper>
                </PublicRoute>
              } 
            />
            
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <PageWrapper>
                    <ForgotPasswordPage />
                  </PageWrapper>
                </PublicRoute>
              } 
            />
            
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute>
                  <PageWrapper>
                    <ResetPasswordPage />
                  </PageWrapper>
                </PublicRoute>
              } 
            />

            {/* Change Password (Protected) */}
            <Route 
              path="/change-password" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <ChangePasswordPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />

            {/* OAuth Callback */}
            <Route 
              path="/auth/callback" 
              element={
                <PageWrapper>
                  <AuthCallbackPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/skills" 
              element={
                <PageWrapper>
                  <SkillsPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/skills/:id" 
              element={
                <PageWrapper>
                  <SkillDetailPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/requests" 
              element={
                <PageWrapper>
                  <RequestsPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/requests/:id" 
              element={
                <PageWrapper>
                  <RequestDetailPage />
                </PageWrapper>
              } 
            />

            {/* Send Proposal */}
            <Route 
              path="/requests/:requestId/proposal" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <CreateProposalPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />

            {/* View Proposals */}
            <Route 
              path="/proposals" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <ViewProposalsPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />

        {/* Payment - Temporarily Disabled */}
        {/* <Route 
          path="/payment/:paymentId" 
          element={
            <ProtectedRoute>
              <PageWrapper>
                <PaymentPage />
              </PageWrapper>
            </ProtectedRoute>
          } 
        /> */}
            
            <Route 
              path="/search" 
              element={
                <PageWrapper>
                  <SearchPage />
                </PageWrapper>
              } 
            />

            {/* Top Rated */}
            <Route 
              path="/browse" 
              element={
                <PageWrapper>
                  <BrowseSkillsPage />
                </PageWrapper>
              } 
            />

            {/* Support & Help Center */}
            <Route 
              path="/support" 
              element={
                <PageWrapper>
                  <SupportPage />
                </PageWrapper>
              } 
            />

            {/* Static Footer Pages */}
            <Route 
              path="/about" 
              element={
                <PageWrapper>
                  <AboutPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/privacy" 
              element={
                <PageWrapper>
                  <PrivacyPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/terms" 
              element={
                <PageWrapper>
                  <TermsPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/contact" 
              element={
                <PageWrapper>
                  <ContactPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/how-it-works" 
              element={
                <PageWrapper>
                  <HowItWorksPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/careers" 
              element={
                <PageWrapper>
                  <CareersPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/safety" 
              element={
                <PageWrapper>
                  <SafetyPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/business" 
              element={
                <PageWrapper>
                  <BusinessPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/enterprise" 
              element={
                <PageWrapper>
                  <EnterprisePage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/success-stories" 
              element={
                <PageWrapper>
                  <SuccessStoriesPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/guidelines" 
              element={
                <PageWrapper>
                  <GuidelinesPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/partnerships" 
              element={
                <PageWrapper>
                  <PartnershipsPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/partner" 
              element={
                <PageWrapper>
                  <PartnershipsPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/blog" 
              element={
                <PageWrapper>
                  <BlogPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/press" 
              element={
                <PageWrapper>
                  <BlogPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/cookies" 
              element={
                <PageWrapper>
                  <PrivacyPage />
                </PageWrapper>
              } 
            />
            
            <Route 
              path="/ip" 
              element={
                <PageWrapper>
                  <TermsPage />
                </PageWrapper>
              } 
            />
            
            {/* Profile Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <ProfilePage />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <PageWrapper>
                  <ProfilePage />
                </PageWrapper>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <ProfileEditPage />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />

            {/* Contact Seller */}
            <Route 
              path="/contact/:sellerId" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <ContactSellerPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <DashboardPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/skills/create" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <CreateSkillPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/requests/create" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <CreateRequestPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <MessagesPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/messages/:userId" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <MessagesPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <SettingsPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <NotificationsPage />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <AdminDashboard />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/provider/dashboard" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <ProviderDashboard />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />

            {/* Client Dashboard */}
            <Route 
              path="/client/dashboard" 
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <ClientDashboard />
                  </PageWrapper>
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                <PageWrapper>
                  <NotFoundPage />
                </PageWrapper>
              } 
            />
          </Routes>
        </AnimatePresence>
      </Box>
      
      <Footer />
    </Box>
  );
}

export default App;
