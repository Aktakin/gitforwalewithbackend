import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
  CardMedia,
  IconButton,
} from '@mui/material';
import {
  Search,
  WorkOutline,
  PeopleOutline,
  StarOutline,
  TrendingUp,
  Security,
  SupportAgent,
  ArrowForward,
  Verified,
  Schedule,
  LocationOn,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/SupabaseAuthContext';
import SignInModal from '../components/common/SignInModal';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  const features = [
    {
      icon: Search,
      title: 'Find Artisans',
      description: 'Browse thousands of skilled artisans ready to bring your vision to life',
    },
    {
      icon: WorkOutline,
      title: 'Post Projects',
      description: 'Share your craft needs and receive proposals from talented artisans',
    },
    {
      icon: Security,
      title: 'Secure Platform',
      description: 'Protected payments and verified artisan profiles ensure quality work',
    },
    {
      icon: SupportAgent,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our dedicated support team',
    },
  ];

  const categories = [
    { name: 'Woodworking & Carpentry', count: '1,234 artisans', color: '#8d6e63' },
    { name: 'Pottery & Ceramics', count: '856 artisans', color: '#d32f2f' },
    { name: 'Painting & Fine Arts', count: '623 artisans', color: '#ff5722' },
    { name: 'Jewelry Making', count: '445 artisans', color: '#ffc107' },
    { name: 'Textile & Fiber Arts', count: '512 artisans', color: '#9c27b0' },
    { name: 'Metalworking & Blacksmithing', count: '289 artisans', color: '#607d8b' },
    { name: 'Glassblowing & Glasswork', count: '156 artisans', color: '#00bcd4' },
    { name: 'Leatherworking', count: '234 artisans', color: '#795548' },
    { name: 'Stone Carving & Sculpture', count: '178 artisans', color: '#9e9e9e' },
    { name: 'Bookbinding & Paper Arts', count: '89 artisans', color: '#f44336' },
    { name: 'Tailoring & Sewing', count: '567 artisans', color: '#e91e63' },
    { name: 'Furniture Making', count: '345 artisans', color: '#8d6e63' },
  ];

  // Featured artisans data
  const featuredArtisans = [
    {
      id: 1,
      name: 'Maria Santos',
      craft: 'Hand-Woven Textiles',
      specialty: 'Traditional Peruvian Patterns',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 4.9,
      reviews: 127,
      location: 'Santa Fe, NM',
      responseTime: '2 hours',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      startingPrice: 85,
      description: 'Master weaver specializing in traditional Andean textiles with over 20 years of experience.',
      tags: ['Traditional Weaving', 'Natural Dyes', 'Alpaca Wool', 'Custom Designs'],
      completedOrders: 89,
    },
    {
      id: 2,
      name: 'David Chen',
      craft: 'Custom Woodworking',
      specialty: 'Furniture & Cabinetry',
      avatar: 'https://i.pravatar.cc/150?img=2',
      rating: 5.0,
      reviews: 203,
      location: 'Portland, OR',
      responseTime: '1 hour',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      startingPrice: 120,
      description: 'Fine woodworker crafting heirloom-quality furniture using sustainable materials.',
      tags: ['Custom Furniture', 'Sustainable Wood', 'Japanese Joinery', 'Restoration'],
      completedOrders: 156,
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      craft: 'Ceramic Arts',
      specialty: 'Functional Pottery',
      avatar: 'https://i.pravatar.cc/150?img=3',
      rating: 4.8,
      reviews: 98,
      location: 'Taos, NM',
      responseTime: '3 hours',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      startingPrice: 45,
      description: 'Potter creating beautiful, functional ceramics inspired by Southwestern traditions.',
      tags: ['Wheel Throwing', 'Glazing', 'Dinnerware', 'Custom Pieces'],
      completedOrders: 67,
    },
    {
      id: 4,
      name: 'James Mitchell',
      craft: 'Metalworking',
      specialty: 'Blacksmithing & Sculpture',
      avatar: 'https://i.pravatar.cc/150?img=4',
      rating: 4.9,
      reviews: 145,
      location: 'Asheville, NC',
      responseTime: '4 hours',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop',
      startingPrice: 95,
      description: 'Traditional blacksmith creating custom ironwork, tools, and artistic sculptures.',
      tags: ['Forging', 'Custom Hardware', 'Garden Art', 'Tool Making'],
      completedOrders: 92,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Interior Designer',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'SkillBridge connected me with incredible artisans who brought my design vision to life!',
    },
    {
      name: 'Mike Chen',
      role: 'Restaurant Owner',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'The quality of craftsmanship and attention to detail from these artisans is outstanding.',
    },
    {
      name: 'Emily Davis',
      role: 'Boutique Owner',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Found amazing artisans for my store. Professional, secure, and easy to use!',
    },
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '25K+', label: 'Artisans Listed' },
    { number: '100K+', label: 'Projects Completed' },
    { number: '4.9/5', label: 'Average Rating' },
  ];

  // Handle artisan card click
  const handleArtisanClick = (artisan) => {
    if (user) {
      // If user is logged in, navigate to artisan profile
      navigate(`/profile/${artisan.id}`);
    } else {
      // If not logged in, show sign-in modal
      setSignInModalOpen(true);
    }
  };

  // Map crafts to profession names for "I am a..." format
  const getCraftProfession = (craft) => {
    const craftMap = {
      'Hand-Woven Textiles': 'Textile Artist',
      'Custom Woodworking': 'Carpenter',
      'Ceramic Arts': 'Potter',
      'Metalworking': 'Blacksmith',
      'Fine Art Painting': 'Painter',
      'Jewelry Making': 'Jeweler',
      'Leather Crafting': 'Leather Artisan',
      'Glass Artistry': 'Glass Artist',
      'Stone Carving': 'Sculptor',
      'Photography': 'Photographer'
    };
    
    // Try exact match first, then try to find partial matches
    if (craftMap[craft]) {
      return craftMap[craft];
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(craftMap)) {
      if (craft.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(craft.toLowerCase())) {
        return value;
      }
    }
    
    return 'Artisan';
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #000080 0%, #3333FF 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 20% 80%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%)`,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Discover Master
                  <Box component="span" sx={{ display: 'block', color: '#ffeb3b' }}>
                    Artisans
                  </Box>
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Connect with skilled artisans from every craft tradition. 
                  From woodworking to ceramics, find the perfect craftsperson for your vision.
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 1.5, sm: 2 }, 
                  flexWrap: 'wrap',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Button
                    variant="contained"
                    size={isMobile ? "medium" : "large"}
                    component={Link}
                    to="/browse"
                    fullWidth={isMobile}
                    sx={{
                      backgroundColor: 'white',
                      color: 'primary.main',
                      fontWeight: 600,
                      px: { xs: 3, sm: 4 },
                      py: { xs: 1.25, sm: 1.5 },
                      minHeight: { xs: 44, sm: 48 },
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.9),
                      },
                    }}
                    endIcon={<ArrowForward />}
                  >
                    Browse Artisans
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size={isMobile ? "medium" : "large"}
                    component={Link}
                    to="/register"
                    fullWidth={isMobile}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 600,
                      px: { xs: 3, sm: 4 },
                      py: { xs: 1.25, sm: 1.5 },
                      minHeight: { xs: 44, sm: 48 },
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: alpha('#ffffff', 0.1),
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 400,
                  }}
                >
                  {/* Beautiful Artisan Hero Image */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: `2px solid ${alpha('#ffffff', 0.2)}`,
                      position: 'relative',
                    }}
                  >
                    <Box
                      component="img"
                      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&crop=center"
                      alt="Professional plumber working with pipes and plumbing tools"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.9) contrast(1.1)',
                      }}
                    />
                    {/* Subtle overlay for better text readability */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(0, 0, 128, 0.1) 0%, rgba(51, 51, 255, 0.05) 100%)',
                      }}
                    />
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 1,
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Artisans Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Featured Master Artisans
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                mb: 6,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Meet some of our most talented craftspeople, ready to bring your vision to life
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {featuredArtisans.map((artisan, index) => (
              <Grid item xs={12} sm={6} md={3} key={artisan.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      borderRadius: 3,
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      },
                    }}
                    onClick={() => handleArtisanClick(artisan)}
                  >
                    {/* Artisan Work Image */}
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={artisan.image}
                        alt={artisan.craft}
                        sx={{ objectFit: 'cover' }}
                      />
                      {artisan.isVerified && (
                        <Chip
                          icon={<Verified />}
                          label="VERIFIED"
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            bgcolor: 'success.main',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                      {/* New "I am a..." Main Heading */}
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 1,
                          color: 'primary.main',
                          lineHeight: 1.2,
                          fontSize: '1.1rem'
                        }}
                      >
                        I am a {getCraftProfession(artisan.craft)}
                      </Typography>

                      {/* Artisan Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar src={artisan.avatar} sx={{ width: 40, height: 40 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.95rem' }}>
                            {artisan.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                            {artisan.craft}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Specialty */}
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          mb: 1.5, 
                          fontWeight: 600,
                          color: 'text.secondary',
                          fontSize: '0.85rem'
                        }}
                      >
                        {artisan.specialty}
                      </Typography>

                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4
                        }}
                      >
                        {artisan.description}
                      </Typography>

                      {/* Rating */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Rating value={artisan.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {artisan.rating}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({artisan.reviews} reviews)
                        </Typography>
                      </Box>

                      {/* Tags */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {artisan.tags.slice(0, 2).map((tag) => (
                          <Chip 
                            key={tag} 
                            label={tag} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                        {artisan.tags.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{artisan.tags.length - 2} more
                          </Typography>
                        )}
                      </Box>

                      {/* Location & Response Time */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
                        <LocationOn sx={{ fontSize: 14 }} />
                        <Typography variant="caption">
                          {artisan.location}
                        </Typography>
                        <Schedule sx={{ fontSize: 14, ml: 1 }} />
                        <Typography variant="caption">
                          {artisan.responseTime}
                        </Typography>
                      </Box>

                      {/* Price & Orders */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Starting at
                          </Typography>
                          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                            ${artisan.startingPrice}/hr
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary">
                            {artisan.completedOrders} orders
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* View All Button */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/browse"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              View All Artisans
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Why Choose SkillBridge?
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                mb: 6,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              We provide everything you need to connect with master artisans and bring your vision to life
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        mb: 3,
                      }}
                    >
                      <feature.icon
                        sx={{
                          fontSize: 32,
                          color: 'primary.main',
                        }}
                      />
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Popular Crafts
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                mb: 6,
              }}
            >
              Explore traditional and contemporary crafts from master artisans
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    component={Link}
                    to={`/skills?category=${category.name}`}
                    sx={{
                      p: 3,
                      textDecoration: 'none',
                      borderRadius: 3,
                      border: `2px solid ${category.color}20`,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: category.color,
                        boxShadow: `0 8px 25px ${category.color}25`,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: `${category.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TrendingUp sx={{ color: category.color }} />
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: 'text.primary' }}
                        >
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.count}
                        </Typography>
                      </Box>
                      
                      <ArrowForward sx={{ color: category.color }} />
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                mb: 2,
              }}
            >
              What Our Users Say
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                mb: 6,
              }}
            >
              Join thousands of satisfied users
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <Rating value={testimonial.rating} readOnly size="small" />
                    </Box>
                    
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                      }}
                    >
                      "{testimonial.comment}"
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        sx={{ width: 48, height: 48 }}
                      />
                      
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #000080 0%, #3333FF 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Ready to Get Started?
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                }}
              >
                Join SkillBridge today and start connecting with master artisans
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/register"
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.9),
                    },
                  }}
                >
                  Sign Up Free
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/browse"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: alpha('#ffffff', 0.1),
                    },
                  }}
                >
                  Browse Artisans
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Sign In Modal */}
      <SignInModal 
        open={signInModalOpen} 
        onClose={() => setSignInModalOpen(false)} 
        redirectTo="/browse"
      />
    </Box>
  );
};

export default HomePage;
