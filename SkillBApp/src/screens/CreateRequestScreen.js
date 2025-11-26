import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Text, TextInput, Button, Card, Chip, ActivityIndicator, Switch, Divider, List, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { colors } from '../theme/colors';
// Date picker will use native modal or text input

const { width } = Dimensions.get('window');

const categories = [
  'Woodworking & Carpentry',
  'Pottery & Ceramics',
  'Painting & Fine Arts',
  'Jewelry Making',
  'Textile & Fiber Arts',
  'Metalworking & Blacksmithing',
  'Glassblowing & Glasswork',
  'Leatherworking',
  'Stone Carving & Sculpture',
  'Bookbinding & Paper Arts',
  'Tailoring & Sewing',
  'Basketry & Wickerwork',
  'Weaving & Textiles',
  'Calligraphy & Hand Lettering',
  'Mosaics & Tile Work',
  'Printmaking',
  'Paper Crafts',
  'Quilting',
  'Embroidery & Needlework',
  'Knitting & Crochet',
  'Lace Making',
  'Rug Making',
  'Toy Making',
  'Musical Instrument Making',
  'Furniture Making',
  'Restoration & Conservation'
];

const urgencyLevels = [
  { value: 'low', label: 'Low Priority', description: 'No rush, flexible timeline', color: '#4caf50' },
  { value: 'medium', label: 'Medium Priority', description: 'Standard timeline expected', color: '#2196f3' },
  { value: 'high', label: 'High Priority', description: 'Need this completed soon', color: '#ff9800' },
  { value: 'urgent', label: 'Urgent', description: 'Critical timeline, ASAP', color: '#f44336' }
];

const budgetTypes = ['Fixed Price', 'Hourly Rate', 'Negotiable'];
const serviceTypes = [
  { value: 'remote', label: 'Remote Only', icon: 'home', description: 'Work can be done completely online' },
  { value: 'in-person', label: 'In-Person Only', icon: 'office-building', description: 'Physical presence required' },
  { value: 'both', label: 'Both Remote & In-Person', icon: 'earth', description: 'Open to either arrangement' }
];

