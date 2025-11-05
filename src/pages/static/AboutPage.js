import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Avatar } from '@mui/material';
import { Work, People, TrendingUp, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const stats = [
    { icon: <People />, value: '50K+', label: 'Active Users' },
    { icon: <Work />, value: '15K+', label: 'Projects Completed' },
    { icon: <TrendingUp />, value: '98%', label: 'Success Rate' },
    { icon: <Star />, value: '4.9', label: 'Average Rating' },
  ];

  const team = [
    { name: 'Sarah Johnson', role: 'CEO & Founder', image: '👩‍💼' },
    { name: 'Michael Chen', role: 'CTO', image: '👨‍💻' },
    { name: 'Emily Davis', role: 'Head of Design', image: '👩‍🎨' },
    { name: 'David Wilson', role: 'Head of Operations', image: '👨‍💼' },
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
            background: 'linear-gradient(135deg, #000080 0%, #3333FF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            About SkillBridge
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
            Connecting talented professionals with opportunities worldwide. 
            We're building the future of work, one skill at a time.
          </Typography>
        </Box>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Card sx={{ mb: 6, textAlign: 'center' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Our Mission
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 700, mx: 'auto' }}>
              To democratize access to professional skills and create meaningful connections 
              between talented individuals and businesses worldwide. We believe everyone 
              deserves the opportunity to showcase their expertise and find fulfilling work.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mx: 'auto', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Story Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card sx={{ mb: 6 }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Our Story
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
              Founded in 2022, SkillBridge emerged from a simple observation: the world is full of 
              talented individuals seeking meaningful work, while businesses struggle to find the 
              right expertise for their projects.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
              What started as a small platform has grown into a thriving community of professionals 
              across hundreds of skill categories. From web development to graphic design, from 
              consulting to creative writing, SkillBridge has become the go-to platform for 
              quality professional services.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              Today, we're proud to support thousands of professionals in building their careers 
              while helping businesses achieve their goals through access to top-tier talent.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
          Meet Our Team
        </Typography>
        <Grid container spacing={3}>
          {team.map((member, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    {member.image}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.role}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default AboutPage;


