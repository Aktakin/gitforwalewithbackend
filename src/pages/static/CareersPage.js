import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Chip, Avatar } from '@mui/material';
import { Work, LocationOn, Schedule, TrendingUp, People, Lightbulb } from '@mui/icons-material';
import { motion } from 'framer-motion';

const CareersPage = () => {
  const openPositions = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Build beautiful, responsive user interfaces for our platform.'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create intuitive and delightful user experiences.'
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Scale our infrastructure to support millions of users.'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      description: 'Drive growth and build our brand awareness.'
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp />,
      title: 'Competitive Salary',
      description: 'Industry-leading compensation packages with equity options.'
    },
    {
      icon: <People />,
      title: 'Amazing Team',
      description: 'Work with talented, passionate people who care about their craft.'
    },
    {
      icon: <Lightbulb />,
      title: 'Innovation',
      description: 'Freedom to experiment and bring your creative ideas to life.'
    }
  ];

  const values = [
    {
      title: 'Transparency',
      description: 'We believe in open communication and honest feedback.'
    },
    {
      title: 'Excellence',
      description: 'We strive for quality in everything we do.'
    },
    {
      title: 'Growth',
      description: 'We invest in our team\'s personal and professional development.'
    },
    {
      title: 'Impact',
      description: 'We work on meaningful problems that matter to millions.'
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
            Join Our Team
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Help us build the future of work. We're looking for talented, passionate people 
            to join our mission of connecting skills with opportunities.
          </Typography>
        </Box>
      </motion.div>

      {/* Values Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            Our Values
          </Typography>
          <Grid container spacing={3}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            Why Work With Us?
          </Typography>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
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

      {/* Open Positions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            Open Positions
          </Typography>
          <Grid container spacing={3}>
            {openPositions.map((position, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                          {position.title}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          <Chip 
                            label={position.department} 
                            color="primary" 
                            size="small"
                          />
                          <Chip 
                            label={position.type} 
                            variant="outlined" 
                            size="small"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                          <LocationOn sx={{ fontSize: 18, mr: 0.5 }} />
                          <Typography variant="body2">
                            {position.location}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          {position.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Button variant="contained" fullWidth>
                      Apply Now
                    </Button>
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
              Don't See the Right Role?
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              We're always looking for talented people. Send us your resume!
            </Typography>
            <Button variant="contained" color="secondary" size="large">
              Send Resume
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default CareersPage;


