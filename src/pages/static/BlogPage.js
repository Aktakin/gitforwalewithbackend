import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Chip, Avatar } from '@mui/material';
import { CalendarToday, Person, TrendingUp } from '@mui/icons-material';
import { motion } from 'framer-motion';

const BlogPage = () => {
  const posts = [
    {
      title: 'The Future of Remote Work: Trends for 2024',
      excerpt: 'Explore the latest trends shaping the future of remote work and how freelancers can adapt.',
      author: 'Sarah Johnson',
      date: 'January 15, 2024',
      category: 'Trends',
      readTime: '5 min read',
      image: '📊'
    },
    {
      title: 'Building Your Personal Brand as a Freelancer',
      excerpt: 'Tips and strategies for creating a strong personal brand that attracts high-quality clients.',
      author: 'Michael Chen',
      date: 'January 12, 2024',
      category: 'Career',
      readTime: '7 min read',
      image: '🎯'
    },
    {
      title: 'Top Skills in Demand for 2024',
      excerpt: 'Discover which skills are most sought after by businesses and how to develop them.',
      author: 'Emily Davis',
      date: 'January 10, 2024',
      category: 'Skills',
      readTime: '6 min read',
      image: '💡'
    }
  ];

  const categories = ['All', 'Trends', 'Career', 'Skills', 'Business', 'Technology'];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
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
            SkillBridge Blog
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Insights, tips, and trends for freelancers and businesses in the modern work economy.
          </Typography>
        </Box>
      </motion.div>

      {/* Categories */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 6, flexWrap: 'wrap' }}>
        {categories.map((category, index) => (
          <Chip 
            key={index}
            label={category}
            variant={index === 0 ? "filled" : "outlined"}
            color={index === 0 ? "primary" : "default"}
            clickable
          />
        ))}
      </Box>

      {/* Featured Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Card sx={{ mb: 6 }}>
          <CardContent sx={{ p: 6 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Chip label="Featured" color="primary" sx={{ mb: 2 }} />
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {posts[0].title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                  {posts[0].excerpt}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{posts[0].author}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{posts[0].date}</Typography>
                  </Box>
                  <Typography variant="body2" color="primary.main">
                    {posts[0].readTime}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', fontSize: '6rem' }}>
                  {posts[0].image}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Recent Posts
        </Typography>
        <Grid container spacing={4}>
          {posts.slice(1).map((post, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', fontSize: '3rem', mb: 2 }}>
                    {post.image}
                  </Box>
                  <Chip label={post.category} size="small" color="primary" sx={{ mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {post.excerpt}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{post.author}</Typography>
                    </Box>
                    <Typography variant="caption" color="primary.main">
                      {post.readTime}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Newsletter Signup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card sx={{ mt: 8, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Stay Updated
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Subscribe to our newsletter for the latest insights and tips
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default BlogPage;


