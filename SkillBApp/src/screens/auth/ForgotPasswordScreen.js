import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { colors, gradients } from '../../theme/colors';

const ForgotPasswordScreen = ({ onNavigateToLogin }) => {
  const { resetPassword, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
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
    
    if (success) {
      setSuccess(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const result = await resetPassword(formData.email);
    
    if (result.success) {
      setSuccess(true);
      setSubmittedEmail(formData.email);
      setFormData({ email: '' });
    }
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
                  Forgot Password?
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                  {success
                    ? 'Check your email for password reset instructions'
                    : "Enter your email address and we'll send you a link to reset your password"
                  }
                </Text>
              </View>

              {/* Success Alert */}
              {success && (
                <Card style={styles.successCard}>
                  <Card.Content>
                    <Text style={styles.successTitle}>Password reset email sent!</Text>
                    <Text style={styles.successText}>
                      We've sent a password reset link to <Text style={styles.emailText}>{submittedEmail}</Text>.
                      Please check your inbox and follow the instructions.
                    </Text>
                  </Card.Content>
                </Card>
              )}

              {/* Error Alert */}
              {error && !success && (
                <Card style={styles.errorCard}>
                  <Card.Content>
                    <Text style={styles.errorText}>{error}</Text>
                  </Card.Content>
                </Card>
              )}

              {/* Form */}
              {!success ? (
                <View style={styles.formContainer}>
                  <TextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    error={!!formErrors.email}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                    left={<TextInput.Icon icon="email" />}
                    style={styles.input}
                    outlineColor={formErrors.email ? colors.error.main : colors.divider}
                    activeOutlineColor={colors.primary.main}
                  />
                  {formErrors.email && (
                    <Text style={styles.errorHelperText}>{formErrors.email}</Text>
                  )}

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
                        style={styles.resetButton}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                        buttonColor="transparent"
                        textColor="#FFFFFF"
                      >
                        Send Reset Link
                      </Button>
                    </LinearGradient>
                  </View>

                  <TouchableOpacity
                    onPress={() => onNavigateToLogin && onNavigateToLogin()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.backButtonText}>← Back to Login</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.successContainer}>
                  <Button
                    mode="outlined"
                    onPress={() => onNavigateToLogin && onNavigateToLogin()}
                    style={styles.backButtonOutlined}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.backButtonLabel}
                    icon="arrow-left"
                    textColor={colors.primary.main}
                    borderColor={colors.primary.main}
                  >
                    Back to Login
                  </Button>
                </View>
              )}

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don't have an account?{' '}
                  <Text
                    style={styles.footerLink}
                    onPress={() => {}}
                  >
                    Sign up
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
    lineHeight: 24,
  },
  successCard: {
    backgroundColor: colors.success.light,
    marginBottom: 20,
    borderRadius: 12,
  },
  successTitle: {
    color: colors.success.contrastText,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  successText: {
    color: colors.success.contrastText,
    fontSize: 14,
    lineHeight: 20,
  },
  emailText: {
    fontWeight: '600',
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
  formContainer: {
    marginTop: 8,
  },
  input: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    marginBottom: 20,
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
  resetButton: {
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  backButtonOutlined: {
    borderColor: colors.primary.main,
    borderRadius: 12,
  },
  backButtonLabel: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary.main,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
