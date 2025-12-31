import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator, Avatar, Chip, Switch } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { colors } from '../theme/colors';

const EditProfileScreen = ({ navigation, onClose }) => {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    profilePicture: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    userType: 'customer',
    website: '',
    linkedIn: '',
    github: '',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
    }
  });

  useEffect(() => {
    if (profile || user) {
      setFormData({
        firstName: profile?.first_name || user?.user_metadata?.firstName || '',
        lastName: profile?.last_name || user?.user_metadata?.lastName || '',
        email: profile?.email || user?.email || '',
        phone: profile?.phone || '',
        bio: profile?.bio || '',
        profilePicture: profile?.profile_picture || user?.user_metadata?.avatar || '',
        location: {
          city: profile?.location?.city || '',
          state: profile?.location?.state || '',
          country: profile?.location?.country || ''
        },
        userType: profile?.user_type || 'customer',
        website: profile?.website || '',
        linkedIn: profile?.linkedin || '',
        github: profile?.github || '',
        preferences: profile?.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
        }
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Validation Error', 'First name and last name are required');
      return;
    }

    try {
      setSaving(true);

      const updates = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        profile_picture: formData.profilePicture,
        location: formData.location,
        user_type: formData.userType,
        website: formData.website,
        linkedin: formData.linkedIn,
        github: formData.github,
        preferences: formData.preferences,
      };

      if (user?.id) {
        await db.users.updateProfile(user.id, updates);
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation?.goBack() || onClose?.() }
        ]);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', `Failed to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.main, colors.primary.dark]} style={styles.header}>
        <View style={styles.headerContent}>
          <Button
            mode="text"
            onPress={() => navigation?.goBack() || onClose?.()}
            textColor="#FFFFFF"
            icon="arrow-left"
          >
            Cancel
          </Button>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Button
            mode="text"
            onPress={handleSave}
            textColor="#FFFFFF"
            loading={saving}
            disabled={saving}
            icon="check"
          >
            Save
          </Button>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.avatarSection}>
                <Avatar.Image
                  size={100}
                  source={{ uri: formData.profilePicture || undefined }}
                  style={styles.avatar}
                />
                <Text style={styles.avatarHint}>Profile Picture URL</Text>
                <TextInput
                  mode="outlined"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.profilePicture}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, profilePicture: text }))}
                  style={styles.textInput}
                />
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <TextInput
                mode="outlined"
                label="First Name *"
                value={formData.firstName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                style={styles.textInput}
              />
              <TextInput
                mode="outlined"
                label="Last Name *"
                value={formData.lastName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                style={styles.textInput}
              />
              <TextInput
                mode="outlined"
                label="Email"
                value={formData.email}
                editable={false}
                style={styles.textInput}
              />
              <TextInput
                mode="outlined"
                label="Phone"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                style={styles.textInput}
              />
              <TextInput
                mode="outlined"
                label="Bio"
                multiline
                numberOfLines={4}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                style={styles.textInput}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Location</Text>
              <TextInput
                mode="outlined"
                label="City"
                value={formData.location.city}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, city: text }
                }))}
                style={styles.textInput}
              />
              <TextInput
                mode="outlined"
                label="State"
                value={formData.location.state}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, state: text }
                }))}
                style={styles.textInput}
              />
              <TextInput
                mode="outlined"
                label="Country"
                value={formData.location.country}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, country: text }
                }))}
                style={styles.textInput}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Social Links</Text>
              <TextInput
                mode="outlined"
                label="Website"
                keyboardType="url"
                value={formData.website}
                onChangeText={(text) => setFormData(prev => ({ ...prev, website: text }))}
                style={styles.textInput}
              />
              <TextInput
                mode="outlined"
                label="LinkedIn"
                keyboardType="url"
                value={formData.linkedIn}
                onChangeText={(text) => setFormData(prev => ({ ...prev, linkedIn: text }))}
                style={styles.textInput}
              />
              <TextInput
                mode="outlined"
                label="GitHub"
                keyboardType="url"
                value={formData.github}
                onChangeText={(text) => setFormData(prev => ({ ...prev, github: text }))}
                style={styles.textInput}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Email Notifications</Text>
                <Switch
                  value={formData.preferences.emailNotifications}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, emailNotifications: value }
                  }))}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>SMS Notifications</Text>
                <Switch
                  value={formData.preferences.smsNotifications}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, smsNotifications: value }
                  }))}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Marketing Emails</Text>
                <Switch
                  value={formData.preferences.marketingEmails}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, marketingEmails: value }
                  }))}
                />
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
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
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
  },
  avatarHint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
});

export default EditProfileScreen;