const CreateRequestScreen = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    category: '',
    tags: [],
    projectSize: 'medium',
    
    // Budget & Timeline
    budget: {
      min: 100,
      max: 500,
      type: 'fixed',
      currency: 'USD'
    },
    deadline: null,
    urgency: 'medium',
    
    // Location & Service Type
    serviceType: 'both',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      radius: 50
    },
    
    // Requirements & Details
    requirements: [],
    preferredQualifications: [],
    additionalInfo: '',
    
    // Settings
    isPublic: true,
    allowMessages: true,
    maxProposals: 50,
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentQualification, setCurrentQualification] = useState('');

  const steps = [
    'Basic Information',
    'Budget & Timeline',
    'Location & Service',
    'Requirements & Settings'
  ];

  const validateStep = (stepIndex) => {
    const newErrors = {};
    
    switch (stepIndex) {
      case 0:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        else if (formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
        else if (formData.title.length > 100) newErrors.title = 'Title must be less than 100 characters';
        
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
        else if (formData.description.length > 2000) newErrors.description = 'Description must be less than 2000 characters';
        
        if (!formData.category) newErrors.category = 'Category is required';
        break;
        
      case 1:
        if (!formData.budget.min || formData.budget.min < 0) newErrors.budgetMin = 'Minimum budget is required';
        if (!formData.budget.max || formData.budget.max < 0) newErrors.budgetMax = 'Maximum budget is required';
        if (formData.budget.min >= formData.budget.max) newErrors.budgetRange = 'Maximum must be greater than minimum';
        if (!formData.deadline) newErrors.deadline = 'Deadline is required';
        else if (new Date(formData.deadline) <= new Date()) newErrors.deadline = 'Deadline must be in the future';
        break;
        
      case 2:
        if (formData.serviceType !== 'remote' && !formData.location.city) {
          newErrors.locationCity = 'City is required for in-person services';
        }
        break;
        
      case 3:
        if (formData.maxProposals < 1 || formData.maxProposals > 100) {
          newErrors.maxProposals = 'Max proposals must be between 1 and 100';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setErrors({});
    } else {
      Alert.alert('Validation Error', 'Please fix the errors before proceeding');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddRequirement = () => {
    if (currentRequirement.trim() && !formData.requirements.includes(currentRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleAddQualification = () => {
    if (currentQualification.trim() && !formData.preferredQualifications.includes(currentQualification.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredQualifications: [...prev.preferredQualifications, currentQualification.trim()]
      }));
      setCurrentQualification('');
    }
  };

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      preferredQualifications: prev.preferredQualifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    // Validate all steps
    let allValid = true;
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        allValid = false;
        if (i !== activeStep) {
          setActiveStep(i);
        }
        break;
      }
    }
    
    if (!allValid) {
      Alert.alert('Validation Error', 'Please fix all errors before submitting');
      return;
    }

    setLoading(true);
    
    try {
      // Format budget as JSONB
      const budgetType = formData.budget?.type || 'fixed';
      const budgetData = {
        type: budgetType,
        min: formData.budget?.min || 0,
        max: formData.budget?.max || 0,
      };

      const requestData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags || [],
        budget: budgetData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        urgency: formData.urgency || 'medium',
        service_type: formData.serviceType || 'both',
        location: formData.serviceType !== 'remote' && formData.location ? {
          city: formData.location.city || '',
          state: formData.location.state || '',
          country: formData.location.country || '',
          radius: formData.location.radius || 0,
        } : null,
        requirements: formData.requirements || [],
        is_public: formData.isPublic !== false,
        status: 'open',
      };

      const result = await db.requests.create(requestData);

      if (result) {
        Alert.alert('Success', '🎉 Request posted successfully!', [
          { text: 'OK', onPress: () => {
            onSuccess?.();
            onClose();
          }},
        ]);
      }
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Error', 'Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <View>
      <Text style={styles.stepTitle}>📝 Describe what you need</Text>
      <Text style={styles.stepSubtitle}>Be clear and specific to attract the right providers</Text>

            <TextInput
              label="Request Title *"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.title}
        placeholder="e.g., Need a professional website for my business"
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <Text style={styles.label}>Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  selected={formData.category === cat}
                  onPress={() => handleInputChange('category', cat)}
            style={styles.chip}
                  mode={formData.category === cat ? 'flat' : 'outlined'}
                  selectedColor={colors.primary.main}
                >
                  {cat}
                </Chip>
              ))}
            </ScrollView>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

      <Text style={styles.label}>Project Size</Text>
      <View style={styles.row}>
        {['Small (1-3 days)', 'Medium (1-2 weeks)', 'Large (1+ months)'].map((size, index) => (
          <Chip
            key={index}
            selected={formData.projectSize === ['small', 'medium', 'large'][index]}
            onPress={() => handleInputChange('projectSize', ['small', 'medium', 'large'][index])}
            style={styles.chip}
            mode={formData.projectSize === ['small', 'medium', 'large'][index] ? 'flat' : 'outlined'}
            selectedColor={colors.primary.main}
          >
            {size.split(' ')[0]}
          </Chip>
        ))}
      </View>

      <TextInput
        label="Detailed Description *"
        value={formData.description}
        onChangeText={(value) => handleInputChange('description', value)}
        mode="outlined"
        multiline
        numberOfLines={6}
        style={styles.input}
        error={!!errors.description}
        placeholder="Describe exactly what you need done..."
      />
      {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

      <Text style={styles.label}>Add Skills/Tags</Text>
      <View style={styles.tagInputRow}>
        <TextInput
          label="Add Tag"
          value={currentTag}
          onChangeText={setCurrentTag}
          mode="outlined"
          style={[styles.input, { flex: 1 }]}
          onSubmitEditing={handleAddTag}
        />
        <Button mode="outlined" onPress={handleAddTag} style={styles.addButton}>
          Add
        </Button>
      </View>
      <View style={styles.tagsContainer}>
        {formData.tags.map((tag) => (
          <Chip
            key={tag}
            onClose={() => handleRemoveTag(tag)}
            style={styles.tagChip}
            mode="flat"
          >
            {tag}
          </Chip>
        ))}
      </View>
    </View>
  );

  // Step 2: Budget & Timeline
  const renderBudgetTimeline = () => (
    <View>
      <Text style={styles.stepTitle}>💰 Set your budget and timeline</Text>
      <Text style={styles.stepSubtitle}>Define your budget range and timeline</Text>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>Budget Range</Text>
          
          <Text style={styles.label}>Budget Type</Text>
          <View style={styles.row}>
            {budgetTypes.map((type, index) => (
              <Chip
                key={index}
                selected={formData.budget.type === ['fixed', 'hourly', 'negotiable'][index]}
                onPress={() => handleNestedChange('budget', 'type', ['fixed', 'hourly', 'negotiable'][index])}
                style={styles.chip}
                mode={formData.budget.type === ['fixed', 'hourly', 'negotiable'][index] ? 'flat' : 'outlined'}
                selectedColor={colors.primary.main}
              >
                {type}
              </Chip>
            ))}
          </View>

            <View style={styles.budgetRow}>
              <TextInput
              label="Min Budget ($)"
              value={formData.budget.min.toString()}
              onChangeText={(value) => handleNestedChange('budget', 'min', parseFloat(value) || 0)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.budgetInput]}
              error={!!errors.budgetMin}
              />
              <Text style={styles.budgetSeparator}>-</Text>
              <TextInput
              label="Max Budget ($)"
              value={formData.budget.max.toString()}
              onChangeText={(value) => handleNestedChange('budget', 'max', parseFloat(value) || 0)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.budgetInput]}
              error={!!errors.budgetMax}
            />
          </View>
          {errors.budgetRange && <Text style={styles.errorText}>{errors.budgetRange}</Text>}
          <Text style={styles.budgetRangeText}>
            Range: ${formData.budget.min} - ${formData.budget.max}
          </Text>
        </Card.Content>
      </Card>

      <Text style={styles.label}>Project Deadline *</Text>
      <TextInput
        label="Deadline (YYYY-MM-DD)"
        value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
        onChangeText={(value) => {
          if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              handleInputChange('deadline', date.toISOString());
            }
          }
        }}
        mode="outlined"
        style={styles.input}
        error={!!errors.deadline}
        placeholder="e.g., 2024-12-31"
        keyboardType="default"
      />
      {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
      <Text style={styles.hintText}>Enter date in YYYY-MM-DD format</Text>

      <Text style={styles.label}>Priority Level</Text>
      <View style={styles.urgencyContainer}>
        {urgencyLevels.map((level) => (
          <TouchableOpacity
            key={level.value}
            onPress={() => handleInputChange('urgency', level.value)}
            style={[
              styles.urgencyCard,
              formData.urgency === level.value && { borderColor: level.color, borderWidth: 2 }
            ]}
          >
            <Text style={[
              styles.urgencyLabel,
              formData.urgency === level.value && { color: level.color, fontWeight: '700' }
            ]}>
              {level.label}
            </Text>
            <Text style={styles.urgencyDescription}>{level.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 3: Location & Service Type
  const renderLocationService = () => (
    <View>
      <Text style={styles.stepTitle}>📍 Location and service preferences</Text>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>Service Type</Text>
          {serviceTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => handleInputChange('serviceType', type.value)}
              style={[
                styles.serviceTypeCard,
                formData.serviceType === type.value && { borderColor: colors.primary.main, borderWidth: 2 }
              ]}
            >
              <MaterialCommunityIcons 
                name={type.icon} 
                size={24} 
                color={formData.serviceType === type.value ? colors.primary.main : colors.text.secondary} 
              />
              <View style={styles.serviceTypeContent}>
                <Text style={[
                  styles.serviceTypeLabel,
                  formData.serviceType === type.value && { color: colors.primary.main, fontWeight: '700' }
                ]}>
                  {type.label}
                </Text>
                <Text style={styles.serviceTypeDescription}>{type.description}</Text>
              </View>
              {formData.serviceType === type.value && (
                <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary.main} />
              )}
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      {formData.serviceType !== 'remote' && (
        <>
          <TextInput
            label="City *"
            value={formData.location.city}
            onChangeText={(value) => handleNestedChange('location', 'city', value)}
            mode="outlined"
            style={styles.input}
            error={!!errors.locationCity}
            placeholder="e.g., New York"
          />
          {errors.locationCity && <Text style={styles.errorText}>{errors.locationCity}</Text>}

          <View style={styles.row}>
            <TextInput
              label="State/Province"
              value={formData.location.state}
              onChangeText={(value) => handleNestedChange('location', 'state', value)}
              mode="outlined"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="e.g., NY"
            />
            <TextInput
              label="Country"
              value={formData.location.country}
              onChangeText={(value) => handleNestedChange('location', 'country', value)}
              mode="outlined"
              style={[styles.input, { flex: 1 }]}
              placeholder="e.g., United States"
            />
          </View>

          <Text style={styles.label}>Service Radius: {formData.location.radius} km</Text>
          <Text style={styles.sliderHint}>How far are you willing to have providers travel?</Text>
        </>
      )}
    </View>
  );

  // Step 4: Requirements & Settings
  const renderRequirementsSettings = () => (
    <View>
      <Text style={styles.stepTitle}>⚙️ Requirements and settings</Text>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>Required Skills/Experience</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              label="Add Requirement"
              value={currentRequirement}
              onChangeText={setCurrentRequirement}
              mode="outlined"
              style={[styles.input, { flex: 1 }]}
              onSubmitEditing={handleAddRequirement}
            />
            <Button mode="outlined" onPress={handleAddRequirement} style={styles.addButton}>
              Add
            </Button>
          </View>
          {formData.requirements.map((req, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>{req}</Text>
              <IconButton
                icon="close"
                size={20}
                onPress={() => handleRemoveRequirement(index)}
              />
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>Preferred Qualifications</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              label="Add Qualification"
              value={currentQualification}
              onChangeText={setCurrentQualification}
              mode="outlined"
              style={[styles.input, { flex: 1 }]}
              onSubmitEditing={handleAddQualification}
            />
            <Button mode="outlined" onPress={handleAddQualification} style={styles.addButton}>
              Add
            </Button>
          </View>
          {formData.preferredQualifications.map((qual, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>{qual}</Text>
              <IconButton
                icon="close"
                size={20}
                onPress={() => handleRemoveQualification(index)}
              />
            </View>
          ))}
        </Card.Content>
      </Card>

      <TextInput
        label="Additional Information"
        value={formData.additionalInfo}
        onChangeText={(value) => handleInputChange('additionalInfo', value)}
        mode="outlined"
        multiline
        numberOfLines={4}
              style={styles.input}
        placeholder="Any additional details or preferences..."
      />

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>Request Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Public Request</Text>
              <Text style={styles.settingDescription}>
                {formData.isPublic ? 'Visible to all providers' : 'Only invited providers can see'}
              </Text>
            </View>
            <Switch
              value={formData.isPublic}
              onValueChange={(value) => handleInputChange('isPublic', value)}
              color={colors.primary.main}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Allow Messages</Text>
              <Text style={styles.settingDescription}>
                Let providers ask questions before submitting
              </Text>
            </View>
            <Switch
              value={formData.allowMessages}
              onValueChange={(value) => handleInputChange('allowMessages', value)}
              color={colors.primary.main}
            />
          </View>

          <Divider style={styles.divider} />

          <TextInput
            label="Max Proposals"
            value={formData.maxProposals.toString()}
            onChangeText={(value) => handleInputChange('maxProposals', parseInt(value) || 50)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.maxProposals}
          />
          {errors.maxProposals && <Text style={styles.errorText}>{errors.maxProposals}</Text>}
        </Card.Content>
      </Card>
    </View>
  );

  const getStepContent = () => {
    switch (activeStep) {
      case 0: return renderBasicInfo();
      case 1: return renderBudgetTimeline();
      case 2: return renderLocationService();
      case 3: return renderRequirementsSettings();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={[colors.primary.main, colors.primary.dark]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Your Request</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* Stepper */}
        <View style={styles.stepper}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <View style={[
                styles.stepCircle,
                index <= activeStep && styles.stepCircleActive
              ]}>
                {index < activeStep ? (
                  <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                ) : (
                  <Text style={[
                    styles.stepNumber,
                    index === activeStep && styles.stepNumberActive
                  ]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < steps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  index < activeStep && styles.stepLineActive
                ]} />
              )}
            </View>
          ))}
        </View>
        <Text style={styles.stepLabel}>{steps[activeStep]}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            {getStepContent()}
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <Button
            mode="outlined"
            onPress={activeStep === 0 ? onClose : handleBack}
            disabled={loading}
            style={styles.footerButton}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={[styles.footerButton, styles.submitButton]}
              buttonColor={colors.primary.main}
            >
              {loading ? 'Posting...' : 'Post Request'}
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleNext}
              style={[styles.footerButton, styles.nextButton]}
              buttonColor={colors.primary.main}
            >
              Next Step
            </Button>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FFFFFF',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepNumberActive: {
    color: colors.primary.main,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 8,
  },
  errorText: {
    color: colors.error.main,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  chipScroll: {
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetInput: {
    flex: 1,
  },
  budgetSeparator: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  budgetRangeText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
    marginTop: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 12,
  },
  dateButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  urgencyContainer: {
    marginBottom: 12,
  },
  urgencyCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 8,
  },
  urgencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  urgencyDescription: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  serviceTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 12,
  },
  serviceTypeContent: {
    flex: 1,
    marginLeft: 12,
  },
  serviceTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  serviceTypeDescription: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  sliderHint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 12,
  },
  hintText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: -8,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  divider: {
    marginVertical: 12,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  submitButton: {
    borderRadius: 12,
  },
  nextButton: {
    borderRadius: 12,
  },
});

export default CreateRequestScreen;
