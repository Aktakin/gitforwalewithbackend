import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  Rating,
  Divider,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Star,
  Verified,
  Schedule,
  CheckCircle,
  Message,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  TrendingUp,
  Security,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SkillDetailPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [portfolioDialogOpen, setPortfolioDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock skill data
  const skillData = {
    id: 1,
    title: "I will create custom handcrafted wooden furniture for your home",
    description: "Transform your space with beautiful, handcrafted wooden furniture that will last for generations. I specialize in creating custom pieces using traditional joinery techniques and sustainable hardwoods, ensuring each piece is both functional and a work of art.",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop"],
    provider: {
      name: "Robert Martinez",
      avatar: "https://i.pravatar.cc/100?img=10",
      title: "Master Carpenter & Furniture Maker",
      rating: 4.9,
      reviews: 127,
      level: "Master Craftsman",
      isVerified: true,
      responseTime: "2 hours",
      location: "Portland, OR",
      bio: "Passionate carpenter with 15+ years of experience creating heirloom-quality furniture using traditional techniques and sustainable materials."
    },
    tags: ["Custom Furniture", "Hardwood", "Joinery", "Sustainable", "Handcrafted"],
    services: [
      "Custom furniture design consultation",
      "Traditional joinery techniques",
      "Sustainable hardwood materials",
      "Hand-sanded smooth finish",
      "Delivery and setup included",
      "1-year craftsmanship warranty",
      "Care and maintenance guide",
      "Progress photos during creation"
    ],
    portfolio: [
      {
        id: 1,
        title: "Farmhouse Dining Table",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop",
        description: "8-person dining table made from reclaimed oak with traditional mortise and tenon joinery.",
        year: "2024"
      },
      {
        id: 2,
        title: "Custom Kitchen Island",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop",
        description: "Large kitchen island with built-in storage and butcher block top.",
        year: "2023"
      },
      {
        id: 3,
        title: "Live Edge Coffee Table",
        image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=400&fit=crop",
        description: "Unique coffee table featuring natural live edge walnut slab.",
        year: "2023"
      },
      {
        id: 4,
        title: "Built-in Bookshelf",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=400&fit=crop",
        description: "Floor-to-ceiling built-in bookshelf with adjustable shelving.",
        year: "2024"
      },
      {
        id: 5,
        title: "Handcrafted Bed Frame",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop",
        description: "King-size bed frame with headboard, made from sustainable cherry wood.",
        year: "2023"
      },
      {
        id: 6,
        title: "Custom Dining Chairs",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop",
        description: "Set of 6 matching dining chairs with upholstered seats.",
        year: "2024"
      }
    ]
  };


  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Skill Details */}
        <Grid item xs={12} md={8}>
          {/* Main Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="400"
                image={skillData.images[0]}
                alt={skillData.title}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </motion.div>

          {/* Title and Provider Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {skillData.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar 
                  src={skillData.provider.avatar} 
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {skillData.provider.name}
                    </Typography>
                    {skillData.provider.isVerified && (
                      <Verified sx={{ fontSize: 18, color: 'primary.main' }} />
                    )}
                    <Chip 
                      label={skillData.provider.level} 
                      size="small" 
                      color="error"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {skillData.provider.title}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={skillData.provider.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {skillData.provider.rating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({skillData.provider.reviews} reviews)
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Responds in {skillData.provider.responseTime}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skillData.tags.map((tag) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size="small" 
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                About This Service
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                {skillData.description}
              </Typography>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Services Offered:
              </Typography>
              <List>
                {skillData.services.map((service, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={service} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                All projects are custom-tailored to your specific needs and requirements.
              </Typography>
            </Paper>
          </motion.div>
        </Grid>

        {/* Right Column - Booking */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Artisan Contact */}
            <Card sx={{ mb: 3, position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Work with this Artisan
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    startIcon={<Message />}
                    onClick={() => setBookingDialogOpen(true)}
                  >
                    Contact Artisan
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                  </Button>
                </Box>

                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<Star />}
                  onClick={() => setPortfolioDialogOpen(true)}
                >
                  View Portfolio
                </Button>
              </CardContent>
            </Card>

            {/* Artisan Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Why choose {skillData.provider.name}?
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingUp sx={{ color: 'success.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Master Craftsman
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Consistently delivers exceptional handcrafted work
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Schedule sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Reliable Communication
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Responds within {skillData.provider.responseTime}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Security sx={{ color: 'info.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Verified Artisan
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Skills and craftsmanship verified
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Contact Dialog */}
      <Dialog 
        open={bookingDialogOpen} 
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Contact {skillData.provider.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Send a message to discuss your project requirements and get a custom quote.
          </Alert>
          
          <TextField
            fullWidth
            label="Project Description"
            multiline
            rows={4}
            placeholder="Describe your project in detail - what you need, timeline, budget range, etc..."
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Budget Range (Optional)"
            placeholder="e.g., $500 - $1000"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Additional Notes"
            multiline
            rows={2}
            placeholder="Any special requirements, materials, or preferences..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setBookingDialogOpen(false);
              alert('✉️ Message sent successfully! The artisan will respond soon.');
            }}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Portfolio Dialog */}
      <Dialog 
        open={portfolioDialogOpen} 
        onClose={() => setPortfolioDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={skillData.provider.avatar} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {skillData.provider.name}'s Portfolio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {skillData.provider.title}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {skillData.portfolio.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: item.id * 0.1 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.image}
                      alt={item.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          {item.title}
                        </Typography>
                        <Chip 
                          label={item.year} 
                          size="small" 
                          color="primary"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              About {skillData.provider.name}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2 }}>
              {skillData.provider.bio}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={skillData.provider.rating} precision={0.1} size="small" readOnly />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {skillData.provider.rating} ({skillData.provider.reviews} reviews)
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                📍 {skillData.provider.location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ⚡ Responds in {skillData.provider.responseTime}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPortfolioDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Message />}
            onClick={() => {
              setPortfolioDialogOpen(false);
              setBookingDialogOpen(true);
            }}
          >
            Contact Artisan
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SkillDetailPage;