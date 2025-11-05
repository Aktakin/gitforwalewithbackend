import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CssBaseline, Container, Typography, Box, Button, AppBar, Toolbar } from '@mui/material';

import './index.css';

// Simple HomePage Component
const HomePage = () => (
  <Container maxWidth="lg" sx={{ py: 8 }}>
    <Box textAlign="center">
      <Typography variant="h2" component="h1" gutterBottom sx={{
        fontWeight: 700,
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        SkillBridge
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
        Connect. Collaborate. Create.
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        Your premier platform for skill sharing and professional collaboration. 
        Find talented professionals or showcase your expertise to a global community.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" size="large" component={Link} to="/browse">
          Browse Skills
        </Button>
        <Button variant="outlined" size="large" component={Link} to="/profile/user123">
          View Profile
        </Button>
        <Button variant="outlined" size="large" component={Link} to="/contact/seller123">
          Contact Seller
        </Button>
      </Box>
    </Box>
  </Container>
);

// Simple Profile Page
const ProfilePage = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Developer Profile</Typography>
    <Typography variant="body1">
      This is a comprehensive profile page showcasing developer skills, portfolio, and experience.
      In the full application, this includes interactive tabs for Overview, Portfolio, Reviews, and About sections.
    </Typography>
    <Button component={Link} to="/" sx={{ mt: 2 }}>← Back to Home</Button>
  </Container>
);

// Simple Contact Page
const ContactPage = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Contact Seller</Typography>
    <Typography variant="body1">
      Professional contact form for reaching out to service providers.
      Includes project details, budget information, and timeline requirements.
    </Typography>
    <Button component={Link} to="/" sx={{ mt: 2 }}>← Back to Home</Button>
  </Container>
);

// Simple Browse Page
const BrowsePage = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Top Rated Skills</Typography>
    <Typography variant="body1">
      Discover and browse top-rated professionals across various skill categories.
      Features filtering, sorting, and detailed skill profiles.
    </Typography>
    <Button component={Link} to="/" sx={{ mt: 2 }}>← Back to Home</Button>
  </Container>
);

// Simple Navigation
const Navigation = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" component={Link} to="/" sx={{ 
        flexGrow: 1, 
        textDecoration: 'none', 
        color: 'inherit',
        fontWeight: 700 
      }}>
        SkillBridge
      </Typography>
      <Button color="inherit" component={Link} to="/browse">Top Rated</Button>
      <Button color="inherit" component={Link} to="/profile/user123">Profile</Button>
      <Button color="inherit" component={Link} to="/contact/seller123">Contact</Button>
    </Toolbar>
  </AppBar>
);

// Main App Component
const App = () => (
  <BrowserRouter>
    <CssBaseline />
    <Navigation />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
      <Route path="/contact/:sellerId" element={<ContactPage />} />
      <Route path="*" element={
        <Container sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>Page Not Found</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            The page you're looking for doesn't exist.
          </Typography>
          <Button component={Link} to="/" variant="contained">
            Go Home
          </Button>
        </Container>
      } />
    </Routes>
  </BrowserRouter>
);

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


