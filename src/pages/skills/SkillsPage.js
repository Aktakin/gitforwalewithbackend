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
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SkillsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());

  // Artisan categories
  const categories = [
    'All Categories',
    'Woodworking & Carpentry',
    'Pottery & Ceramics', 
    'Painting & Fine Arts',
    'Jewelry Making',
    'Textile & Fiber Arts',
    'Metalworking & Blacksmithing',
    'Glassblowing & Glasswork',
    'Leatherworking',
    'Stone Carving & Sculpture',
    'Bookbinding & Paper Arts',
    'Tailoring & Sewing',
    'Basketry & Wickerwork',
    'Weaving & Textiles',
    'Calligraphy & Hand Lettering',
    'Mosaics & Tile Work',
    'Printmaking',
    'Paper Crafts',
    'Quilting',
    'Embroidery & Needlework',
    'Knitting & Crochet',
    'Lace Making',
    'Rug Making',
    'Toy Making',
    'Musical Instrument Making',
    'Furniture Making',
    'Restoration & Conservation'
  ];

  // Map categories to profession names for "I am a..." format
  const getCategoryProfession = (category) => {
    const categoryMap = {
      'Woodworking & Carpentry': 'Carpenter',
      'Pottery & Ceramics': 'Potter',
      'Painting & Fine Arts': 'Painter',
      'Jewelry Making': 'Jeweler',
      'Textile & Fiber Arts': 'Textile Artist',
      'Metalworking & Blacksmithing': 'Blacksmith',
      'Glassblowing & Glasswork': 'Glass Artist',
      'Leatherworking': 'Leather Artisan',
      'Stone Carving & Sculpture': 'Sculptor',
      'Bookbinding & Paper Arts': 'Bookbinder',
      'Tailoring & Sewing': 'Tailor',
      'Basketry & Wickerwork': 'Basket Maker',
      'Weaving & Textiles': 'Weaver',
      'Calligraphy & Hand Lettering': 'Calligrapher',
      'Mosaics & Tile Work': 'Mosaic Artist',
      'Printmaking': 'Printmaker',
      'Paper Crafts': 'Paper Artist',
      'Quilting': 'Quilter',
      'Embroidery & Needlework': 'Embroiderer',
      'Knitting & Crochet': 'Knitter',
      'Lace Making': 'Lace Maker',
      'Rug Making': 'Rug Maker',
      'Toy Making': 'Toy Maker',
      'Musical Instrument Making': 'Instrument Maker',
      'Furniture Making': 'Furniture Maker',
      'Restoration & Conservation': 'Restoration Specialist'
    };
    return categoryMap[category] || 'Artisan';
  };

  const skillsData = [
    {
      id: 1,
      title: "I will create custom handcrafted wooden furniture",
      provider: {
        name: "Robert Martinez",
        avatar: "https://i.pravatar.cc/40",
        rating: 4.9,
        reviews: 127,
        level: "Master Craftsman",
        isVerified: true,
        responseTime: "2 hours"
      },
      category: "Woodworking & Carpentry",
      tags: ["Custom Furniture", "Hardwood", "Joinery", "Sustainable"],
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
      packages: {
        basic: { price: 450, delivery: "14 days" },
        standard: { price: 850, delivery: "21 days" },
        premium: { price: 1500, delivery: "30 days" }
      },
      description: "Master carpenter with 15+ years experience crafting heirloom-quality furniture",
      orders: 89,
      location: "Portland, OR"
    },
    {
      id: 2,
      title: "I will create beautiful hand-thrown pottery pieces",
      provider: {
        name: "Maria Gonzalez",
        avatar: "https://i.pravatar.cc/40",
        rating: 5.0,
        reviews: 234,
        level: "Master Craftsman",
        isVerified: true,
        responseTime: "1 hour"
      },
      category: "Pottery & Ceramics",
      tags: ["Wheel Throwing", "Glazing", "Dinnerware", "Custom"],
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      packages: {
        basic: { price: 65, delivery: "7 days" },
        standard: { price: 125, delivery: "10 days" },
        premium: { price: 250, delivery: "14 days" }
      },
      description: "Professional potter creating functional and decorative ceramics",
      orders: 156,
      location: "Santa Fe, NM"
    },
    {
      id: 3,
      title: "I will create stunning custom oil paintings and portraits",
      provider: {
        name: "Catherine Brooks",
        avatar: "https://i.pravatar.cc/40",
        rating: 4.8,
        reviews: 98,
        level: "Expert Artist",
        isVerified: true,
        responseTime: "3 hours"
      },
      category: "Painting & Fine Arts",
      tags: ["Oil Painting", "Portraits", "Landscapes", "Custom Art"],
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop",
      packages: {
        basic: { price: 200, delivery: "14 days" },
        standard: { price: 450, delivery: "21 days" },
        premium: { price: 800, delivery: "30 days" }
      },
      description: "Professional artist specializing in realistic oil paintings and portraits",
      orders: 67,
      location: "Charleston, SC"
    },
    {
      id: 4,
      title: "I will craft unique handmade jewelry pieces",
      provider: {
        name: "James Sullivan",
        avatar: "https://i.pravatar.cc/40",
        rating: 4.7,
        reviews: 145,
        level: "Expert Craftsman",
        isVerified: true,
        responseTime: "4 hours"
      },
      category: "Jewelry Making",
      tags: ["Metalsmithing", "Custom Rings", "Precious Stones", "Handcrafted"],
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop",
      packages: {
        basic: { price: 180, delivery: "10 days" },
        standard: { price: 350, delivery: "14 days" },
        premium: { price: 750, delivery: "21 days" }
      },
      description: "Master jeweler creating one-of-a-kind pieces using traditional techniques",
      orders: 92,
      location: "Sedona, AZ"
    },
    {
      id: 5,
      title: "I will weave custom textiles and fiber art pieces",
      provider: {
        name: "Isabella Chen",
        avatar: "https://i.pravatar.cc/40",
        rating: 4.9,
        reviews: 78,
        level: "Master Weaver",
        isVerified: true,
        responseTime: "2 hours"
      },
      category: "Textile & Fiber Arts",
      tags: ["Hand Weaving", "Natural Fibers", "Wall Hangings", "Traditional"],
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop",
      packages: {
        basic: { price: 120, delivery: "14 days" },
        standard: { price: 280, delivery: "21 days" },
        premium: { price: 500, delivery: "28 days" }
      },
      description: "Traditional weaver specializing in custom textiles and fiber art",
      orders: 43,
      location: "Asheville, NC"
    },
    {
      id: 6,
      title: "I will forge custom ironwork and decorative pieces",
      provider: {
        name: "Thomas Anderson",
        avatar: "https://i.pravatar.cc/40",
        rating: 4.8,
        reviews: 56,
        level: "Master Blacksmith",
        isVerified: true,
        responseTime: "4 hours"
      },
      category: "Metalworking & Blacksmithing",
      tags: ["Blacksmithing", "Custom Ironwork", "Garden Gates", "Hardware"],
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300&h=200&fit=crop",
      packages: {
        basic: { price: 300, delivery: "21 days" },
        standard: { price: 650, delivery: "28 days" },
        premium: { price: 1200, delivery: "35 days" }
      },
      description: "Traditional blacksmith creating custom ironwork and decorative pieces",
      orders: 34,
      location: "Bozeman, MT"
    }
  ];

  const filteredSkills = skillsData.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="180"
            image={skill.image}
            alt={skill.title}
            sx={{ objectFit: 'cover' }}
          />
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <IconButton 
              size="small" 
              onClick={() => handleFavorite(skill.id)}
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
          <Chip
            label={skill.category}
            size="small"
            sx={{ 
              position: 'absolute', 
              bottom: 8, 
              left: 8,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white'
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
            I am a {getCategoryProfession(skill.category)}
          </Typography>

          {/* Original Title as Subheading */}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 500, 
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.95rem',
              lineHeight: 1.3
            }}
          >
            {skill.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar src={skill.provider.avatar} sx={{ width: 24, height: 24 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {skill.provider.name}
            </Typography>
            {skill.provider.isVerified && (
              <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
            )}
            <Chip 
              label={skill.provider.level} 
              size="small" 
              color={getLevelColor(skill.provider.level)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating value={skill.provider.rating} precision={0.1} size="small" readOnly />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {skill.provider.rating}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({skill.provider.reviews})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {skill.tags.slice(0, 3).map((tag) => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
            <Schedule sx={{ fontSize: 16 }} />
            <Typography variant="caption">
              Responds in {skill.provider.responseTime}
            </Typography>
            <LocationOn sx={{ fontSize: 16, ml: 1 }} />
            <Typography variant="caption">
              {skill.location}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 'auto' }}>
            <Button 
              variant="contained" 
              size="small"
              href={`/skills/${skill.id}`}
            >
              View Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
            Find the Perfect Freelancer
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Browse thousands of talented professionals ready to bring your ideas to life
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
                placeholder="Search for any service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
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
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
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
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price_low">Price: Low to High</MenuItem>
                  <MenuItem value="price_high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Best Rating</MenuItem>
                  <MenuItem value="reviews">Most Reviews</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Results Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {filteredSkills.length} artisans available
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<FilterList />}>
            More Filters
          </Button>
          <Button variant="outlined" size="small" startIcon={<TrendingUp />}>
            Pro Services
          </Button>
        </Box>
      </Box>

      {/* Skills Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredSkills.map((skill) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={skill.id}>
            <SkillCard skill={skill} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination 
          count={10} 
          page={currentPage} 
          onChange={(e, page) => setCurrentPage(page)}
          color="primary"
          size="large"
        />
      </Box>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Paper 
          sx={{ 
            p: 4, 
            mt: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Have a skill to offer?
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Join thousands of freelancers earning money doing what they love
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
            href="/skills/create"
          >
            Start Selling Your Skills
          </Button>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default SkillsPage;
