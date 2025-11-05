import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Avatar } from '@mui/material';
import { Security, VerifiedUser, Payment, Report, Shield, Lock } from '@mui/icons-material';
import { motion } from 'framer-motion';

const SafetyPage = () => {
  const safetyFeatures = [
    {
      icon: <VerifiedUser />,
      title: 'Identity Verification',
      description: 'All users go through a comprehensive verification process including ID checks and skill assessments.'
    },
    {
      icon: <Payment />,
      title: 'Secure Payments',
      description: 'Payments are processed through encrypted channels with escrow protection for both parties.'
    },
    {
      icon: <Shield />,
      title: 'Privacy Protection',
      description: 'Your personal information is protected with enterprise-grade security and encryption.'
    },
    {
      icon: <Report />,
      title: 'Dispute Resolution',
      description: 'Fair and transparent dispute resolution process with dedicated mediation team.'
    },
    {
      icon: <Lock />,
      title: 'Data Security',
      description: 'Industry-standard security protocols protect your data with regular security audits.'
    },
    {
      icon: <Security />,
      title: '24/7 Monitoring',
      description: 'Continuous monitoring for suspicious activities and automated fraud detection.'
    }
  ];

  const tips = [
    {
      title: 'Verify Before You Work',
      description: 'Always check client reviews, payment history, and verification status before accepting projects.'
    },
    {
      title: 'Use Platform Communication',
      description: 'Keep all communication within SkillBridge to ensure protection and maintain records.'
    },
    {
      title: 'Set Clear Expectations',
      description: 'Define project scope, deliverables, and timelines clearly before starting work.'
    },
    {
      title: 'Report Suspicious Activity',
      description: 'Report any suspicious behavior, spam, or fraudulent activities immediately.'
    },
    {
      title: 'Protect Your Account',
      description: 'Use strong passwords, enable two-factor authentication, and never share login credentials.'
    },
    {
      title: 'Trust Your Instincts',
      description: 'If something feels wrong or too good to be true, trust your instincts and seek help.'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Safety & Security
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Your safety and security are our top priorities. Learn about the measures we take 
            to protect our community.
          </Typography>
        </Box>
      </motion.div>

      {/* Safety Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            How We Keep You Safe
          </Typography>
          <Grid container spacing={3}>
            {safetyFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      mx: 'auto', 
                      mb: 3,
                      width: 64,
                      height: 64
                    }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Safety Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            Safety Tips for Users
          </Typography>
          <Grid container spacing={3}>
            {tips.map((tip, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'success.main', 
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        width: 32,
                        height: 32,
                        mt: 0.5
                      }}>
                        {index + 1}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {tip.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tip.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Trust & Safety Commitment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 3 }}>
              Our Commitment to You
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
              We are committed to maintaining the highest standards of safety and security. Our dedicated 
              Trust & Safety team works around the clock to protect our community and ensure a positive 
              experience for all users.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
              If you ever feel unsafe or encounter suspicious activity, please don't hesitate to contact 
              our support team immediately. We take all reports seriously and will investigate promptly.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emergency Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Card sx={{ mt: 4, textAlign: 'center', bgcolor: 'error.main', color: 'white' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Need Immediate Help?
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Contact our Trust & Safety team immediately
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              safety@skillbridge.app
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default SafetyPage;


