import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

const TermsPage = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: `By accessing and using SkillBridge, you accept and agree to be bound by the terms and 
      provision of this agreement. If you do not agree to abide by these terms, please do not use 
      this service.`
    },
    {
      title: 'Use License',
      content: `Permission is granted to temporarily use SkillBridge for personal, non-commercial 
      transitory viewing only. This is the grant of a license, not a transfer of title, and under 
      this license you may not modify or copy the materials.`
    },
    {
      title: 'User Accounts',
      content: `When you create an account with us, you must provide information that is accurate, 
      complete, and current at all times. You are responsible for safeguarding the password and 
      for all activities that occur under your account.`
    },
    {
      title: 'Service Rules',
      content: `Users must not use the service for any unlawful purpose or to solicit others to perform 
      unlawful acts. Users must not violate any local, state, national, or international law or 
      regulation.`
    },
    {
      title: 'Payment Terms',
      content: `All payments made through SkillBridge are subject to our payment processing terms. 
      We reserve the right to refuse or cancel any order at any time for any reason.`
    },
    {
      title: 'Intellectual Property',
      content: `The service and its original content, features, and functionality are and will remain 
      the exclusive property of SkillBridge and its licensors. The service is protected by copyright, 
      trademark, and other laws.`
    },
    {
      title: 'Termination',
      content: `We may terminate or suspend your account and bar access to the service immediately, 
      without prior notice or liability, under our sole discretion, for any reason whatsoever 
      including breach of the Terms.`
    },
    {
      title: 'Limitation of Liability',
      content: `In no event shall SkillBridge, nor its directors, employees, partners, agents, suppliers, 
      or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.`
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
            Terms of Service
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
              Welcome to SkillBridge. These terms and conditions outline the rules and regulations 
              for the use of SkillBridge's website and services. By using this platform, you accept 
              these terms and conditions in full.
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
                {index + 1}. {section.title}
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
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Questions?
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                legal@skillbridge.app
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default TermsPage;


