// Responsive utility constants and helper functions
export const breakpoints = {
  xs: 0,     // Extra small devices (phones, 0-599px)
  sm: 600,   // Small devices (tablets, 600-959px)
  md: 960,   // Medium devices (small laptops, 960-1279px)
  lg: 1280,  // Large devices (desktops, 1280-1919px)
  xl: 1920,  // Extra large devices (large desktops, 1920px and up)
};

// Common responsive spacing patterns
export const responsiveSpacing = {
  container: {
    py: { xs: 2, sm: 3, md: 4 },
    px: { xs: 2, sm: 3, md: 4 },
  },
  section: {
    mb: { xs: 2, sm: 3, md: 4 },
  },
  card: {
    p: { xs: 2, sm: 2.5, md: 3 },
  },
  grid: {
    spacing: { xs: 2, sm: 2.5, md: 3 },
  },
};

// Responsive typography variants
export const responsiveTypography = {
  h1: {
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
    lineHeight: { xs: 1.2, sm: 1.25, md: 1.3 },
  },
  h2: {
    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
    lineHeight: { xs: 1.2, sm: 1.25, md: 1.3 },
  },
  h3: {
    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' },
    lineHeight: { xs: 1.2, sm: 1.25, md: 1.3 },
  },
  h4: {
    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
    lineHeight: 1.3,
  },
  h5: {
    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
    lineHeight: 1.4,
  },
  h6: {
    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
    lineHeight: 1.4,
  },
  body1: {
    fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
  },
  body2: {
    fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' },
  },
};

// Responsive button sizes
export const responsiveButton = {
  small: {
    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
    padding: { xs: '4px 8px', sm: '5px 10px', md: '6px 12px' },
  },
  medium: {
    fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
    padding: { xs: '6px 12px', sm: '8px 16px', md: '10px 20px' },
  },
  large: {
    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
    padding: { xs: '8px 16px', sm: '10px 20px', md: '12px 24px' },
  },
};

// Hide/show based on breakpoints
export const displayHelpers = {
  hideOnMobile: { display: { xs: 'none', md: 'block' } },
  hideOnDesktop: { display: { xs: 'block', md: 'none' } },
  showOnMobile: { display: { xs: 'block', md: 'none' } },
  showOnDesktop: { display: { xs: 'none', md: 'block' } },
};

// Common flex patterns
export const flexPatterns = {
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
  },
  responsiveStack: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: { xs: 1, sm: 2, md: 3 },
  },
};

// Table responsive wrapper
export const tableResponsive = {
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
  },
};

// Mobile-friendly card
export const mobileCard = {
  borderRadius: { xs: 2, md: 3 },
  p: { xs: 2, sm: 2.5, md: 3 },
  mb: { xs: 2, sm: 2.5, md: 3 },
};

// Responsive grid container
export const responsiveGrid = (columns = { xs: 12, sm: 6, md: 4, lg: 3 }) => ({
  item: true,
  xs: columns.xs || 12,
  sm: columns.sm || 6,
  md: columns.md || 4,
  lg: columns.lg || 3,
  xl: columns.xl || columns.lg || 3,
});

export default {
  breakpoints,
  responsiveSpacing,
  responsiveTypography,
  responsiveButton,
  displayHelpers,
  flexPatterns,
  tableResponsive,
  mobileCard,
  responsiveGrid,
};


