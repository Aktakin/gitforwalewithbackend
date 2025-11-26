import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
        color: 'white',
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', md: '8rem' },
                fontWeight: 700,
                mb: 2,
                opacity: 0.9,
              }}
            >
              404
            </Typography>
            
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                mb: 2,
              }}
            >
              Page Not Found
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.8,
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              Sorry, the page you are looking for doesn't exist or has been moved.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/"
                startIcon={<Home />}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  px: 4,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                Go Home
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(-1)}
                startIcon={<ArrowBack />}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Go Back
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default NotFoundPage;



