import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar,
  Paper,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  LiveHelp,
  ChatBubble,
  Phone,
  Email,
  Article,
  VideoLibrary,
  School,
  BugReport,
  Feedback,
  Close,
  Send,
  SmartToy,
  SupportAgent,
  NavigateNext,
  QuestionAnswer,
  Info,
  Security,
  Payment,
  AccountCircle,
  Work,
  HelpOutline,
  ContactSupport,
  Forum,
  Notifications,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const SupportPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [liveSupportOpen, setLiveSupportOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm SkillBot, your virtual assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date().toISOString(),
      suggestions: [
        "How do I create a skill listing?",
        "How to send a proposal?",
        "Payment and billing questions",
        "Account verification help"
      ]
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // FAQ Categories
  const categories = [
    { id: 'all', name: 'All Categories', icon: HelpOutline, count: 42 },
    { id: 'getting-started', name: 'Getting Started', icon: School, count: 8 },
    { id: 'account', name: 'Account & Profile', icon: AccountCircle, count: 6 },
    { id: 'payments', name: 'Payments & Billing', icon: Payment, count: 7 },
    { id: 'projects', name: 'Projects & Orders', icon: Work, count: 9 },
    { id: 'security', name: 'Security & Safety', icon: Security, count: 5 },
    { id: 'technical', name: 'Technical Issues', icon: BugReport, count: 4 },
    { id: 'policies', name: 'Policies & Guidelines', icon: Info, count: 3 }
  ];

  // FAQ Data
  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: "How do I get started on SkillBridge?",
      answer: "Getting started is easy! First, create your account by clicking the 'Sign Up' button. Then, complete your profile with your skills, experience, and portfolio. If you're a provider, you can create skill listings. If you're a client, you can browse skills or post project requests.",
      tags: ["beginner", "signup", "profile"],
      helpful: 245,
      views: 1205
    },
    {
      id: 2,
      category: 'getting-started',
      question: "What's the difference between a skill listing and a project request?",
      answer: "A skill listing is created by providers to showcase their services with fixed packages and pricing. A project request is posted by clients describing what they need, and providers can submit custom proposals with their own pricing and timeline.",
      tags: ["skills", "requests", "difference"],
      helpful: 189,
      views: 892
    },
    {
      id: 3,
      category: 'account',
      question: "How do I verify my account?",
      answer: "Account verification helps build trust on the platform. Go to your Profile Settings > Verification. You can verify your identity with a government ID, verify your skills with certificates, and verify your payment method. Verified accounts get a blue checkmark and better visibility.",
      tags: ["verification", "profile", "trust"],
      helpful: 156,
      views: 678
    },
    {
      id: 4,
      category: 'payments',
      question: "How does payment protection work?",
      answer: "SkillBridge uses escrow protection for all transactions. When a client pays for a project, the money is held securely until the work is completed and approved. This protects both parties - clients get their work delivered, and providers get paid for completed work.",
      tags: ["escrow", "protection", "payment"],
      helpful: 234,
      views: 1456
    },
    {
      id: 5,
      category: 'payments',
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards (Visa, MasterCard, American Express), PayPal, bank transfers, and cryptocurrency (Bitcoin, Ethereum). Payment processing is handled securely through our certified payment partners.",
      tags: ["payment methods", "credit card", "paypal"],
      helpful: 167,
      views: 945
    },
    {
      id: 6,
      category: 'projects',
      question: "How do I submit a proposal for a project?",
      answer: "Browse the Requests page, find a project that matches your skills, and click 'Send Proposal'. You'll go through a 4-step process: review project details, write your proposal, set your budget and timeline, then review and submit. Make sure to personalize your proposal and address the client's specific needs.",
      tags: ["proposals", "projects", "bidding"],
      helpful: 198,
      views: 1123
    },
    {
      id: 7,
      category: 'projects',
      question: "What happens after I submit a proposal?",
      answer: "After submission, the client will review all proposals and may ask questions or request additional information. If selected, you'll receive a notification and can begin working. Payment is held in escrow until project completion. You can track proposal status in your Provider Dashboard.",
      tags: ["proposal status", "workflow", "dashboard"],
      helpful: 134,
      views: 756
    },
    {
      id: 8,
      category: 'security',
      question: "Is my personal information safe?",
      answer: "Yes, we take security seriously. We use enterprise-grade encryption, secure data centers, and follow industry best practices. We never share your personal information with third parties without your consent. Read our Privacy Policy for full details.",
      tags: ["privacy", "security", "data protection"],
      helpful: 201,
      views: 1034
    },
    {
      id: 9,
      category: 'technical',
      question: "I'm having trouble uploading files. What should I do?",
      answer: "File upload issues are usually due to file size or format restrictions. Make sure your files are under 50MB and in supported formats (JPG, PNG, PDF, DOC, etc.). Try using a different browser or clearing your cache. If problems persist, contact our technical support team.",
      tags: ["file upload", "technical", "troubleshooting"],
      helpful: 89,
      views: 456
    },
    {
      id: 10,
      category: 'policies',
      question: "What is your refund policy?",
      answer: "Refunds depend on the project stage. If work hasn't started, full refunds are available. For ongoing projects, refunds are based on completed milestones. Disputes are handled through our resolution center with mediation services. See our Terms of Service for complete refund terms.",
      tags: ["refund", "policy", "disputes"],
      helpful: 156,
      views: 823
    }
  ];

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Chatbot functionality
  const handleSendMessage = (messageText = newMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(messageText);
      setChatMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    let response = {
      id: Date.now() + 1,
      text: "",
      sender: "bot",
      timestamp: new Date().toISOString(),
      suggestions: []
    };

    if (message.includes('skill') && message.includes('create')) {
      response.text = "To create a skill listing: 1) Go to your Provider Dashboard, 2) Click 'Create New Skill', 3) Fill in your service details, pricing, and portfolio, 4) Submit for review. Your skill will be live within 24 hours!";
      response.suggestions = ["How to optimize my skill listing?", "What makes a good skill description?", "Pricing strategies"];
    } else if (message.includes('proposal')) {
      response.text = "To send a proposal: 1) Browse the Requests page, 2) Find a matching project, 3) Click 'Send Proposal', 4) Complete the 4-step wizard with your cover letter, experience, budget, and timeline. Make it personal and address their specific needs!";
      response.suggestions = ["How to write a winning proposal?", "What should I include in my cover letter?", "How to set competitive pricing?"];
    } else if (message.includes('payment') || message.includes('money')) {
      response.text = "Payments are secure with escrow protection! Clients pay upfront, money is held safely, and released to you when work is completed and approved. We support credit cards, PayPal, bank transfers, and crypto. Processing takes 1-3 business days.";
      response.suggestions = ["How does escrow work?", "Payment methods available", "When do I get paid?"];
    } else if (message.includes('verification') || message.includes('verify')) {
      response.text = "Account verification builds trust and improves visibility! You can verify your identity (government ID), skills (certificates), and payment method. Go to Profile Settings > Verification to get started. Verified accounts get a blue checkmark!";
      response.suggestions = ["What documents do I need?", "How long does verification take?", "Benefits of verification"];
    } else if (message.includes('hello') || message.includes('hi')) {
      response.text = "Hello! I'm here to help you with any questions about SkillBridge. Whether you're just getting started, need help with projects, or have technical questions, I'm here to assist!";
      response.suggestions = ["Getting started guide", "How to find projects", "Account settings", "Contact live support"];
    } else {
      response.text = "I'm not sure about that specific question, but I can help you with common topics like creating skills, sending proposals, payments, and account settings. Would you like me to connect you with our live support team for personalized help?";
      response.suggestions = ["Talk to live support", "Browse FAQ", "Getting started guide", "Contact information"];
    }

    return response;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Support options
  const supportOptions = [
    {
      title: "Live Chat Support",
      description: "Get instant help from our support team",
      icon: ChatBubble,
      action: () => setLiveSupportOpen(true),
      available: "24/7",
      color: "primary"
    },
    {
      title: "AI Assistant",
      description: "Quick answers from our smart chatbot",
      icon: SmartToy,
      action: () => setChatbotOpen(true),
      available: "Always",
      color: "secondary"
    },
    {
      title: "Email Support",
      description: "Detailed help via email",
      icon: Email,
      action: () => window.location.href = "mailto:support@skillbridge.com",
      available: "24h response",
      color: "info"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our team",
      icon: Phone,
      action: () => window.location.href = "tel:+1-555-SKILL-BR",
      available: "Mon-Fri 9-6",
      color: "success"
    }
  ];

  const ChatbotDialog = () => (
    <Dialog
      open={chatbotOpen}
      onClose={() => setChatbotOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <SmartToy />
          </Avatar>
          <Box>
            <Typography variant="h6">SkillBot Assistant</Typography>
            <Typography variant="caption" color="text.secondary">
              Powered by AI • Always available
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={() => setChatbotOpen(false)}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
        <Box sx={{ p: 2 }}>
          {chatMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '80%',
                    backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    borderTopLeftRadius: message.sender === 'user' ? 2 : 0.5,
                    borderTopRightRadius: message.sender === 'user' ? 0.5 : 2,
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                </Paper>
              </Box>

              {message.suggestions && message.suggestions.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, ml: 1 }}>
                  {message.suggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => handleSendMessage(suggestion)}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                <SmartToy sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                SkillBot is typing...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="Ask me anything..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => handleSendMessage()} disabled={!newMessage.trim()}>
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link color="inherit" href="/" sx={{ textDecoration: 'none' }}>
          Home
        </Link>
        <Typography color="text.primary">Support & Help Center</Typography>
      </Breadcrumbs>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #000080 0%, #3333FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            How can we help you?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Find answers, get support, and learn how to make the most of SkillBridge
          </Typography>

          {/* Search Bar */}
          <Paper 
            elevation={2} 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto', 
              p: 1,
              borderRadius: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
            }}
          >
            <TextField
              fullWidth
              placeholder="Search for help articles, guides, or ask a question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, '& fieldset': { border: 'none' } }
              }}
            />
          </Paper>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {/* Support Options */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Get Support
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {supportOptions.map((option, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': { boxShadow: 6 }
                      }}
                      onClick={option.action}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Box 
                          sx={{ 
                            width: 64, 
                            height: 64, 
                            borderRadius: '50%', 
                            backgroundColor: `${option.color}.100`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          <option.icon sx={{ fontSize: 32, color: `${option.color}.main` }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {option.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {option.description}
                        </Typography>
                        <Chip 
                          label={option.available} 
                          size="small" 
                          color={option.color}
                          variant="outlined"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Grid>

        {/* FAQ Section */}
        <Grid item xs={12} md={3}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Browse by Category
              </Typography>
              <List dense>
                {categories.map((category) => (
                  <ListItem
                    key={category.id}
                    button
                    selected={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.50',
                        '&:hover': { backgroundColor: 'primary.100' }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <category.icon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={category.name}
                      secondary={`${category.count} articles`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Frequently Asked Questions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredFAQs.length} articles found
              </Typography>
            </Box>

            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <HelpOutline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No articles found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Try adjusting your search terms or browse different categories
                  </Typography>
                  <Button variant="outlined" onClick={() => setChatbotOpen(true)}>
                    Ask SkillBot
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box>
                {filteredFAQs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Accordion sx={{ mb: 1, '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {faq.question}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {faq.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
                          {faq.answer}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              👍 {faq.helpful} found this helpful
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              👁️ {faq.views} views
                            </Typography>
                          </Box>
                          <Button size="small" onClick={() => setChatbotOpen(true)}>
                            Ask Follow-up
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </motion.div>
                ))}
              </Box>
            )}
          </motion.div>
        </Grid>
      </Grid>

      {/* Still Need Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Paper 
          sx={{ 
            p: 6, 
            mt: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Still need help?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Our support team is here to help you succeed
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<ChatBubble />}
              onClick={() => setLiveSupportOpen(true)}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Live Chat
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<SmartToy />}
              onClick={() => setChatbotOpen(true)}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              AI Assistant
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Floating Chatbot Button */}
      <Fab
        color="primary"
        onClick={() => setChatbotOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          boxShadow: 6,
          '&:hover': { transform: 'scale(1.1)' }
        }}
      >
        <Badge badgeContent="AI" color="secondary">
          <SmartToy />
        </Badge>
      </Fab>

      {/* Chatbot Dialog */}
      <ChatbotDialog />

      {/* Live Support Dialog */}
      <Dialog
        open={liveSupportOpen}
        onClose={() => setLiveSupportOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Live Support</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Connect with our support team for personalized assistance
          </Alert>
          
          <Typography variant="h6" gutterBottom>Contact Options:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><ChatBubble color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Live Chat" 
                secondary="Average response time: 2 minutes • Available 24/7"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Email color="info" /></ListItemIcon>
              <ListItemText 
                primary="Email Support" 
                secondary="support@skillbridge.com • Response within 24 hours"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Phone color="success" /></ListItemIcon>
              <ListItemText 
                primary="Phone Support" 
                secondary="+1-555-SKILL-BR • Mon-Fri 9AM-6PM EST"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLiveSupportOpen(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<ChatBubble />}>
            Start Live Chat
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupportPage;



