import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';

const fontConfig = {
  fontFamily: 'System',
};

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.light,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.light,
    tertiary: colors.info.main,
    error: colors.error.main,
    errorContainer: colors.error.light,
    surface: colors.background.paper,
    surfaceVariant: colors.background.default,
    background: colors.background.default,
    onPrimary: colors.primary.contrastText,
    onSecondary: colors.secondary.contrastText,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    outline: colors.divider,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};

export default paperTheme;
