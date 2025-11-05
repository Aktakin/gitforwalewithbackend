import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Chip, Avatar } from '@mui/material';
import { Star, TrendingUp, Work, AttachMoney } from '@mui/icons-material';
import { motion } from 'framer-motion';

const SuccessStoriesPage = () => {
  const stories = [
    {
      title: 'From Startup to Success',
      client: 'TechVenture Inc.',
      freelancer: 'Alex Chen',
      category: 'Web Development',
      budget: '$15,000',
      duration: '3 months',
      rating: 5,
      description: 'Alex helped us build our entire e-commerce platform from scratch. The project was delivered on time and exceeded all expectations.',
      result: 'Launched successfully and generated $500K in first year',
      clientAvatar: '🏢',
      freelancerAvatar: '👨‍💻'
    },
    {
      title: 'Marketing Campaign Excellence',
      client: 'GrowthCorp',
      freelancer: 'Sarah Johnson',
      category: 'Digital Marketing',
      budget: '$8,000',
      duration: '2 months',
      rating: 5,
      description: 'Sarah created and executed a comprehensive digital marketing strategy that tripled our online presence.',
      result: '300% increase in website traffic and 150% boost in conversions',
      clientAvatar: '🚀',
      freelancerAvatar: '👩‍💼'
    },
    {
      title: 'Brand Identity Transformation',
      client: 'ModernBrand Co.',
      freelancer: 'David Wilson',
      category: 'Graphic Design',
      budget: '$5,000',
      duration: '6 weeks',
      rating: 5,
      description: 'David completely transformed our brand identity with stunning visuals that perfectly captured our vision.',
      result: 'Rebranded successfully and increased brand recognition by 200%',
      clientAvatar: '🎨',
      freelancerAvatar: '👨‍🎨'
    },
    {
      title: 'Mobile App Innovation',
      client: 'InnovateLab',
      freelancer: 'Maria Rodriguez',
      category: 'Mobile Development',
      budget: '$25,000',
      duration: '4 months',
      rating: 5,
      description: 'Maria developed our iOS and Android apps with cutting-edge features and flawless user experience.',
      result: 'App reached #1 in App Store category with 100K+ downloads',
      clientAvatar: '📱',
      freelancerAvatar: '👩‍💻'
    },
    {
      title: 'Data Analytics Revolution',
      client: 'DataCorp Solutions',
      freelancer: 'James Park',
      category: 'Data Science',
      budget: '$12,000',
      duration: '10 weeks',
      rating: 5,
      description: 'James built comprehensive analytics dashboards that revolutionized how we understand our business.',
      result: 'Improved decision-making led to 40% increase in operational efficiency',
      clientAvatar: '📊',
      freelancerAvatar: '👨‍💼'
    },
    {
      title: 'Content Strategy Success',
      client: 'ContentKing Media',
      freelancer: 'Emily Davis',
      category: 'Content Writing',
      budget: '$6,000',
      duration: '8 weeks',
      rating: 5,
      description: 'Emily created a content strategy that positioned us as thought leaders in our industry.',
      result: 'Organic traffic increased by 400% and generated 50+ qualified leads',
      clientAvatar: '✍️',
      freelancerAvatar: '👩‍📝'
    }
  ];

  const stats = [
    { icon: <TrendingUp />, value: '15M+', label: 'Projects Completed' },
    { icon: <Star />, value: '4.9/5', label: 'Average Rating' },
    { icon: <Work />, value: '98%', label: 'Success Rate' },
    { icon: <AttachMoney />, value: '$2B+', label: 'Total Earnings' },
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
            Success Stories
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Real projects, real results. See how our community of professionals 
            delivers exceptional work and drives business success.
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center' }}>
                <CardContent sx={{ p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mx: 'auto', 
                    mb: 2,
                    width: 48,
                    height: 48
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

      {/* Success Stories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
          Featured Success Stories
        </Typography>
        <Grid container spacing={4}>
          {stories.map((story, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, flex: 1 }}>
                      {story.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={story.category} color="primary" size="small" />
                    <Chip label={story.budget} variant="outlined" size="small" />
                    <Chip label={story.duration} variant="outlined" size="small" />
                  </Box>

                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    {story.description}
                  </Typography>

                  <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 2, mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                      Result: {story.result}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">{story.clientAvatar}</Typography>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {story.client}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Client
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">{story.freelancerAvatar}</Typography>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {story.freelancer}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Freelancer
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card sx={{ mt: 8, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Ready to Create Your Success Story?
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Join thousands of businesses and freelancers achieving their goals on SkillBridge
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default SuccessStoriesPage;


