import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();

  const footerLinks = {
    platform: [
      { label: 'How it Works', href: '/how-it-works' },
      { label: 'Browse Skills', href: '/skills' },
      { label: 'Browse Requests', href: '/requests' },
      { label: 'Success Stories', href: '/success-stories' },
    ],
    support: [
      { label: 'Help Center', href: '/support' },
      { label: 'Safety', href: '/safety' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Community Guidelines', href: '/guidelines' },
    ],
    business: [
      { label: 'For Businesses', href: '/business' },
      { label: 'Enterprise', href: '/enterprise' },
      { label: 'Partnerships', href: '/partnerships' },
      { label: 'Become a Partner', href: '/partner' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Intellectual Property', href: '/ip' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/skillbridge', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/skillbridge', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/skillbridge', label: 'Instagram' },
    { icon: LinkedIn, href: 'https://linkedin.com/company/skillbridge', label: 'LinkedIn' },
  ];

  const contactInfo = [
    { icon: Email, text: 'support@skillbridge.app', href: 'mailto:support@skillbridge.app' },
    { icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: LocationOn, text: 'San Francisco, CA, USA' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Box sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* Brand and Description */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: 'linear-gradient(135deg, #000080 0%, #3333FF 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                SkillBridge
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                The premier platform connecting skilled professionals with customers who need their expertise. 
                Find the right talent or showcase your skills to thousands of potential clients.
              </Typography>

              {/* Contact Information */}
              <Box sx={{ mb: 3 }}>
                {contactInfo.map((contact, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      color: 'text.secondary',
                    }}
                  >
                    <contact.icon sx={{ fontSize: 18, mr: 1 }} />
                    {contact.href ? (
                      <Link
                        href={contact.href}
                        color="inherit"
                        sx={{
                          textDecoration: 'none',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        <Typography variant="body2">{contact.text}</Typography>
                      </Link>
                    ) : (
                      <Typography variant="body2">{contact.text}</Typography>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Social Links */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'primary.light',
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <social.icon />
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Platform Links */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Platform
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.platform.map((link, index) => (
                  <Link
                    key={index}
                    component={RouterLink}
                    to={link.href}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Support Links */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.support.map((link, index) => (
                  <Link
                    key={index}
                    component={RouterLink}
                    to={link.href}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Business Links */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Business
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.business.map((link, index) => (
                  <Link
                    key={index}
                    component={RouterLink}
                    to={link.href}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Company Links */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.company.map((link, index) => (
                  <Link
                    key={index}
                    component={RouterLink}
                    to={link.href}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Bottom Footer */}
        <Box
          sx={{
            py: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} SkillBridge. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            {footerLinks.legal.map((link, index) => (
              <Link
                key={index}
                component={RouterLink}
                to={link.href}
                variant="body2"
                color="text.secondary"
                sx={{
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
