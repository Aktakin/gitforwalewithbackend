import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Avatar
} from '@mui/material';
import { 
  ExpandMore, 
  Help, 
  ChatBubble, 
  Email, 
  Phone,
  Search
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top right corner and fill out the registration form with your details.'
    },
    {
      question: 'How do I post a project?',
      answer: 'After logging in, click "Post a Project" and fill out the project details including description, budget, and timeline.'
    },
    {
      question: 'How does payment work?',
      answer: 'Payments are processed securely through our platform. Funds are held in escrow until project completion.'
    },
    {
      question: 'How do I find the right freelancer?',
      answer: 'Browse profiles, read reviews, and check portfolios. You can also post a project and receive proposals.'
    },
    {
      question: 'What if I\'m not satisfied with the work?',
      answer: 'We offer dispute resolution services. Contact our support team and we\'ll help mediate the situation.'
    },
    {
      question: 'How do I withdraw my earnings?',
      answer: 'Go to your account settings and set up your preferred payment method. Withdrawals are processed within 2-5 business days.'
    }
  ];

  const supportOptions = [
    {
      icon: <ChatBubble />,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      action: 'Start Chat',
      available: 'Available 24/7'
    },
    {
      icon: <Email />,
      title: 'Email Support',
      description: 'Send us an email and get a detailed response',
      action: 'Send Email',
      available: 'Response within 24hrs'
    },
    {
      icon: <Phone />,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      action: 'Call Now',
      available: 'Mon-Fri 9AM-6PM PST'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
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
            Help & Support
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Get the help you need to make the most of SkillBridge
          </Typography>
        </Box>
      </motion.div>

      {/* Support Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {supportOptions.map((option, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 4 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mx: 'auto', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}>
                    {option.icon}
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {option.description}
                  </Typography>
                  <Typography variant="caption" color="primary.main" sx={{ display: 'block', mb: 3 }}>
                    {option.available}
                  </Typography>
                  <Button variant="contained" fullWidth>
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            Frequently Asked Questions
          </Typography>
          
          {/* Search */}
          <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          {/* FAQ List */}
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {filteredFaqs.map((faq, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
            {filteredFaqs.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No results found for "{searchQuery}"
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try different keywords or contact our support team
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Still Need Help?
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Our support team is here to help you succeed
            </Typography>
            <Button variant="contained" color="secondary" size="large">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default SupportPage;


