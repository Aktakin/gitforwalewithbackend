import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Avatar, Step, StepLabel, Stepper } from '@mui/material';
import { Search, Work, Payment, Star, PersonAdd, Assignment, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

const HowItWorksPage = () => {
  const forFreelancers = [
    {
      icon: <PersonAdd />,
      title: 'Create Your Profile',
      description: 'Sign up and showcase your skills, experience, and portfolio to attract clients.'
    },
    {
      icon: <Search />,
      title: 'Browse Opportunities',
      description: 'Explore thousands of projects and find work that matches your expertise.'
    },
    {
      icon: <Assignment />,
      title: 'Submit Proposals',
      description: 'Send compelling proposals to clients and negotiate project terms.'
    },
    {
      icon: <Work />,
      title: 'Complete Projects',
      description: 'Deliver high-quality work and build lasting relationships with clients.'
    },
    {
      icon: <Payment />,
      title: 'Get Paid',
      description: 'Receive secure payments through our platform once work is completed.'
    }
  ];

  const forClients = [
    {
      icon: <Assignment />,
      title: 'Post Your Project',
      description: 'Describe your project requirements, budget, and timeline in detail.'
    },
    {
      icon: <Search />,
      title: 'Review Proposals',
      description: 'Receive proposals from qualified freelancers and review their profiles.'
    },
    {
      icon: <PersonAdd />,
      title: 'Hire the Best',
      description: 'Choose the freelancer that best fits your project needs and budget.'
    },
    {
      icon: <Work />,
      title: 'Collaborate',
      description: 'Work closely with your freelancer using our collaboration tools.'
    },
    {
      icon: <CheckCircle />,
      title: 'Project Completion',
      description: 'Review deliverables and release payment when satisfied with the work.'
    }
  ];

  const benefits = [
    {
      icon: <Star />,
      title: 'Quality Assurance',
      description: 'All freelancers are vetted and rated by previous clients.'
    },
    {
      icon: <Payment />,
      title: 'Secure Payments',
      description: 'Protected payments with milestone-based releases.'
    },
    {
      icon: <Search />,
      title: 'Smart Matching',
      description: 'AI-powered matching connects you with the right talent.'
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
            background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            How SkillBridge Works
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Connect with talented professionals or find your next opportunity in just a few simple steps.
          </Typography>
        </Box>
      </motion.div>

      {/* For Freelancers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            For Freelancers
          </Typography>
          <Grid container spacing={3}>
            {forFreelancers.map((step, index) => (
              <Grid item xs={12} md={2.4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', position: 'relative' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)' }}>
                      <Avatar sx={{ 
                        bgcolor: 'primary.main', 
                        width: 40, 
                        height: 40,
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}>
                        {index + 1}
                      </Avatar>
                    </Box>
                    <Avatar sx={{ 
                      bgcolor: 'primary.light', 
                      mx: 'auto', 
                      mb: 2, 
                      mt: 2,
                      width: 56,
                      height: 56
                    }}>
                      {step.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* For Clients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            For Clients
          </Typography>
          <Grid container spacing={3}>
            {forClients.map((step, index) => (
              <Grid item xs={12} md={2.4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', position: 'relative' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)' }}>
                      <Avatar sx={{ 
                        bgcolor: 'secondary.main', 
                        width: 40, 
                        height: 40,
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}>
                        {index + 1}
                      </Avatar>
                    </Box>
                    <Avatar sx={{ 
                      bgcolor: 'secondary.light', 
                      mx: 'auto', 
                      mb: 2, 
                      mt: 2,
                      width: 56,
                      height: 56
                    }}>
                      {step.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            Why Choose SkillBridge?
          </Typography>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Avatar sx={{ 
                      bgcolor: 'success.main', 
                      mx: 'auto', 
                      mb: 3,
                      width: 64,
                      height: 64
                    }}>
                      {benefit.icon}
                    </Avatar>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Join thousands of professionals and businesses on SkillBridge today.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default HowItWorksPage;


