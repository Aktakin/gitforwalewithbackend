import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator, Chip, Avatar, Divider, Checkbox } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformRequest, formatTimeAgo, formatDeadline } from '../utils/dataTransform';
import { colors } from '../theme/colors';

const CreateProposalScreen = ({ route, navigation, onClose }) => {
  const { requestId } = route?.params || {};
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    timeline: '',
    budget: '',
    budgetType: 'fixed',
    experience: '',
    portfolio: '',
    questions: '',
    availability: 'full-time',
    agreedToTerms: false,
  });

  const steps = ['Project Details', 'Your Proposal', 'Budget & Timeline', 'Review'];

  useEffect(() => {
    const fetchRequestData = async () => {
      if (!requestId) {
        setError('Request ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);


        const dbRequest = await db.requests.getById(requestId);
        if (!dbRequest) {
          setError('Request not found');
          setLoading(false);
          return;
        }

        const transformedRequest = transformRequest(dbRequest);
        const client = transformedRequest.user || transformedRequest.customer;

        const formattedRequest = {
          id: transformedRequest.id,
          title: transformedRequest.title,
          description: transformedRequest.description || 'No description provided',
          category: transformedRequest.category,
          budget: transformedRequest.budget || { min: 0, max: 0, type: 'fixed' },
          deadline: transformedRequest.deadline ? formatDeadline(transformedRequest.deadline) : 'No deadline',
          skills: transformedRequest.tags || [],
          proposals: transformedRequest.proposals || 0,
          urgency: transformedRequest.urgency || 'medium',
          requirements: transformedRequest.requirements || [],
          postedTime: formatTimeAgo(transformedRequest.createdAt),
          client: client ? {
            name: client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email,
            avatar: client.avatar || client.profilePicture,
            verified: client.isVerified || false,
            location: client.location?.city && client.location?.state
              ? `${client.location.city}, ${client.location.state}`
              : client.location?.country || 'Location not specified'
          } : null
        };

        // Set default budget
        if (formattedRequest.budget.min && formattedRequest.budget.max) {
          setProposalData(prev => ({
            ...prev,
            budget: Math.floor((formattedRequest.budget.min + formattedRequest.budget.max) / 2).toString()
          }));
        }

        setRequestData(formattedRequest);

        // Check for existing proposal
        if (user?.id) {
          try {
            const userProposals = await db.proposals.getUserProposals(user.id);
            const existing = userProposals.find(p => p.request_id === requestId || p.requestId === requestId);
            if (existing) {
              Alert.alert('Already Submitted', 'You have already submitted a proposal for this request.');
              navigation?.goBack();
              return;
            }
          } catch (err) {
            console.warn('Error checking existing proposal:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching request data:', err);
        setError(err.message || 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestData();
  }, [requestId, user?.id]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      navigation?.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Login Required', 'Please log in to submit a proposal');
      return;
    }

    if (!proposalData.coverLetter.trim()) {
      Alert.alert('Validation Error', 'Please provide a cover letter');
      setActiveStep(1);
      return;
    }

    if (!proposalData.budget || parseFloat(proposalData.budget) <= 0) {
      Alert.alert('Validation Error', 'Please provide a valid budget');
      setActiveStep(2);
      return;
    }

    if (!proposalData.timeline.trim()) {
      Alert.alert('Validation Error', 'Please provide a timeline');
      setActiveStep(2);
      return;
    }

    if (!proposalData.agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions');
      return;
    }

    try {
      setSubmitting(true);

      const proposalToSubmit = {
        request_id: requestId,
        user_id: user.id,
        message: proposalData.coverLetter,
        proposed_price: parseFloat(proposalData.budget),
        estimated_duration: proposalData.timeline,
        status: 'pending'
      };

      await db.proposals.create(proposalToSubmit);

      Alert.alert('Success', '🎉 Proposal submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation?.goBack();
            onClose?.();
          }
        }
      ]);
    } catch (error) {
      console.error('Error submitting proposal:', error);
      Alert.alert('Error', `Failed to submit proposal: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }

  if (error || !requestData) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error?.main || '#f44336'} />
        <Text style={styles.errorText}>{error || 'Request not found'}</Text>
        <Button mode="contained" onPress={() => navigation?.goBack() || onClose?.()}>
          Go Back
        </Button>
      </View>
    );
  }

  const formatBudget = (budget) => {
    if (!budget || !budget.min || !budget.max) return 'Not specified';
    return `$${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}`;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Project Details
        return (
          <View>
            <Text style={styles.stepTitle}>Project Overview</Text>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.requestTitle}>{requestData.title}</Text>
                {requestData.client && (
                  <View style={styles.clientInfo}>
                    <Avatar.Image size={48} source={{ uri: requestData.client.avatar }} />
                    <View style={styles.clientDetails}>
                      <View style={styles.clientNameRow}>
                        <Text style={styles.clientName}>{requestData.client.name}</Text>
                        {requestData.client.verified && (
                          <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary.main} />
                        )}
                      </View>
                      {requestData.client.location && (
                        <Text style={styles.clientLocation}>{requestData.client.location}</Text>
                      )}
                    </View>
                  </View>
                )}
                <Text style={styles.description}>{requestData.description}</Text>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="currency-usd" size={20} color={colors.primary.main} />
                  <Text style={styles.infoText}>Budget: {formatBudget(requestData.budget)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.primary.main} />
                  <Text style={styles.infoText}>Deadline: {requestData.deadline}</Text>
                </View>
                {requestData.skills && requestData.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    <Text style={styles.sectionLabel}>Required Skills:</Text>
                    <View style={styles.chipsContainer}>
                      {requestData.skills.map((skill, index) => (
                        <Chip key={index} style={styles.chip} textStyle={styles.chipText}>
                          {skill}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
                <View style={styles.alertBox}>
                  <MaterialCommunityIcons name="information" size={20} color={colors.primary.main} />
                  <Text style={styles.alertText}>
                    This project has received {requestData.proposals} proposals so far.
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        );

      case 1: // Your Proposal
        return (
          <View>
            <Text style={styles.stepTitle}>Craft Your Proposal</Text>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.fieldLabel}>Cover Letter *</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={8}
                  placeholder="Introduce yourself and explain why you're the perfect fit..."
                  value={proposalData.coverLetter}
                  onChangeText={(text) => setProposalData(prev => ({ ...prev, coverLetter: text }))}
                  style={styles.textInput}
                />
                <Text style={styles.fieldLabel}>Relevant Experience</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your relevant experience..."
                  value={proposalData.experience}
                  onChangeText={(text) => setProposalData(prev => ({ ...prev, experience: text }))}
                  style={styles.textInput}
                />
                <Text style={styles.fieldLabel}>Portfolio Links (Optional)</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Share links to your relevant work..."
                  value={proposalData.portfolio}
                  onChangeText={(text) => setProposalData(prev => ({ ...prev, portfolio: text }))}
                  style={styles.textInput}
                />
                <Text style={styles.fieldLabel}>Questions for the Client</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  placeholder="Ask any clarifying questions..."
                  value={proposalData.questions}
                  onChangeText={(text) => setProposalData(prev => ({ ...prev, questions: text }))}
                  style={styles.textInput}
                />
              </Card.Content>
            </Card>
          </View>
        );

      case 2: // Budget & Timeline
        return (
          <View>
            <Text style={styles.stepTitle}>Budget & Timeline</Text>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.fieldLabel}>Your Budget *</Text>
                <View style={styles.budgetRow}>
                  <TextInput
                    mode="outlined"
                    label="Amount"
                    keyboardType="numeric"
                    value={proposalData.budget}
                    onChangeText={(text) => setProposalData(prev => ({ ...prev, budget: text }))}
                    style={styles.budgetInput}
                    left={<TextInput.Affix text="$" />}
                  />
                </View>
                <Text style={styles.hintText}>
                  Client's budget: {formatBudget(requestData.budget)}
                </Text>
                <Text style={styles.fieldLabel}>Timeline *</Text>
                <TextInput
                  mode="outlined"
                  placeholder="e.g., 6 weeks, 2 months"
                  value={proposalData.timeline}
                  onChangeText={(text) => setProposalData(prev => ({ ...prev, timeline: text }))}
                  style={styles.textInput}
                />
              </Card.Content>
            </Card>
          </View>
        );

      case 3: // Review
        return (
          <View>
            <Text style={styles.stepTitle}>Review Your Proposal</Text>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.reviewLabel}>Cover Letter:</Text>
                <Text style={styles.reviewText}>{proposalData.coverLetter || 'Not provided'}</Text>
                <Divider style={styles.divider} />
                <Text style={styles.reviewLabel}>Budget:</Text>
                <Text style={styles.reviewText}>${proposalData.budget || 'Not provided'}</Text>
                <Divider style={styles.divider} />
                <Text style={styles.reviewLabel}>Timeline:</Text>
                <Text style={styles.reviewText}>{proposalData.timeline || 'Not provided'}</Text>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={proposalData.agreedToTerms ? 'checked' : 'unchecked'}
                    onPress={() => setProposalData(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }))}
                  />
                  <Text style={styles.checkboxLabel}>
                    I agree to the terms and conditions *
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.main, colors.primary.dark]} style={styles.header}>
        <View style={styles.headerContent}>
          <Button
            mode="text"
            onPress={handleBack}
            textColor="#FFFFFF"
            icon="arrow-left"
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Text style={styles.headerTitle}>Submit Proposal</Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepIndicator}>
              <View
                style={[
                  styles.stepDot,
                  index === activeStep && styles.stepDotActive,
                  index < activeStep && styles.stepDotCompleted
                ]}
              />
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    index < activeStep && styles.stepLineCompleted
                  ]}
                />
              )}
            </View>
          ))}
        </View>
        <Text style={styles.stepLabel}>{steps[activeStep]}</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {renderStepContent()}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleNext}
          loading={submitting}
          disabled={submitting}
          style={styles.submitButton}
          buttonColor={colors.primary.main}
          icon={activeStep === steps.length - 1 ? 'send' : 'arrow-right'}
        >
          {activeStep === steps.length - 1 ? 'Submit Proposal' : 'Next'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    fontSize: 16,
    color: colors.error?.main || '#f44336',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  stepDotActive: {
    backgroundColor: '#FFFFFF',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepDotCompleted: {
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  requestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  clientLocation: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  skillsContainer: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main + '15',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  alertText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetInput: {
    flex: 1,
  },
  hintText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 8,
  },
  reviewText: {
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    borderRadius: 12,
  },
});

export default CreateProposalScreen;

