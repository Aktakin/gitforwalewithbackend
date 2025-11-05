import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const SearchPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Results
        </Typography>
        <Typography variant="body1">
          Search functionality coming soon! This page is under construction.
        </Typography>
      </Box>
    </Container>
  );
};

export default SearchPage;



