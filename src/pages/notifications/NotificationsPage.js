import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Chip,
  Menu,
  MenuItem,
  Checkbox,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Divider,
  Badge,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  MarkEmailRead,
  MarkEmailUnread,
  Delete,
  MoreVert,
  FilterList,
  Search,
  Work,
  Message,
  Star,
  Assignment,
  Payment,
  Security,
  AccountCircle,
  CheckCircle,
  Cancel,
  Info,
  Warning,
  Error,
  Clear,
  DoneAll,
  SettingsApplications,
  Schedule,
  Visibility,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SimpleSocketContext';
import { db, supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { notifications, getUnreadNotificationsCount, markAllNotificationsAsRead, refreshNotifications, loading: notificationsLoading } = useSocket();

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };
  const [activeTab, setActiveTab] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [markAllDialog, setMarkAllDialog] = useState(false);

  // Use notifications from context, transform to match expected format
  const transformedNotifications = (notifications || []).map(notif => ({
    id: notif.id,
    type: notif.type || 'system',
    title: notif.title,
    message: notif.message,
    avatar: null, // Could be enhanced to fetch sender avatar
    sender: notif.sender || { name: 'System', id: 'system' },
    isRead: notif.read || false,
    timestamp: notif.timestamp,
    related_id: notif.related_id, // Keep for backward compatibility
    metadata: notif.metadata || null, // Include metadata directly
    data: { 
      relatedId: notif.related_id,
      metadata: notif.metadata || null // Include metadata for budget change requests
    }
  }));

  const notificationTypes = [
    { value: 'all', label: 'All', count: transformedNotifications.length },
    { value: 'unread', label: 'Unread', count: transformedNotifications.filter(n => !n.isRead).length },
    { value: 'message', label: 'Messages', count: transformedNotifications.filter(n => n.type === 'message').length },
    { value: 'proposal', label: 'Proposals', count: transformedNotifications.filter(n => n.type === 'proposal').length },
    { value: 'review', label: 'Reviews', count: transformedNotifications.filter(n => n.type === 'review').length },
    { value: 'payment', label: 'Payments', count: transformedNotifications.filter(n => n.type === 'payment').length },
    { value: 'system', label: 'System', count: transformedNotifications.filter(n => n.type === 'system').length }
  ];

  const getNotificationIcon = (type) => {
    const icons = {
      message: <Message />,
      proposal: <Work />,
      review: <Star />,
      payment: <Payment />,
      request_update: <Assignment />,
      security: <Security />,
      system: <Info />
    };
    return icons[type] || <Notifications />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      message: 'primary',
      proposal: 'success',
      review: 'warning',
      payment: 'success',
      request_update: 'info',
      security: 'error',
      system: 'default'
    };
    return colors[type] || 'default';
  };

  const filteredNotifications = transformedNotifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.sender.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
      (filterType === 'unread' && !notification.isRead) ||
      notification.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === paginatedNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(paginatedNotifications.map(n => n.id));
    }
  };

  const markAsRead = async (notificationIds) => {
    try {
      await Promise.all(notificationIds.map(id => db.notifications.markAsRead(id)));
      // Refresh notifications after marking as read
      if (refreshNotifications) {
        refreshNotifications();
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAsUnread = (notificationIds) => {
    // Note: Supabase doesn't have a markAsUnread function, so we'll skip this
    // or you could implement it if needed
    console.warn('Mark as unread not implemented in database');
  };

  const deleteNotifications = async (notificationIds) => {
    try {
      // Delete notifications from database
      await Promise.all(notificationIds.map(id => db.notifications.delete(id)));
      // Refresh notifications after deletion
      if (refreshNotifications) {
        refreshNotifications();
      }
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setMarkAllDialog(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Don't navigate if it's a budget change request (has action buttons)
    if (notification.type === 'budget_change_request') {
      // Just mark as read if unread, don't navigate
      if (!notification.isRead) {
        markAsRead([notification.id]);
      }
      return;
    }

    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }

    // Navigate to relevant page based on type
    switch (notification.type) {
      case 'message':
        // Navigate to messages
        break;
      case 'proposal':
        // Navigate to proposals
        break;
      case 'budget_change_approved':
        // Navigate to proposals page (without request ID to avoid RLS issues)
        window.location.href = `/proposals`;
        break;
      case 'budget_change_rejected':
        // Navigate to proposals page (without request ID to avoid RLS issues)
        window.location.href = `/proposals`;
        break;
      case 'review':
        // Navigate to reviews
        break;
      case 'payment':
        // Navigate to payments
        break;
      default:
        break;
    }
  };

  const handleBudgetChangeApproval = async (notification, approved) => {
    try {
      // Get metadata from notification - try multiple locations
      const metadata = notification.data?.metadata || notification.metadata || {};
      console.log('Notification metadata:', metadata);
      console.log('Full notification:', notification);
      
      // Try to get proposal ID from multiple sources
      const proposalId = metadata.proposal_id || notification.data?.relatedId || notification.related_id;
      let requestId = metadata.request_id;
      
      if (!proposalId) {
        alert('Error: Missing proposal information. Please try refreshing the page.');
        console.error('Missing proposal ID. Notification:', notification);
        return;
      }

      // Get proposal to find artisan and client IDs
      let proposal;
      try {
        proposal = await db.proposals.getById(proposalId);
      } catch (err) {
        console.error('Error fetching proposal:', err);
        alert('Error: Unable to fetch proposal details. Please try again later.');
        return;
      }

      if (!proposal) {
        alert('Error: Proposal not found. It may have been deleted.');
        return;
      }

      // Get request ID - use from metadata or proposal
      if (!requestId) {
        requestId = proposal.request_id;
      }
      
      // If still no request ID, fetch it from proposal
      if (!requestId) {
        const { data: proposalData } = await supabase
          .from('proposals')
          .select('request_id')
          .eq('id', proposalId)
          .maybeSingle();
        requestId = proposalData?.request_id;
      }

      if (!requestId) {
        alert('Error: Missing request information. Please contact support.');
        return;
      }

      // Get client ID from request
      let clientId = proposal.request?.user_id;
      if (!clientId) {
        const { data: requestData } = await supabase
          .from('requests')
          .select('user_id')
          .eq('id', requestId)
          .maybeSingle();
        clientId = requestData?.user_id || user.id;
      }

      // Respond to budget change
      await db.proposals.respondToBudgetChange({
        proposalId: proposalId,
        approved: approved,
        artisanId: proposal.user_id,
        clientId: clientId,
        requestId: requestId
      });

      // Mark notification as read
      if (!notification.isRead) {
        markAsRead([notification.id]);
      }

      alert(approved 
        ? 'Budget change approved! The client has been notified and can proceed with payment.'
        : 'Budget change rejected. The client has been notified.'
      );

      // Refresh notifications
      refreshNotifications();
    } catch (error) {
      console.error('Error handling budget change approval:', error);
      alert(`Failed to ${approved ? 'approve' : 'reject'} budget change: ${error.message}`);
    }
  };

  const renderNotificationItem = (notification) => (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <ListItem
        sx={{
          bgcolor: notification.isRead ? 'transparent' : 'action.hover',
          borderRadius: 2,
          mb: 1,
          border: '1px solid',
          borderColor: notification.isRead ? 'divider' : 'primary.light',
          cursor: notification.type === 'budget_change_request' ? 'default' : 'pointer',
          '&:hover': {
            bgcolor: 'action.selected'
          }
        }}
        onClick={() => {
          // Don't navigate for budget change requests - buttons handle actions
          if (notification.type === 'budget_change_request') {
            // Just mark as read if unread
            if (!notification.isRead) {
              markAsRead([notification.id]);
            }
            return;
          }
          handleNotificationClick(notification);
        }}
      >
        <Checkbox
          checked={selectedNotifications.includes(notification.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleSelectNotification(notification.id);
          }}
          sx={{ mr: 1 }}
        />
        <ListItemAvatar>
          <Badge 
            variant="dot" 
            color="primary" 
            invisible={notification.isRead}
            sx={{ '& .MuiBadge-dot': { width: 8, height: 8 } }}
          >
            <Avatar 
              src={notification.avatar}
              sx={{ 
                bgcolor: `${getNotificationColor(notification.type)}.main`,
                width: 48,
                height: 48
              }}
            >
              {notification.avatar ? null : getNotificationIcon(notification.type)}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: notification.isRead ? 400 : 600,
                  flex: 1
                }}
              >
                {notification.title}
              </Typography>
              <Chip
                size="small"
                label={notification.type.replace('_', ' ')}
                color={getNotificationColor(notification.type)}
                variant="outlined"
              />
            </Box>
          }
          secondary={
            <Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontWeight: notification.isRead ? 400 : 500,
                  mb: 0.5
                }}
              >
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {formatTimeAgo(notification.timestamp)} • {notification.sender.name}
              </Typography>
            </Box>
          }
        />
        <ListItemSecondaryAction>
          {notification.type === 'budget_change_request' ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBudgetChangeApproval(notification, true);
                }}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBudgetChangeApproval(notification, false);
                }}
              >
                Reject
              </Button>
            </Box>
          ) : (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNotificationId(notification.id);
                setMoreMenuAnchorEl(e.currentTarget);
              }}
            >
              <MoreVert />
            </IconButton>
          )}
        </ListItemSecondaryAction>
      </ListItem>
    </motion.div>
  );

  const renderEmptyState = () => (
    <Box 
      sx={{ 
        textAlign: 'center', 
        py: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      <NotificationsNone sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.secondary">
        No notifications found
      </Typography>
      <Typography variant="body2" color="text.disabled">
        {searchTerm || filterType !== 'all' 
          ? 'Try adjusting your filters or search terms'
          : 'You\'re all caught up! Check back later for new notifications.'
        }
      </Typography>
      {(searchTerm || filterType !== 'all') && (
        <Button 
          variant="outlined"
          onClick={() => {
            setSearchTerm('');
            setFilterType('all');
            setCurrentPage(1);
          }}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  );

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Messages', value: 'message' },
    { label: 'Work', value: 'proposal' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
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
            Notifications
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Stay updated with your latest activities
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 3 }}>
          {/* Tabs and Actions */}
          <Box sx={{ px: 3, pt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    label={
                      <Badge 
                        badgeContent={notificationTypes.find(nt => nt.value === tab.value)?.count || 0}
                        color="primary"
                        max={99}
                      >
                        {tab.label}
                      </Badge>
                    }
                  />
                ))}
              </Tabs>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Mark all as read">
                  <IconButton onClick={() => setMarkAllDialog(true)}>
                    <DoneAll />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Settings">
                  <IconButton>
                    <SettingsApplications />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Search and Filter */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                size="small"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              >
                Filter
              </Button>
            </Box>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert 
                  severity="info" 
                  sx={{ mb: 2 }}
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        onClick={() => markAsRead(selectedNotifications)}
                        startIcon={<MarkEmailRead />}
                      >
                        Mark Read
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => markAsUnread(selectedNotifications)}
                        startIcon={<MarkEmailUnread />}
                      >
                        Mark Unread
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => deleteNotifications(selectedNotifications)}
                        startIcon={<Delete />}
                      >
                        Delete
                      </Button>
                    </Box>
                  }
                >
                  {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                </Alert>
              </motion.div>
            )}
          </Box>

          <Divider />

          {/* Notifications List */}
          <Box sx={{ p: 3 }}>
            {notificationsLoading ? (
              <Box>
                {[...Array(5)].map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton variant="text" width="40%" height={16} />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : filteredNotifications.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                {/* Select All */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Checkbox
                    checked={selectedNotifications.length === paginatedNotifications.length && paginatedNotifications.length > 0}
                    indeterminate={selectedNotifications.length > 0 && selectedNotifications.length < paginatedNotifications.length}
                    onChange={handleSelectAll}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Select all on this page
                  </Typography>
                </Box>

                {/* Notifications */}
                <List sx={{ width: '100%' }}>
                  <AnimatePresence>
                    {paginatedNotifications.map(renderNotificationItem)}
                  </AnimatePresence>
                </List>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Paper>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
        >
          {notificationTypes.map((type) => (
            <MenuItem
              key={type.value}
              selected={filterType === type.value}
              onClick={() => {
                setFilterType(type.value);
                setFilterAnchorEl(null);
                setCurrentPage(1);
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{type.label}</span>
                <Chip size="small" label={type.count} />
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* More Actions Menu */}
        <Menu
          anchorEl={moreMenuAnchorEl}
          open={Boolean(moreMenuAnchorEl)}
          onClose={() => setMoreMenuAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            if (selectedNotificationId) {
              const notification = transformedNotifications.find(n => n.id === selectedNotificationId);
              if (notification) {
                notification.isRead ? markAsUnread([selectedNotificationId]) : markAsRead([selectedNotificationId]);
              }
            }
            setMoreMenuAnchorEl(null);
          }}>
            {transformedNotifications.find(n => n.id === selectedNotificationId)?.isRead ? (
              <>
                <MarkEmailUnread sx={{ mr: 1 }} />
                Mark as Unread
              </>
            ) : (
              <>
                <MarkEmailRead sx={{ mr: 1 }} />
                Mark as Read
              </>
            )}
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedNotificationId) {
              deleteNotifications([selectedNotificationId]);
            }
            setMoreMenuAnchorEl(null);
          }}>
            <Delete sx={{ mr: 1 }} color="error" />
            <Typography color="error">Delete</Typography>
          </MenuItem>
        </Menu>

        {/* Mark All Read Dialog */}
        <Dialog
          open={markAllDialog}
          onClose={() => setMarkAllDialog(false)}
        >
          <DialogTitle>Mark All as Read</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to mark all notifications as read? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMarkAllDialog(false)}>Cancel</Button>
            <Button onClick={markAllAsRead} variant="contained">
              Mark All Read
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Visibility />
        </Fab>
      </motion.div>
    </Container>
  );
};

export default NotificationsPage;
