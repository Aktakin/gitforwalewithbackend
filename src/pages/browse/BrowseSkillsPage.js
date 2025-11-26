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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Pagination,
  Divider,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search,
  FilterList,
  Star,
  Verified,
  Schedule,
  LocationOn,
  TrendingUp,
  Favorite,
  FavoriteBorder,
  Share,
  Visibility,
  GridView,
  ViewList,
  Sort,
  NavigateNext,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BrowseSkillsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Artisan categories
  const categories = [
    { name: 'All Categories', count: 156 },
    { name: 'Woodworking & Carpentry', count: 45 },
    { name: 'Pottery & Ceramics', count: 32 },
    { name: 'Painting & Fine Arts', count: 38 },
    { name: 'Jewelry Making', count: 29 },
    { name: 'Textile & Fiber Arts', count: 35 },
    { name: 'Metalworking & Blacksmithing', count: 18 },
    { name: 'Glassblowing & Glasswork', count: 12 },
    { name: 'Leatherworking', count: 24 },
    { name: 'Stone Carving & Sculpture', count: 16 },
    { name: 'Bookbinding & Paper Arts', count: 15 },
    { name: 'Tailoring & Sewing', count: 28 },
    { name: 'Basketry & Wickerwork', count: 10 },
    { name: 'Weaving & Textiles', count: 22 },
    { name: 'Calligraphy & Hand Lettering', count: 14 },
    { name: 'Mosaics & Tile Work', count: 11 },
    { name: 'Printmaking', count: 9 },
    { name: 'Paper Crafts', count: 13 },
    { name: 'Quilting', count: 19 },
    { name: 'Embroidery & Needlework', count: 21 },
    { name: 'Knitting & Crochet', count: 25 },
    { name: 'Lace Making', count: 8 },
    { name: 'Rug Making', count: 7 },
    { name: 'Toy Making', count: 12 },
    { name: 'Musical Instrument Making', count: 6 },
    { name: 'Furniture Making', count: 20 },
    { name: 'Restoration & Conservation', count: 17 }
  ];

  const skillAds = [
    {
      id: 1,
      title: "I will create custom handcrafted wooden furniture for your home",
      description: "Master carpenter with 15+ years experience crafting heirloom-quality furniture. Specializing in custom dining tables, cabinets, and built-ins using sustainable hardwoods.",
      provider: {
        name: "Robert Martinez",
        avatar: "https://i.pravatar.cc/50?img=1",
        rating: 4.9,
        reviews: 127,
        level: "Master Craftsman",
        isVerified: true,
        responseTime: "2 hours",
        location: "Portland, OR"
      },
      category: "Woodworking & Carpentry",
      tags: ["Custom Furniture", "Hardwood", "Joinery", "Sustainable Wood"],
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop",
      packages: {
        basic: { price: 450, delivery: "14 days" },
        standard: { price: 850, delivery: "21 days" },
        premium: { price: 1500, delivery: "30 days" }
      },
      orders: 89,
      featured: true,
      gallery: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop"]
    },
    {
      id: 2,
      title: "I will create beautiful hand-thrown pottery and ceramic pieces",
      description: "Professional potter creating functional and decorative ceramics. From dinnerware sets to unique sculptural pieces, each item is wheel-thrown and hand-glazed.",
      provider: {
        name: "Maria Gonzalez",
        avatar: "https://i.pravatar.cc/50?img=2",
        rating: 5.0,
        reviews: 234,
        level: "Master Craftsman",
        isVerified: true,
        responseTime: "1 hour",
        location: "Santa Fe, NM"
      },
      category: "Pottery & Ceramics",
      tags: ["Wheel Throwing", "Glazing", "Dinnerware", "Sculptural Ceramics"],
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop",
      packages: {
        basic: { price: 65, delivery: "7 days" },
        standard: { price: 125, delivery: "10 days" },
        premium: { price: 250, delivery: "14 days" }
      },
      orders: 156,
      featured: false,
      gallery: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop", "https://images.unsplash.com/photo-1493119508027-2b584f234d6c?w=400&h=250&fit=crop"]
    },
    {
      id: 3,
      title: "I will create stunning custom oil paintings and portraits",
      description: "Professional artist specializing in realistic oil paintings, portraits, and landscape art. 20+ years of experience bringing your vision to life on canvas.",
      provider: {
        name: "Catherine Brooks",
        avatar: "https://i.pravatar.cc/50?img=3",
        rating: 4.8,
        reviews: 98,
        level: "Expert Artist",
        isVerified: true,
        responseTime: "3 hours",
        location: "Charleston, SC"
      },
      category: "Painting & Fine Arts",
      tags: ["Oil Painting", "Portraits", "Landscapes", "Custom Art"],
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=250&fit=crop",
      packages: {
        basic: { price: 200, delivery: "14 days" },
        standard: { price: 450, delivery: "21 days" },
        premium: { price: 800, delivery: "30 days" }
      },
      orders: 67,
      featured: true,
      gallery: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=250&fit=crop"]
    },
    {
      id: 4,
      title: "I will craft unique handmade jewelry with precious metals and stones",
      description: "Master jeweler creating one-of-a-kind pieces using traditional metalsmithing techniques. Specializing in engagement rings, custom pendants, and artisan jewelry.",
      provider: {
        name: "James Sullivan",
        avatar: "https://i.pravatar.cc/50?img=4",
        rating: 4.7,
        reviews: 145,
        level: "Expert Craftsman",
        isVerified: true,
        responseTime: "4 hours",
        location: "Sedona, AZ"
      },
      category: "Jewelry Making",
      tags: ["Metalsmithing", "Custom Rings", "Precious Stones", "Handcrafted"],
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=250&fit=crop",
      packages: {
        basic: { price: 180, delivery: "10 days" },
        standard: { price: 350, delivery: "14 days" },
        premium: { price: 750, delivery: "21 days" }
      },
      orders: 92,
      featured: false,
      gallery: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=250&fit=crop", "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=250&fit=crop"]
    },
    {
      id: 5,
      title: "I will weave custom textiles and create beautiful fiber art pieces",
      description: "Traditional weaver specializing in custom textiles, wall hangings, and fiber art. Using natural fibers and traditional techniques passed down through generations.",
      provider: {
        name: "Isabella Chen",
        avatar: "https://i.pravatar.cc/50?img=5",
        rating: 4.9,
        reviews: 78,
        level: "Master Weaver",
        isVerified: true,
        responseTime: "2 hours",
        location: "Asheville, NC"
      },
      category: "Textile & Fiber Arts",
      tags: ["Hand Weaving", "Natural Fibers", "Wall Hangings", "Traditional Techniques"],
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=250&fit=crop",
      packages: {
        basic: { price: 120, delivery: "14 days" },
        standard: { price: 280, delivery: "21 days" },
        premium: { price: 500, delivery: "28 days" }
      },
      orders: 43,
      featured: false,
      gallery: ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=250&fit=crop"]
    },
    {
      id: 6,
      title: "I will forge custom ironwork and decorative metalwork pieces",
      description: "Traditional blacksmith creating custom ironwork, garden gates, decorative hardware, and sculptural pieces. Using time-honored forging techniques and modern design.",
      provider: {
        name: "Thomas Anderson",
        avatar: "https://i.pravatar.cc/50?img=6",
        rating: 4.8,
        reviews: 56,
        level: "Master Blacksmith",
        isVerified: true,
        responseTime: "4 hours",
        location: "Bozeman, MT"
      },
      category: "Metalworking & Blacksmithing",
      tags: ["Blacksmithing", "Custom Ironwork", "Garden Gates", "Decorative Hardware"],
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=250&fit=crop",
      packages: {
        basic: { price: 300, delivery: "21 days" },
        standard: { price: 650, delivery: "28 days" },
        premium: { price: 1200, delivery: "35 days" }
      },
      orders: 34,
      featured: true,
      gallery: ["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=250&fit=crop", "https://images.unsplash.com/photo-1609205807107-e6ec8e5b1d3b?w=400&h=250&fit=crop"]
    }
  ];

  const filteredSkills = skillAds.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || 
                           skill.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleFavorite = (skillId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(skillId)) {
      newFavorites.delete(skillId);
    } else {
      newFavorites.add(skillId);
    }
    setFavorites(newFavorites);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Top Rated': return 'error';
      case 'Level 2': return 'warning';
      case 'Level 1': return 'info';
      default: return 'default';
    }
  };

  // Map categories to profession names for "I am a..." format
  const getCategoryProfession = (category) => {
    const categoryMap = {
      'Woodworking & Carpentry': 'Carpenter',
      'Pottery & Ceramics': 'Potter',
      'Jewelry Making': 'Jeweler',
      'Textile & Fiber Arts': 'Textile Artist',
      'Metalworking & Blacksmithing': 'Blacksmith',
      'Painting & Fine Arts': 'Painter',
      'Leatherworking': 'Leather Artisan',
      'Glassblowing & Glasswork': 'Glass Artist',
      'Stone Carving & Sculpture': 'Sculptor',
      'Bookbinding & Paper Arts': 'Bookbinder',
      'Tailoring & Sewing': 'Tailor',
      'Photography': 'Photographer',
      'Music & Audio': 'Musician',
      'Web Development': 'Developer',
      'Graphic Design': 'Designer',
      'Writing & Translation': 'Writer',
      'Digital Marketing': 'Marketer',
      'Mobile Development': 'Developer'
    };
    return categoryMap[category] || 'Artisan';
  };

  const SkillCard = ({ skill }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
          }
        }}
        onClick={() => navigate(`/skills/${skill.id}`)}
      >
        {skill.featured && (
          <Chip
            label="FEATURED"
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              bgcolor: '#ff4081',
              color: 'white',
              fontWeight: 700,
              zIndex: 2,
              fontSize: '0.7rem'
            }}
          />
        )}
        
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={skill.image}
            alt={skill.title}
            sx={{ objectFit: 'cover' }}
          />
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite(skill.id);
              }}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
              }}
            >
              {favorites.has(skill.id) ? 
                <Favorite color="error" /> : 
                <FavoriteBorder />
              }
            </IconButton>
          </Box>
          
          {skill.gallery && skill.gallery.length > 1 && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: 8, 
              right: 8, 
              display: 'flex', 
              gap: 0.5 
            }}>
              {skill.gallery.slice(0, 3).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: index === 0 ? 'white' : 'rgba(255,255,255,0.5)'
                  }}
                />
              ))}
            </Box>
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
              lineHeight: 1.2
            }}
          >
            I am a {getCategoryProfession(skill.category)}
          </Typography>
          
          {/* Original Title as Subheading */}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 500, 
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.3,
              fontSize: '1rem'
            }}
          >
            {skill.title}
          </Typography>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5
            }}
          >
            {skill.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar src={skill.provider.avatar} sx={{ width: 32, height: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {skill.provider.name}
                </Typography>
                {skill.provider.isVerified && (
                  <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={skill.provider.rating} precision={0.1} size="small" readOnly />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {skill.provider.rating}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({skill.provider.reviews})
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={skill.provider.level} 
              size="small" 
              color={getLevelColor(skill.provider.level)}
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {skill.tags.slice(0, 3).map((tag) => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            ))}
            {skill.tags.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{skill.tags.length - 3} more
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
            <Schedule sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              {skill.provider.responseTime}
            </Typography>
            <LocationOn sx={{ fontSize: 14, ml: 1 }} />
            <Typography variant="caption">
              {skill.provider.location}
            </Typography>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="caption" color="text.secondary">
                {skill.orders} orders
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Click to view details
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link color="inherit" href="/" sx={{ textDecoration: 'none' }}>
          Home
        </Link>
        <Typography color="text.primary">Top Rated</Typography>
      </Breadcrumbs>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
            >
              Discover Master Artisans
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Find the perfect craftsperson for your next project
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {filteredSkills.length} artisans available • Trusted by 10,000+ clients worldwide
            </Typography>
        </Box>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="What craft or artisan are you looking for?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.name} value={category.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{category.name}</span>
                        <Chip label={category.count} size="small" />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  value={sortBy}
                  label="Experience Level"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                  <MenuItem value="master">Master</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ height: 56, borderRadius: 2 }}
              >
                Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Results Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {filteredSkills.length} Artisans Found
          </Typography>
          {selectedCategory && selectedCategory !== 'All Categories' && (
            <Typography variant="body2" color="text.secondary">
              in {selectedCategory}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="price_low">Price: Low to High</MenuItem>
              <MenuItem value="price_high">Price: High to Low</MenuItem>
              <MenuItem value="rating">Best Rating</MenuItem>
              <MenuItem value="reviews">Most Reviews</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grid">
              <GridView />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Skills Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {filteredSkills.map((skill) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={skill.id}>
              <SkillCard skill={skill} />
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <Pagination 
          count={Math.ceil(filteredSkills.length / 12)} 
          page={currentPage} 
          onChange={(e, page) => setCurrentPage(page)}
          color="primary"
          size="large"
          showFirstButton
          showLastButton
        />
      </Box>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Paper 
          sx={{ 
            p: 6, 
            mt: 8, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Start Your Project?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of satisfied clients who found their perfect match
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                px: 4
              }}
            >
              Post a Project
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' },
                px: 4
              }}
            >
              Learn More
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default BrowseSkillsPage;
