import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Paper,
  Divider,
  Badge,
  Chip,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  Fab,
} from '@mui/material';
import {
  Send,
  Search,
  MoreVert,
  AttachFile,
  Phone,
  VideoCall,
  Info,
  Archive,
  Delete,
  Star,
  StarBorder,
  Circle,
  Add,
  EmojiEmotions,
  Image,
  Description,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { db } from '../../lib/supabase';
import { transformUser, transformMessage, formatTimeAgo } from '../../utils/dataTransform';

// Simple message input component - no memo to avoid focus issues
const MessageInput = React.forwardRef(({ value, onChange, onKeyPress }, ref) => {
  return (
    <TextField
      ref={ref}
      fullWidth
      multiline
      maxRows={4}
      placeholder="Type a message..."
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      variant="outlined"
      size="small"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
        }
      }}
    />
  );
});

MessageInput.displayName = 'MessageInput';

const MessagesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Fetch conversations from database
  useEffect(() => {
    const fetchConversations = async () => {
      if (authLoading || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching conversations for user:', user.id);
        
        const dbConversations = await db.conversations.getUserConversations(user.id);
        console.log('Fetched conversations:', dbConversations);
        console.log('Number of conversations found:', dbConversations?.length || 0);
        
        if (dbConversations.length === 0) {
          console.warn('No conversations found for user:', user.id);
        }

        // Transform conversations to match component format
        const transformedConversations = await Promise.all(
          dbConversations.map(async (conv) => {
            try {
              // Determine the other participant (not the current user)
              const otherUser = conv.user1_id === user.id ? conv.user2 : conv.user1;
              const otherUserTransformed = otherUser ? transformUser(otherUser) : null;
              
              // Get the other user's ID
              const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
              
              // Calculate unread count by fetching unread messages
              let unreadCount = 0;
              try {
                const convMessages = await db.messages.getConversation(conv.id);
                unreadCount = convMessages.filter(msg => 
                  msg.sender_id !== user.id && !msg.read
                ).length;
              } catch (err) {
                console.error('Error fetching unread count:', err);
              }

              // Get last message preview
              const lastMessageText = conv.last_message 
                ? (conv.last_message.length > 50 ? conv.last_message.substring(0, 50) + '...' : conv.last_message)
                : 'No messages yet';
              
              const lastMessageTimestamp = conv.last_message_created_at 
                ? formatTimeAgo(new Date(conv.last_message_created_at))
                : (conv.last_message_at ? formatTimeAgo(new Date(conv.last_message_at)) : 'No messages');

              return {
                id: conv.id,
                conversationId: conv.id,
                participant: {
                  id: otherUserTransformed?.id || otherUserId,
                  name: otherUserTransformed?.name || otherUserTransformed?.email || 'Unknown User',
                  avatar: otherUserTransformed?.avatar || otherUserTransformed?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserTransformed?.name || otherUserTransformed?.email || 'Unknown')}&background=000080&color=fff`,
                  status: 'offline', // TODO: Add online status tracking
                  lastSeen: 'Unknown',
                },
                lastMessage: {
                  text: lastMessageText,
                  timestamp: lastMessageTimestamp,
                  sender: conv.last_message_sender_id === user.id ? 'me' : 'them',
                  unread: unreadCount > 0,
                },
                project: conv.requests?.title || 'General Conversation',
                type: conv.request_id ? 'project' : 'general',
                starred: false, // TODO: Add starring feature
                archived: false, // TODO: Add archiving feature
                unreadCount: unreadCount,
                requestId: conv.request_id,
              };
            } catch (err) {
              console.error('Error transforming conversation:', conv.id, err);
              // Return a basic conversation object even if transformation fails
              return {
                id: conv.id,
                conversationId: conv.id,
                participant: {
                  id: conv.user1_id === user.id ? conv.user2_id : conv.user1_id,
                  name: 'Unknown User',
                  avatar: `https://ui-avatars.com/api/?name=Unknown&background=000080&color=fff`,
                  status: 'offline',
                  lastSeen: 'Unknown',
                },
                lastMessage: {
                  text: 'No messages yet',
                  timestamp: 'No messages',
                  sender: 'them',
                  unread: false,
                },
                project: 'General Conversation',
                type: 'general',
                starred: false,
                archived: false,
                unreadCount: 0,
                requestId: conv.request_id,
              };
            }
          })
        );

        console.log('Transformed conversations:', transformedConversations);
        console.log('Setting conversations count:', transformedConversations.length);
        setConversations(transformedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    
    // Refresh conversations every 10 seconds to show new messages
    const interval = setInterval(() => {
      if (!authLoading && user?.id) {
        fetchConversations();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user?.id, authLoading]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation?.id || !user?.id) {
        setMessages([]);
        return;
      }

      try {
        console.log('Fetching messages for conversation:', selectedConversation.id);
        
        const dbMessages = await db.messages.getConversation(selectedConversation.id);
        console.log('Fetched messages:', dbMessages);

        // Transform messages to match component format
        const transformedMessages = dbMessages.map(msg => {
          const transformed = transformMessage(msg);
          const isMe = transformed.senderId === user.id;
          
          return {
            id: transformed.id,
            text: transformed.content,
            sender: isMe ? 'me' : 'them',
            timestamp: transformed.createdAt,
            type: 'text',
            read: transformed.read,
          };
        });

        setMessages(transformedMessages);

        // Mark messages as read
        if (transformedMessages.length > 0) {
          await db.messages.markAsRead(selectedConversation.id, user.id);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
    
    // Refresh messages every 3 seconds to show new incoming messages
    const interval = setInterval(fetchMessages, 3000);
    
    return () => clearInterval(interval);
  }, [selectedConversation?.id, user?.id]);

  // All data now comes from database - no mock data

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (!conv || !conv.participant) return false;
      const name = conv.participant.name || '';
      const project = conv.project || '';
      if (!searchTerm.trim()) return true;
      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             project.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm]);

  // Debug logging
  useEffect(() => {
    console.log('Conversations state:', conversations);
    console.log('Filtered conversations:', filteredConversations);
    console.log('Search term:', searchTerm);
  }, [conversations, filteredConversations, searchTerm]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Only scroll when conversation changes, not on every message update
    if (selectedConversation) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedConversation]);

  // Scroll to bottom when new message is added (but not on every render)
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation?.id || !user?.id) return;

    try {
      setSending(true);
      
      // Send message to database
      const messageData = {
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: newMessage.trim(),
        read: false,
      };

      console.log('Sending message:', messageData);
      
      const sentMessage = await db.messages.send(messageData);
      console.log('Message sent:', sentMessage);

      // Transform and add to local state
      const transformed = transformMessage(sentMessage);
      const newMsg = {
        id: transformed.id,
        text: transformed.content,
        sender: 'me',
        timestamp: transformed.createdAt,
        type: 'text',
        read: transformed.read,
      };

      setMessages(prev => [...prev, newMsg]);

      // Update conversation list with new last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { 
              ...conv, 
              lastMessage: { 
                text: newMessage.trim(),
                timestamp: 'Just now',
                sender: 'me',
                unread: false
              },
              unreadCount: 0
            }
          : conv
      ));

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  }, [newMessage, selectedConversation, user]);

  const handleMessageChange = useCallback((e) => {
    const newValue = e.target.value;
    setNewMessage(newValue);
    
    // Preserve cursor position and focus
    const input = e.target;
    const cursorPosition = input.selectionStart;
    
    // Use requestAnimationFrame to ensure state update doesn't cause focus loss
    requestAnimationFrame(() => {
      if (messageInputRef.current) {
        const textField = messageInputRef.current;
        const inputElement = textField.querySelector('textarea') || textField.querySelector('input');
        if (inputElement && document.activeElement !== inputElement) {
          inputElement.focus();
          if (inputElement.setSelectionRange && cursorPosition !== null) {
            inputElement.setSelectionRange(cursorPosition, cursorPosition);
          }
        }
      }
    });
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'away': return '#ff9800';
      case 'offline': return '#757575';
      default: return '#757575';
    }
  };

  const ConversationList = () => (
    <Card sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Messages
          </Typography>
          <IconButton onClick={() => setNewChatDialogOpen(true)} color="primary">
            <Add />
          </IconButton>
        </Box>
        
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </CardContent>

      <Divider />

      <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography color="text.secondary">Loading conversations...</Typography>
          </Box>
        ) : filteredConversations.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {searchTerm ? 'No conversations match your search' : 'No conversations yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try a different search term' : 'Start a conversation by contacting someone'}
            </Typography>
          </Box>
        ) : (
        <AnimatePresence>
          {filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ListItem
                button
                selected={selectedConversation?.id === conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                sx={{
                  px: 2,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.50',
                    borderRight: 3,
                    borderColor: 'primary.main'
                  },
                  '&:hover': {
                    backgroundColor: 'grey.50'
                  }
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Circle 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          color: getStatusColor(conversation.participant.status) 
                        }} 
                      />
                    }
                  >
                    <Avatar src={conversation.participant.avatar} />
                  </Badge>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: conversation.lastMessage.unread ? 700 : 500,
                          color: conversation.lastMessage.unread ? 'text.primary' : 'inherit'
                        }}
                      >
                        {conversation.participant.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {conversation.starred && <Star sx={{ fontSize: 16, color: 'warning.main' }} />}
                        <Typography variant="caption" color="text.secondary">
                          {conversation.lastMessage.timestamp}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontWeight: conversation.lastMessage.unread ? 600 : 400,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {conversation.lastMessage.text}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Chip 
                          label={conversation.project} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                        {conversation.unreadCount > 0 && (
                          <Badge 
                            badgeContent={conversation.unreadCount} 
                            color="primary" 
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.7rem',
                                height: 18,
                                minWidth: 18
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
            </motion.div>
          ))}
        </AnimatePresence>
        )}
      </List>
    </Card>
  );

  const ChatArea = () => {
    if (!selectedConversation) {
      return (
        <Card sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Select a conversation to start messaging
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose from your existing conversations or start a new one
            </Typography>
          </Box>
        </Card>
      );
    }

    const conversationMessages = messages || [];

    return (
      <Card sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <CardContent sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Circle 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      color: getStatusColor(selectedConversation.participant.status) 
                    }} 
                  />
                }
              >
                <Avatar src={selectedConversation.participant.avatar} sx={{ width: 48, height: 48 }} />
              </Badge>
              
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedConversation.participant.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedConversation.participant.status === 'online' ? 'Online' : `Last seen ${selectedConversation.participant.lastSeen}`}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton>
                <Phone />
              </IconButton>
              <IconButton>
                <VideoCall />
              </IconButton>
              <IconButton onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          <Chip 
            label={selectedConversation.project} 
            size="small" 
            color="primary"
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </CardContent>

        {/* Messages Area */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <AnimatePresence>
            {conversationMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      backgroundColor: message.sender === 'me' ? 'primary.main' : 'grey.100',
                      color: message.sender === 'me' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      borderRadius: 2,
                      borderTopLeftRadius: message.sender === 'me' ? 2 : 0.5,
                      borderTopRightRadius: message.sender === 'me' ? 0.5 : 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {message.text}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 0.5, 
                        opacity: 0.8,
                        textAlign: 'right'
                      }}
                    >
                      {message.timestamp instanceof Date 
                        ? formatTime(message.timestamp) 
                        : typeof message.timestamp === 'string' 
                          ? formatTime(new Date(message.timestamp))
                          : 'Just now'}
                    </Typography>
                  </Paper>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <IconButton size="small">
              <AttachFile />
            </IconButton>
            <IconButton size="small">
              <Image />
            </IconButton>
            <MessageInput
              value={newMessage}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              inputRef={messageInputRef}
            />
            <IconButton size="small">
              <EmojiEmotions />
            </IconButton>
            <IconButton 
              color="primary" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{
                backgroundColor: newMessage.trim() ? 'primary.main' : 'grey.300',
                color: 'white',
                '&:hover': {
                  backgroundColor: newMessage.trim() ? 'primary.dark' : 'grey.400',
                }
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ 
      py: { xs: 2, sm: 3, md: 4 }, 
      px: { xs: 0, sm: 2, md: 3 },
      height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' }
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Messages
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Communicate with your clients and collaborate on projects
        </Typography>
      </motion.div>

      {/* Chat Interface */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12} md={4}>
          <ConversationList />
        </Grid>
        <Grid item xs={12} md={8}>
          <ChatArea />
        </Grid>
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => setMenuAnchorEl(null)}>
          <Info sx={{ mr: 1 }} /> View Profile
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchorEl(null)}>
          <StarBorder sx={{ mr: 1 }} /> Star Conversation
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchorEl(null)}>
          <Archive sx={{ mr: 1 }} /> Archive
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchorEl(null)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* New Chat Dialog */}
      <Dialog
        open={newChatDialogOpen}
        onClose={() => setNewChatDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Start New Conversation</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Search users"
            placeholder="Enter name or email..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Start Chat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        onClick={() => setNewChatDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default MessagesPage;
