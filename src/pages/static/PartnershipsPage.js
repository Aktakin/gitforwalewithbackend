import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Avatar } from '@mui/material';
import { Handshake, TrendingUp, Group, Business } from '@mui/icons-material';
import { motion } from 'framer-motion';

const PartnershipsPage = () => {
  const partnerTypes = [
    {
      icon: <Business />,
      title: 'Technology Partners',
      description: 'Integrate SkillBridge into your platform and offer our services to your users.',
      benefits: ['Revenue sharing', 'Technical support', 'Co-marketing opportunities']
    },
    {
      icon: <Group />,
      title: 'Referral Partners',
      description: 'Refer businesses to SkillBridge and earn commission on successful projects.',
      benefits: ['Up to 20% commission', 'Marketing materials', 'Dedicated support']
    },
    {
      icon: <TrendingUp />,
      title: 'Strategic Partners',
      description: 'Long-term partnerships for mutual growth and market expansion.',
      benefits: ['Joint ventures', 'Exclusive territories', 'Priority support']
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
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
            Partnerships
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            Partner with SkillBridge to grow your business and provide value to your customers.
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        {partnerTypes.map((partner, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 4 }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  mx: 'auto', 
                  mb: 3,
                  width: 64,
                  height: 64
                }}>
                  {partner.icon}
                </Avatar>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {partner.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {partner.description}
                </Typography>
                <Box component="ul" sx={{ textAlign: 'left', pl: 2 }}>
                  {partner.benefits.map((benefit, i) => (
                    <Typography component="li" variant="body2" key={i} sx={{ mb: 1 }}>
                      {benefit}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <CardContent sx={{ p: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Partner?
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Let's explore how we can work together
          </Typography>
          <Button variant="contained" color="secondary" size="large">
            Contact Partnerships Team
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PartnershipsPage;


