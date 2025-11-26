import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { colors } from '../theme/colors';

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
  'Furniture Making',
  'Tailoring & Sewing',
  'Restoration & Conservation',
];

const CreateSkillScreen = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priceMin: '',
    priceMax: '',
    deliveryTime: '',
    location: '',
  });
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.priceMin || !formData.priceMax) {
      newErrors.price = 'Price range is required';
    }
    if (parseFloat(formData.priceMin) > parseFloat(formData.priceMax)) {
      newErrors.price = 'Min price must be less than max price';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      const skillData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price_min: parseFloat(formData.priceMin),
        price_max: parseFloat(formData.priceMax),
        delivery_time: formData.deliveryTime || null,
        location: formData.location || null,
        tags: tags,
        is_active: true,
        user_id: user?.id,
      };

      const result = await db.skills.create(skillData);

      if (result) {
        Alert.alert('Success', 'Skill created successfully!', [
          { text: 'OK', onPress: () => {
            onSuccess?.();
            onClose();
          }},
        ]);
      }
    } catch (error) {
      console.error('Error creating skill:', error);
      Alert.alert('Error', 'Failed to create skill. Please try again.');
    } finally {
      setLoading(false);
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
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Skill</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <TextInput
              label="Skill Title *"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Custom Handcrafted Furniture"
              error={!!errors.title}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={styles.input}
              placeholder="Describe your skill, experience, and what you offer..."
              error={!!errors.description}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

            <Text style={styles.label}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  selected={formData.category === cat}
                  onPress={() => handleInputChange('category', cat)}
                  style={styles.categoryChip}
                  mode={formData.category === cat ? 'flat' : 'outlined'}
                  selectedColor={colors.primary.main}
                >
                  {cat}
                </Chip>
              ))}
            </ScrollView>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

            <Text style={styles.sectionTitle}>Pricing</Text>

            <View style={styles.priceRow}>
              <TextInput
                label="Min Price ($) *"
                value={formData.priceMin}
                onChangeText={(value) => handleInputChange('priceMin', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.priceInput]}
                error={!!errors.price}
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                label="Max Price ($) *"
                value={formData.priceMax}
                onChangeText={(value) => handleInputChange('priceMax', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.priceInput]}
                error={!!errors.price}
              />
            </View>
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

            <TextInput
              label="Delivery Time (Optional)"
              value={formData.deliveryTime}
              onChangeText={(value) => handleInputChange('deliveryTime', value)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., 14-30 days"
            />

            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                label="Add Tag"
                value={currentTag}
                onChangeText={setCurrentTag}
                mode="outlined"
                style={[styles.input, styles.tagInput]}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <Button
                mode="contained"
                onPress={handleAddTag}
                style={styles.addTagButton}
                buttonColor={colors.primary.main}
              >
                Add
              </Button>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    onClose={() => handleRemoveTag(tag)}
                    style={styles.tagChip}
                    mode="flat"
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}

            <TextInput
              label="Location (Optional)"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., New York, NY"
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              buttonColor={colors.primary.main}
              contentStyle={styles.submitButtonContent}
              labelStyle={styles.submitButtonLabel}
            >
              {loading ? 'Creating...' : 'Create Skill'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
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
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceInput: {
    flex: 1,
  },
  priceSeparator: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    borderRadius: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.primary.main + '15',
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
    elevation: 2,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateSkillScreen;

