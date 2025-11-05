import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Avatar, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Business, Security, Support, Analytics, Speed, CheckCircle, Group, Cloud } from '@mui/icons-material';
import { motion } from 'framer-motion';

const EnterprisePage = () => {
  const features = [
    {
      icon: <Security />,
      title: 'Enterprise Security',
      description: 'Advanced security features including SSO, audit logs, and compliance certifications.'
    },
    {
      icon: <Analytics />,
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting and analytics to track team performance and project ROI.'
    },
    {
      icon: <Support />,
      title: 'Dedicated Support',
      description: '24/7 priority support with dedicated account managers and technical assistance.'
    },
    {
      icon: <Group />,
      title: 'Team Management',
      description: 'Advanced user management, role-based permissions, and team collaboration tools.'
    },
    {
      icon: <Cloud />,
      title: 'API Integration',
      description: 'Seamless integration with your existing tools and workflows via our REST API.'
    },
    {
      icon: <Speed />,
      title: 'Priority Matching',
      description: 'Get matched with top talent faster with our enterprise priority matching system.'
    }
  ];

  const benefits = [
    'Dedicated account manager',
    'Custom contract templates',
    'Advanced project tracking',
    'Bulk user management',
    'Custom branding options',
    'Integration with HR systems',
    'Compliance reporting',
    'Volume discounts'
  ];

  const plans = [
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with complex needs',
      features: [
        'Unlimited team members',
        'Advanced security features',
        'Dedicated account manager',
        'Custom integrations',
        'Priority support',
        'Custom contracts'
      ]
    },
    {
      name: 'Enterprise Plus',
      price: 'Custom',
      description: 'For global enterprises with multi-region needs',
      features: [
        'Everything in Enterprise',
        'Multi-region deployment',
        'Advanced compliance tools',
        'Custom reporting',
        'White-label options',
        'Professional services'
      ]
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
            SkillBridge Enterprise
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            Powerful solutions for large organizations. Scale your team with enterprise-grade 
            security, advanced analytics, and dedicated support.
          </Typography>
          <Button variant="contained" size="large" sx={{ px: 4, py: 1.5 }}>
            Schedule Demo
          </Button>
        </Box>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
          Enterprise Features
        </Typography>
        <Grid container spacing={3} sx={{ mb: 8 }}>
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
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Card sx={{ mb: 8 }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
              What's Included
            </Typography>
            <Grid container spacing={2}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle sx={{ color: 'success.main', mr: 2 }} />
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pricing Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
          Enterprise Plans
        </Typography>
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {plans.map((plan, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', border: index === 1 ? 2 : 0, borderColor: 'primary.main' }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                    {plan.price}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    {plan.description}
                  </Typography>
                  <List sx={{ mb: 4 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Button 
                    variant={index === 1 ? "contained" : "outlined"} 
                    fullWidth 
                    size="large"
                  >
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Case Studies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Card sx={{ bgcolor: 'grey.50', mb: 6 }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
              Trusted by Leading Companies
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
              "SkillBridge Enterprise has transformed how we scale our development teams. 
              The platform's security and analytics features give us complete confidence."
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              — Sarah Johnson, CTO at TechCorp Global
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Ready to Transform Your Business?
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Schedule a personalized demo to see how SkillBridge Enterprise can work for you
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" color="secondary" size="large">
                Schedule Demo
              </Button>
              <Button variant="outlined" size="large" sx={{ color: 'white', borderColor: 'white' }}>
                Contact Sales
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default EnterprisePage;


