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
import { Text, TextInput, Button, Card, RadioButton, Checkbox } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { colors, gradients } from '../../theme/colors';

const RegisterScreen = ({ onNavigateToLogin }) => {
  const { register, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'customer',
    phone: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const { confirmPassword, acceptTerms, ...submitData } = formData;
    
    const result = await register(submitData);
    
    if (result.success) {
      // Navigation will happen automatically via AuthContext state change
      // No manual navigation needed - AppNavigator will show MainTabs when isAuthenticated becomes true
    }
  };

  const handleGoogleRegister = () => {
    Alert.alert('Coming Soon', 'Google registration will be available soon');
  };

  const handleFacebookRegister = () => {
    Alert.alert('Coming Soon', 'Facebook registration will be available soon');
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
                  Join SkillBridge
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                  Create your account and start connecting
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

              {/* Name Fields */}
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <TextInput
                    label="First Name"
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    error={!!formErrors.firstName}
                    mode="outlined"
                    autoCapitalize="words"
                    left={<TextInput.Icon icon="account" />}
                    style={styles.input}
                    outlineColor={formErrors.firstName ? colors.error.main : colors.divider}
                    activeOutlineColor={colors.primary.main}
                  />
                  {formErrors.firstName && (
                    <Text style={styles.errorHelperText}>{formErrors.firstName}</Text>
                  )}
                </View>
                
                <View style={styles.nameField}>
                  <TextInput
                    label="Last Name"
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    error={!!formErrors.lastName}
                    mode="outlined"
                    autoCapitalize="words"
                    style={styles.input}
                    outlineColor={formErrors.lastName ? colors.error.main : colors.divider}
                    activeOutlineColor={colors.primary.main}
                  />
                  {formErrors.lastName && (
                    <Text style={styles.errorHelperText}>{formErrors.lastName}</Text>
                  )}
                </View>
              </View>

              {/* Email Field */}
              <TextInput
                label="Email Address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                error={!!formErrors.email}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
                outlineColor={formErrors.email ? colors.error.main : colors.divider}
                activeOutlineColor={colors.primary.main}
              />
              {formErrors.email && (
                <Text style={styles.errorHelperText}>{formErrors.email}</Text>
              )}

              {/* Phone Field */}
              <TextInput
                label="Phone Number (Optional)"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                mode="outlined"
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                style={styles.input}
                outlineColor={colors.divider}
                activeOutlineColor={colors.primary.main}
              />

              {/* User Type Selection */}
              <View style={styles.userTypeContainer}>
                <Text style={styles.userTypeLabel}>I want to:</Text>
                <RadioButton.Group
                  onValueChange={(value) => handleInputChange('userType', value)}
                  value={formData.userType}
                >
                  <RadioButton.Item
                    label="Hire skilled professionals"
                    value="customer"
                    style={styles.radioItem}
                    labelStyle={styles.radioLabel}
                    color={colors.primary.main}
                  />
                  <RadioButton.Item
                    label="Offer my services"
                    value="provider"
                    style={styles.radioItem}
                    labelStyle={styles.radioLabel}
                    color={colors.primary.main}
                  />
                  <RadioButton.Item
                    label="Both"
                    value="both"
                    style={styles.radioItem}
                    labelStyle={styles.radioLabel}
                    color={colors.primary.main}
                  />
                </RadioButton.Group>
              </View>

              {/* Password Fields */}
              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                error={!!formErrors.password}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="password-new"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                outlineColor={formErrors.password ? colors.error.main : colors.divider}
                activeOutlineColor={colors.primary.main}
              />
              {formErrors.password && (
                <Text style={styles.errorHelperText}>{formErrors.password}</Text>
              )}

              <TextInput
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                error={!!formErrors.confirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
                outlineColor={formErrors.confirmPassword ? colors.error.main : colors.divider}
                activeOutlineColor={colors.primary.main}
              />
              {formErrors.confirmPassword && (
                <Text style={styles.errorHelperText}>{formErrors.confirmPassword}</Text>
              )}

              {/* Terms and Conditions */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => handleInputChange('acceptTerms', !formData.acceptTerms)}
                activeOpacity={0.7}
              >
                <Checkbox
                  status={formData.acceptTerms ? 'checked' : 'unchecked'}
                  onPress={() => handleInputChange('acceptTerms', !formData.acceptTerms)}
                  color={colors.primary.main}
                />
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {formErrors.acceptTerms && (
                <Text style={styles.errorHelperText}>{formErrors.acceptTerms}</Text>
              )}

              {/* Submit Button */}
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
                    style={styles.registerButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    buttonColor="transparent"
                    textColor="#FFFFFF"
                  >
                    Create Account
                  </Button>
                </LinearGradient>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.divider} />
              </View>

              {/* Social Registration */}
              <View style={styles.socialButtonsContainer}>
                <Button
                  mode="outlined"
                  onPress={handleGoogleRegister}
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
                  onPress={handleFacebookRegister}
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

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>
                  Already have an account?{' '}
                  <Text
                    style={styles.signInLink}
                    onPress={() => onNavigateToLogin && onNavigateToLogin()}
                  >
                    Sign in here
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
    padding: 20,
    paddingVertical: 40,
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  nameField: {
    flex: 1,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  userTypeContainer: {
    marginBottom: 20,
    backgroundColor: colors.background.default,
    borderRadius: 12,
    padding: 16,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text.primary,
  },
  radioItem: {
    marginBottom: 4,
    borderRadius: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.text.primary,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    marginLeft: 8,
  },
  termsLink: {
    color: colors.primary.main,
    fontWeight: '600',
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
  registerButton: {
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
  signInContainer: {
    alignItems: 'center',
  },
  signInText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  signInLink: {
    color: colors.primary.main,
    fontWeight: '600',
  },
});

export default RegisterScreen;
