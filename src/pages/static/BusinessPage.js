import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Avatar } from '@mui/material';
import { Business, TrendingUp, Security, Support, Speed, Analytics } from '@mui/icons-material';
import { motion } from 'framer-motion';

const BusinessPage = () => {
  const features = [
    {
      icon: <TrendingUp />,
      title: 'Scale Your Team',
      description: 'Access thousands of vetted professionals to scale your team quickly and efficiently.'
    },
    {
      icon: <Speed />,
      title: 'Faster Delivery',
      description: 'Get projects completed faster with our network of skilled professionals.'
    },
    {
      icon: <Security />,
      title: 'Enterprise Security',
      description: 'Bank-level security with dedicated account management and compliance support.'
    },
    {
      icon: <Analytics />,
      title: 'Project Analytics',
      description: 'Track project progress, budget, and team performance with detailed analytics.'
    },
    {
      icon: <Support />,
      title: 'Dedicated Support',
      description: '24/7 dedicated support team to help you succeed with priority assistance.'
    },
    {
      icon: <Business />,
      title: 'Business Tools',
      description: 'Integrated tools for invoicing, contracts, and team management.'
    }
  ];

  const benefits = [
    {
      title: 'Reduce Hiring Costs',
      description: 'Save up to 60% on traditional hiring costs while accessing top talent.',
      stat: '60%'
    },
    {
      title: 'Faster Time to Market',
      description: 'Launch projects 3x faster with our pre-vetted talent pool.',
      stat: '3x'
    },
    {
      title: 'Quality Guarantee',
      description: '98% project satisfaction rate with money-back guarantee.',
      stat: '98%'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CTO, TechStart Inc.',
      message: 'SkillBridge helped us scale our development team from 5 to 50 in just 3 months.',
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Rodriguez',
      role: 'VP Marketing, GrowthCo',
      message: 'The quality of talent on SkillBridge is exceptional. Highly recommend for any business.',
      avatar: '👨‍💼'
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
            SkillBridge for Business
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            Scale your team with top talent. Access skilled professionals to accelerate 
            your business growth and achieve your goals faster.
          </Typography>
          <Button variant="contained" size="large" sx={{ px: 4, py: 1.5 }}>
            Get Started for Free
          </Button>
        </Box>
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                    {benefit.stat}
                  </Typography>
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
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            Enterprise Features
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
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

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            What Our Clients Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.8 }}>
                      "{testimonial.message}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h4">{testimonial.avatar}</Typography>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
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

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Ready to Scale Your Business?
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Join thousands of companies already using SkillBridge
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" color="secondary" size="large">
                Start Free Trial
              </Button>
              <Button variant="outlined" size="large" sx={{ color: 'white', borderColor: 'white' }}>
                Schedule Demo
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default BusinessPage;


