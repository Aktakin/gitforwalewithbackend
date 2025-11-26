import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { colors, gradients } from '../../theme/colors';

const LoginScreen = ({ onNavigateToRegister, onNavigateToForgotPassword }) => {
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    // MOBILE APP: Allow any username/password - no validation needed
    const errors = {};
    
    if (!formData.email && !formData.password) {
      errors.email = 'Please enter username';
      errors.password = 'Please enter password';
    }
    
    setFormErrors(errors);
    // Allow login if either field has content (mobile app bypass)
    return formData.email || formData.password;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Navigation will happen automatically via AuthContext state change
      // No manual navigation needed - AppNavigator will show MainTabs when isAuthenticated becomes true
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Coming Soon', 'Google login will be available soon');
  };

  const handleFacebookLogin = () => {
    Alert.alert('Coming Soon', 'Facebook login will be available soon');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <Card style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <Text variant="headlineLarge" style={styles.title}>
                  Welcome Back
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                  Sign in to your SkillBridge account
                </Text>
              </View>

              {/* Error Alert */}
              {error && (
                <Card style={styles.errorCard}>
                  <Card.Content>
                    <Text style={styles.errorText}>{error}</Text>
                  </Card.Content>
                </Card>
              )}

              {/* Username Input */}
              <TextInput
                label="Username"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                error={!!formErrors.email}
                mode="outlined"
                keyboardType="default"
                autoCapitalize="none"
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={formErrors.email ? colors.error.main : colors.divider}
                activeOutlineColor={colors.primary.main}
              />
              {formErrors.email && (
                <Text style={styles.errorHelperText}>{formErrors.email}</Text>
              )}

              {/* Password Input */}
              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                error={!!formErrors.password}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="password"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={formErrors.password ? colors.error.main : colors.divider}
                activeOutlineColor={colors.primary.main}
              />
              {formErrors.password && (
                <Text style={styles.errorHelperText}>{formErrors.password}</Text>
              )}

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={() => onNavigateToForgotPassword && onNavigateToForgotPassword()}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <View style={styles.buttonContainer}>
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    buttonColor="transparent"
                    textColor="#FFFFFF"
                  >
                    Sign In
                  </Button>
                </LinearGradient>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.divider} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialButtonsContainer}>
                <Button
                  mode="outlined"
                  onPress={handleGoogleLogin}
                  icon="google"
                  style={styles.socialButton}
                  contentStyle={styles.socialButtonContent}
                  labelStyle={styles.socialButtonLabel}
                  textColor={colors.text.primary}
                  borderColor={colors.divider}
                >
                  Google
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={handleFacebookLogin}
                  icon="facebook"
                  style={styles.socialButton}
                  contentStyle={styles.socialButtonContent}
                  labelStyle={styles.socialButtonLabel}
                  textColor={colors.text.primary}
                  borderColor={colors.divider}
                >
                  Facebook
                </Button>
              </View>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>
                  Don't have an account?{' '}
                  <Text
                    style={styles.signUpLink}
                    onPress={() => onNavigateToRegister && onNavigateToRegister()}
                  >
                    Sign up here
                  </Text>
                </Text>
              </View>
            </Card>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    fontSize: 32,
    color: colors.primary.main,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: colors.error.light,
    marginBottom: 20,
    borderRadius: 12,
  },
  errorText: {
    color: colors.error.contrastText,
    fontSize: 14,
  },
  errorHelperText: {
    color: colors.error.main,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 16,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  inputContent: {
    backgroundColor: 'transparent',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gradientButton: {
    borderRadius: 12,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.text.secondary,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    borderColor: colors.divider,
    borderRadius: 12,
  },
  socialButtonContent: {
    paddingVertical: 10,
  },
  socialButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  signUpContainer: {
    alignItems: 'center',
  },
  signUpText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  signUpLink: {
    color: colors.primary.main,
    fontWeight: '600',
  },
});

export default LoginScreen;
