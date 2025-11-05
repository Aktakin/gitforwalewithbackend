import React from 'react';
import { Container, Typography, Box, Card, CardContent, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
  const sections = [
    {
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, 
      update your profile, or communicate with us. This includes your name, email address, phone number, 
      professional information, and any other information you choose to provide.`
    },
    {
      title: 'How We Use Your Information',
      content: `We use the information we collect to provide, maintain, and improve our services, process 
      transactions, send you technical notices and support messages, and communicate with you about 
      products, services, and promotional offers.`
    },
    {
      title: 'Information Sharing',
      content: `We do not sell, trade, or otherwise transfer your personal information to third parties 
      without your consent, except as described in this policy. We may share your information with 
      service providers who assist us in operating our platform.`
    },
    {
      title: 'Data Security',
      content: `We implement appropriate security measures to protect your personal information against 
      unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
      over the internet is 100% secure.`
    },
    {
      title: 'Your Rights',
      content: `You have the right to access, update, or delete your personal information. You may also 
      opt out of certain communications from us. Contact us if you would like to exercise these rights.`
    },
    {
      title: 'Cookies',
      content: `We use cookies to enhance your experience, analyze usage patterns, and provide personalized 
      content. You can control cookie preferences through your browser settings.`
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Privacy Policy
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Last updated: January 2024
          </Typography>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
              At SkillBridge, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our platform. Please read this 
              privacy policy carefully.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {sections.map((section, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 * (index + 3) }}
        >
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                {section.title}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {section.content}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Contact Us
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                privacy@skillbridge.app
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default PrivacyPage;


