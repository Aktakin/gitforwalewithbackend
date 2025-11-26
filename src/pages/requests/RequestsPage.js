import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  IconButton,
  Pagination,
  Divider,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  Star,
  Verified,
  Schedule,
  LocationOn,
  TrendingUp,
  AttachMoney,
  Assignment,
  Person,
  Visibility,
  GridView,
  ViewList,
  NavigateNext,
  AccessTime,
  Send,
  BookmarkBorder,
  Bookmark,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { transformRequest, transformUser, formatTimeAgo } from '../../utils/dataTransform';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const RequestsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetRange, setBudgetRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [savedRequests, setSavedRequests] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [jobRequests, setJobRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([{ name: 'All Categories', count: 0 }]);

  // Fetch requests from database
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all public open requests
        const dbRequests = await db.requests.getAll({ 
          status: 'open', 
          isPublic: true,
          pageSize: 100 
        });
        
        console.log('Fetched requests:', dbRequests);
        
        // Transform requests
        const transformedRequests = dbRequests
          .map(transformRequest)
          .filter(req => req !== null);
        
        setJobRequests(transformedRequests);
        
        // Calculate categories from actual data
        const categoryCounts = {};
        transformedRequests.forEach(req => {
          if (req.category) {
            categoryCounts[req.category] = (categoryCounts[req.category] || 0) + 1;
          }
        });
        
        const categoryList = [
          { name: 'All Categories', count: transformedRequests.length },
          ...Object.entries(categoryCounts).map(([name, count]) => ({
            name,
            count
          })).sort((a, b) => b.count - a.count)
        ];
        
        setCategories(categoryList);
        
        // Update budget range based on actual data
        if (transformedRequests.length > 0) {
          const budgets = transformedRequests
            .map(req => {
              const budget = req.budget || {};
              return budget.max || budget.min || 0;
            })
            .filter(b => b > 0);
          
          if (budgets.length > 0) {
            const maxBudget = Math.max(...budgets);
            setBudgetRange([0, Math.ceil(maxBudget / 1000) * 1000]);
          }
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError(err.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Auto-refresh requests every 60 seconds to get updated proposal counts
    const interval = setInterval(() => {
      fetchRequests();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Filter and sort requests
  const filteredRequests = jobRequests
    .filter(request => {
      if (!request) return false;
      
      const matchesSearch = !searchTerm.trim() || 
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.tags || []).some(tag => tag?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || 
        request.category === selectedCategory;
      
      const budget = request.budget || {};
      const minBudget = budget.min || 0;
      const maxBudget = budget.max || 0;
      const matchesBudget = (minBudget >= budgetRange[0] && minBudget <= budgetRange[1]) ||
        (maxBudget >= budgetRange[0] && maxBudget <= budgetRange[1]) ||
        (minBudget <= budgetRange[0] && maxBudget >= budgetRange[1]);
      
      return matchesSearch && matchesCategory && matchesBudget;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'budget_high':
          return ((b.budget?.max || 0) - (a.budget?.max || 0));
        case 'budget_low':
          return ((a.budget?.min || 0) - (b.budget?.min || 0));
        case 'urgent':
          const urgencyOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        default:
          return 0;
      }
    });

  const handleSaveRequest = (requestId) => {
    const newSaved = new Set(savedRequests);
    if (newSaved.has(requestId)) {
      newSaved.delete(requestId);
    } else {
      newSaved.add(requestId);
    }
    setSavedRequests(newSaved);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Budget not specified';
    if (budget.type === 'monthly') {
      return `$${(budget.min || 0).toLocaleString()} - $${(budget.max || 0).toLocaleString()}/month`;
    }
    if (budget.min === budget.max && budget.min > 0) {
      return `$${budget.min.toLocaleString()}`;
    }
    if (budget.min && budget.max) {
      return `$${(budget.min || 0).toLocaleString()} - $${(budget.max || 0).toLocaleString()}`;
    }
    if (budget.min) {
      return `$${budget.min.toLocaleString()}+`;
    }
    return 'Budget not specified';
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    if (typeof deadline === 'string') {
      return deadline;
    }
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
    const now = new Date();
    const diffInDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'Overdue';
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays < 7) return `${diffInDays} days`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`;
    return `${Math.floor(diffInDays / 365)} years`;
  };

  // Map categories to simple profession names
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

  const RequestCard = ({ request }) => (
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
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
        onClick={() => navigate(`/requests/${request.id}`)}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              {/* New Category-based Main Heading */}
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  color: 'primary.main',
                  lineHeight: 1.2
                }}
              >
                {getCategoryProfession(request.category)} Needed!
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
                  lineHeight: 1.3,
                  color: 'text.primary',
                  fontSize: '1rem'
                }}
              >
                {request.title}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleSaveRequest(request.id);
              }}
              sx={{ ml: 1 }}
            >
              {savedRequests.has(request.id) ? 
                <Bookmark color="primary" /> : 
                <BookmarkBorder />
              }
            </IconButton>
          </Box>

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
            {request.description}
          </Typography>

          {request.user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Avatar src={request.user.avatar || request.user.profilePicture} sx={{ width: 32, height: 32 }}>
                {(request.user.firstName?.[0] || request.user.first_name?.[0] || '') + (request.user.lastName?.[0] || request.user.last_name?.[0] || '') || 'U'}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {request.user.name || request.user.firstName || request.user.first_name || 'Unknown User'}
                  </Typography>
                  {request.user.isVerified && (
                    <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
                  )}
                </Box>
                {request.user.location && (
                  <Typography variant="caption" color="text.secondary">
                    {typeof request.user.location === 'object' 
                      ? `${request.user.location.city || ''}, ${request.user.location.state || ''}`.trim() || 'Location not specified'
                      : request.user.location}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {(request.tags && request.tags.length > 0) && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {request.tags.slice(0, 4).map((tag, index) => (
                <Chip 
                  key={tag || index} 
                  label={tag} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
              {request.tags.length > 4 && (
                <Typography variant="caption" color="text.secondary">
                  +{request.tags.length - 4} more
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachMoney sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                {formatBudget(request.budget)}
              </Typography>
            </Box>
            {request.deadline && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDeadline(request.deadline)}
                </Typography>
              </Box>
            )}
            {request.urgency && (
              <Chip 
                label={request.urgency.toUpperCase()} 
                size="small" 
                color={getUrgencyColor(request.urgency)}
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
            <AccessTime sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              Posted {formatTimeAgo(request.createdAt)}
            </Typography>
            <Person sx={{ fontSize: 14, ml: 1 }} />
            <Typography variant="caption">
              {request.proposals || 0} proposals
            </Typography>
            <Visibility sx={{ fontSize: 14, ml: 1 }} />
            <Typography variant="caption">
              {request.views || 0} views
            </Typography>
            {request.location && (
              <>
                <LocationOn sx={{ fontSize: 14, ml: 1 }} />
                <Typography variant="caption">
                  {typeof request.location === 'object' 
                    ? `${request.location.city || ''}, ${request.location.state || ''}`.trim() || 'Location not specified'
                    : request.location}
                </Typography>
              </>
            )}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Category: {request.category}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              size="small"
              startIcon={<Send />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/requests/${request.id}/proposal`);
              }}
            >
              Send Proposal
            </Button>
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
        <Typography color="text.primary">Craft Projects</Typography>
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
            Discover Craft Projects
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Browse artisan requests and showcase your craftsmanship
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filteredRequests.length} active projects • Connecting artisans with passionate clients
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
                placeholder="Search craft projects..."
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
              <Typography variant="body2" gutterBottom>
                Budget: ${budgetRange[0].toLocaleString()} - ${budgetRange[1].toLocaleString()}
              </Typography>
              <Slider
                value={budgetRange}
                onChange={(e, newValue) => setBudgetRange(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                step={250}
                sx={{
                  '& .MuiSlider-thumb': {
                    width: 20,
                    height: 20,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterList />}
                sx={{ height: 56, borderRadius: 2 }}
              >
                More Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Results Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {filteredRequests.length} Craft Projects Available
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
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="budget_high">Highest Budget</MenuItem>
              <MenuItem value="budget_low">Lowest Budget</MenuItem>
              <MenuItem value="proposals">Fewest Proposals</MenuItem>
              <MenuItem value="urgent">Most Urgent</MenuItem>
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

      {/* Requests Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" variant="h6" gutterBottom>
            Error Loading Requests
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {error}
          </Typography>
        </Box>
      ) : filteredRequests.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No requests found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || selectedCategory || budgetRange[1] < 10000
              ? 'Try adjusting your filters'
              : 'Be the first to post a request!'}
          </Typography>
          {!searchTerm && !selectedCategory && (
            <Button variant="contained" onClick={() => navigate('/requests/create')}>
              Create Request
            </Button>
          )}
        </Box>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {filteredRequests.map((request) => (
              <Grid item xs={12} sm={6} md={4} key={request.id}>
                <RequestCard request={request} />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <Pagination 
          count={Math.ceil(filteredRequests.length / 12)} 
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
            background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
            color: 'white',
            borderRadius: 3
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Share Your Craft?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of artisans earning money doing what they love
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
              href="/register"
            >
              Join as Artisan
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
              href="/requests/create"
            >
              Post a Project
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default RequestsPage;
