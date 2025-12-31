import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  useScrollTrigger,
  Slide,
  alpha,
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Home,
  Work,
  Assignment,
  Message,
  AccountCircle,
  Notifications,
  Dashboard,
  ExitToApp,
  Settings,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { useSocket } from '../../contexts/SimpleSocketContext';

// Hide AppBar on scroll down
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadMessages, getUnreadNotificationsCount, notifications, markNotificationAsRead } = useSocket();
  const { canAccessAdmin } = useAdmin();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'just now';
    const now = new Date();
    const timestamp = date instanceof Date ? date : new Date(date);
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  // Navigation items
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Top-Rated', path: '/browse', icon: Work },
    { label: 'Skills', path: '/skills', icon: Work },
    { label: 'Requests', path: '/requests', icon: Assignment },
  ];

  const profileMenuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Dashboard },
    { label: 'Client Dashboard', path: '/client/dashboard', icon: Assignment },
    { label: 'Provider Dashboard', path: '/provider/dashboard', icon: Work },
    { label: 'Profile', path: `/profile/${user?._id}`, icon: AccountCircle },
    { label: 'Messages', path: '/messages', icon: Message },
    { label: 'Help & Support', path: '/support', icon: Settings },
    ...(canAccessAdmin() ? [{ label: 'Admin Panel', path: '/admin', icon: Settings }] : []),
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  // Mobile drawer content
  const mobileDrawerContent = (
    <Box sx={{ width: { xs: 280, sm: 320 }, maxWidth: '85vw' }} role="presentation">
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          SkillBridge
        </Typography>
        <IconButton
          onClick={() => setMobileDrawerOpen(false)}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
      
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.label}
            component={Link}
            to={item.path}
            onClick={() => setMobileDrawerOpen(false)}
            sx={{
              backgroundColor: isActivePage(item.path) 
                ? alpha(theme.palette.primary.main, 0.1) 
                : 'transparent',
              minHeight: 56,
              py: 1.5,
              '&:active': {
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <item.icon color={isActivePage(item.path) ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '1rem',
                fontWeight: isActivePage(item.path) ? 600 : 400
              }}
              sx={{
                color: isActivePage(item.path) 
                  ? theme.palette.primary.main 
                  : 'inherit',
              }}
            />
          </ListItem>
        ))}
        
        {isAuthenticated && (
          <>
            <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
              {profileMenuItems.map((item) => (
                <ListItem 
                  button 
                  key={item.label}
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <ListItemIcon>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
              
              <ListItem>
                <ThemeToggle variant="switch" />
              </ListItem>
              
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToApp />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </Box>
          </>
        )}
        
        {!isAuthenticated && (
          <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
            <ListItem>
              <ThemeToggle variant="switch" />
            </ListItem>
            <ListItem 
              button 
              component={Link} 
              to="/login"
              onClick={() => setMobileDrawerOpen(false)}
            >
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem 
              button 
              component={Link} 
              to="/register"
              onClick={() => setMobileDrawerOpen(false)}
            >
              <ListItemText primary="Sign Up" />
            </ListItem>
          </Box>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <HideOnScroll>
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            color: 'text.primary',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ 
            px: { xs: 1, sm: 2, md: 4 },
            minHeight: { xs: 56, sm: 64 },
            py: { xs: 0.5, sm: 1 }
          }}>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ 
                  mr: 1,
                  minWidth: 44,
                  minHeight: 44,
                  p: 1
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                component={Link}
                to="/"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textDecoration: 'none',
                  mr: { xs: 1, md: 4 },
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                SkillBridge
              </Typography>
            </motion.div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, mr: 4 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    color={isActivePage(item.path) ? 'primary' : 'inherit'}
                    sx={{
                      fontWeight: isActivePage(item.path) ? 600 : 400,
                      borderRadius: 2,
                      px: 2,
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Search Bar */}
            {!isMobile && (
              <Box
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.common.black, 0.05),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.black, 0.08),
                  },
                  marginRight: 2,
                  marginLeft: 2,
                  width: '100%',
                  maxWidth: 400,
                }}
              >
                <Box
                  sx={{
                    padding: theme.spacing(0, 2),
                    height: '100%',
                    position: 'absolute',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SearchIcon />
                </Box>
                <InputBase
                  placeholder="Search skills, services..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  sx={{
                    color: 'inherit',
                    width: '100%',
                    '& .MuiInputBase-input': {
                      padding: theme.spacing(1, 1, 1, 0),
                      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                      transition: theme.transitions.create('width'),
                    },
                  }}
                />
              </Box>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Auth Section */}
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                {/* Theme Toggle - hide on very small screens */}
                {!isMobile && <ThemeToggle variant="icon" />}

                {/* Notifications */}
                <IconButton
                  color="inherit"
                  onClick={handleNotificationsOpen}
                  sx={{ 
                    minWidth: { xs: 40, sm: 48 },
                    minHeight: { xs: 40, sm: 48 },
                    p: { xs: 0.75, sm: 1 }
                  }}
                >
                  <Badge badgeContent={getUnreadNotificationsCount()} color="error">
                    <Notifications fontSize={isMobile ? "small" : "medium"} />
                  </Badge>
                </IconButton>

                {/* Messages */}
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/messages"
                  sx={{ 
                    minWidth: { xs: 40, sm: 48 },
                    minHeight: { xs: 40, sm: 48 },
                    p: { xs: 0.75, sm: 1 }
                  }}
                >
                  <Badge badgeContent={unreadMessages} color="error">
                    <Message fontSize={isMobile ? "small" : "medium"} />
                  </Badge>
                </IconButton>

                {/* Profile */}
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ 
                    p: 0, 
                    ml: { xs: 0.5, sm: 1 },
                    minWidth: { xs: 40, sm: 48 },
                    minHeight: { xs: 40, sm: 48 }
                  }}
                >
                  <Avatar
                    src={user?.profilePicture}
                    alt={user?.firstName}
                    sx={{ 
                      width: { xs: 28, sm: 32 }, 
                      height: { xs: 28, sm: 32 },
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {user?.firstName?.[0]}
                  </Avatar>
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, alignItems: 'center' }}>
                {!isMobile && <ThemeToggle variant="icon" />}
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 500,
                    minHeight: { xs: 36, sm: 40 },
                    px: { xs: 1.5, sm: 2 }
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 600,
                    minHeight: { xs: 36, sm: 40 },
                    px: { xs: 1.5, sm: 2 }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {profileMenuItems.map((item) => (
          <MenuItem
            key={item.label}
            component={Link}
            to={item.path}
            sx={{ gap: 1 }}
          >
            <item.icon fontSize="small" />
            {item.label}
          </MenuItem>
        ))}
        
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
          <ExitToApp fontSize="small" />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: { 
            width: { xs: '90vw', sm: 320 },
            maxWidth: 400,
            maxHeight: { xs: '70vh', sm: 400 }
          }
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </MenuItem>
        <Divider />
        {notifications && notifications.length > 0 ? (
          <>
            {notifications.slice(0, 5).map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => {
                  if (!notification.read) {
                    markNotificationAsRead(notification.id);
                  }
                  handleNotificationsClose();
                  // Navigate based on notification type
                  // Don't navigate for budget change requests - they have action buttons
                  if (notification.type === 'budget_change_request') {
                    // Don't navigate - user should use approve/reject buttons
                    return;
                  }
                  
                  if (notification.type === 'message' && notification.related_id) {
                    navigate('/messages');
                  } else if (notification.type === 'proposal' && notification.related_id) {
                    navigate(`/proposals`);
                  } else if (notification.type === 'budget_change_approved' || notification.type === 'budget_change_rejected') {
                    navigate('/proposals');
                  }
                }}
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.selected',
                  borderLeft: notification.read ? 'none' : '3px solid',
                  borderColor: 'primary.main',
                  py: 1.5,
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: notification.read ? 400 : 600,
                      mb: 0.5
                    }}
                  >
                    {notification.title}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                    {formatTimeAgo(notification.timestamp)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            {notifications.length > 5 && (
              <>
                <Divider />
                <MenuItem 
                  component={Link} 
                  to="/notifications"
                  onClick={handleNotificationsClose}
                >
                  <Typography variant="body2" color="primary" sx={{ textAlign: 'center', width: '100%' }}>
                    View All ({notifications.length} notifications)
                  </Typography>
                </MenuItem>
              </>
            )}
          </>
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </MenuItem>
        )}
        {notifications && notifications.length > 0 && (
          <>
            <Divider />
            <MenuItem 
              component={Link} 
              to="/notifications"
              onClick={handleNotificationsClose}
            >
              <Typography variant="body2" color="primary">
                View All Notifications
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      >
        {mobileDrawerContent}
      </Drawer>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default Navbar;
