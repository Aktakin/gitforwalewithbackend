import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Custom hook for responsive design
 * Provides easy-to-use breakpoint checks
 */
export const useResponsive = () => {
  const theme = useTheme();

  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')), // < 600px
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')), // 600-959px
    isDesktop: useMediaQuery(theme.breakpoints.up('md')), // >= 960px
    isLargeDesktop: useMediaQuery(theme.breakpoints.up('lg')), // >= 1280px
    isXL: useMediaQuery(theme.breakpoints.up('xl')), // >= 1920px
    
    // Specific size checks
    isSmallMobile: useMediaQuery(theme.breakpoints.down(400)),
    isSmallScreen: useMediaQuery(theme.breakpoints.down('md')),
    
    // For conditional rendering
    onlyMobile: useMediaQuery(theme.breakpoints.only('xs')),
    onlyTablet: useMediaQuery(theme.breakpoints.only('sm')),
    onlyDesktop: useMediaQuery(theme.breakpoints.only('md')),
    
    // Orientation
    isPortrait: useMediaQuery('(orientation: portrait)'),
    isLandscape: useMediaQuery('(orientation: landscape)'),
  };
};

export default useResponsive;


