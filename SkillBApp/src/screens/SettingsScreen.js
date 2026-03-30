import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, List, Switch, Button, Divider, Menu, RadioButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { colors } from '../theme/colors';

const SettingsScreen = ({ navigation, route, onClose, onNavigateToEditProfile, onNavigateToSupport, onNavigateToTerms, onNavigateToPrivacy }) => {
  const { user, profile, logout, updateProfile } = useAuth();
  
  // Navigation helper
  const navigateTo = (screen, params = {}) => {
    if (navigation?.navigate) {
      navigation.navigate(screen, params);
    }
  };
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    messages: true,
    proposals: true,
    reviews: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    showOnlineStatus: true,
    showInDirectory: true,
  });
  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'USD',
    emailDigest: 'weekly',
  });

  // Load settings from profile
  useEffect(() => {
    if (profile?.preferences) {
      setNotifications(prev => ({
        ...prev,
        email: profile.preferences.emailNotifications ?? true,
        marketing: profile.preferences.marketingEmails ?? false,
      }));
      setPrivacy(prev => ({
        ...prev,
        showEmail: profile.preferences.privacy?.showEmail ?? false,
        showPhone: profile.preferences.privacy?.showPhone ?? false,
        showOnlineStatus: profile.preferences.privacy?.showOnlineStatus ?? true,
        showInDirectory: profile.preferences.privacy?.showInDirectory ?? true,
      }));
    }
  }, [profile]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by AppNavigator
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleSaveSettings = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const updatedPreferences = {
        ...profile?.preferences,
        emailNotifications: notifications.email,
        marketingEmails: notifications.marketing,
        privacy: {
          ...profile?.preferences?.privacy,
          showEmail: privacy.showEmail,
          showPhone: privacy.showPhone,
          showOnlineStatus: privacy.showOnlineStatus,
          showInDirectory: privacy.showInDirectory,
        },
        language: preferences.language,
        currency: preferences.currency,
        emailDigest: preferences.emailDigest,
      };

      await db.users.updateProfile(user.id, { preferences: updatedPreferences });
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Confirm Delete', 'Type DELETE to confirm account deletion', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Confirm',
                style: 'destructive',
                onPress: async () => {
                  try {
                    // Account deletion would be implemented here
                    Alert.alert('Account Deleted', 'Your account has been scheduled for deletion');
                    await logout();
                  } catch (error) {
                    Alert.alert('Error', 'Failed to delete account');
                  }
                }
              }
            ]);
          }
        }
      ]
    );
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
            Back
          </Button>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 80 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Notifications Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <List.Item
              title="Email Notifications"
              description="Receive notifications via email"
              left={() => <List.Icon icon="email" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={notifications.email}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, email: value }))}
                  color={colors.primary.main}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Push Notifications"
              description="Receive push notifications"
              left={() => <List.Icon icon="bell" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={notifications.push}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, push: value }))}
                  color={colors.primary.main}
                />
              )}
            />
            <Divider />
            <List.Item
              title="New Messages"
              description="Get notified when you receive messages"
              left={() => <List.Icon icon="message" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={notifications.messages}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, messages: value }))}
                  color={colors.primary.main}
                />
              )}
            />
            <Divider />
            <List.Item
              title="New Proposals"
              description="Get notified when you receive proposals"
              left={() => <List.Icon icon="file-document" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={notifications.proposals}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, proposals: value }))}
                  color={colors.primary.main}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Reviews & Ratings"
              description="Get notified when you receive reviews"
              left={() => <List.Icon icon="star" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={notifications.reviews}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, reviews: value }))}
                  color={colors.primary.main}
                />
              )}
            />
            <Divider />
            <List.Item
              title="SMS Notifications"
              description="Receive notifications via SMS"
              left={() => <List.Icon icon="message-text" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={notifications.sms}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, sms: value }))}
                  color={colors.primary.main}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Marketing Emails"
              description="Receive promotional emails and updates"
              left={() => <List.Icon icon="email-multiple" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={notifications.marketing}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, marketing: value }))}
                  color={colors.primary.main}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Privacy & Security Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            <List.Item
              title="Profile Visibility"
              description="Make your profile visible to others"
              left={() => <List.Icon icon="account" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={privacy.profileVisible}
                  onValueChange={(value) => setPrivacy(prev => ({ ...prev, profileVisible: value }))}
                  color={colors.primary.main}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Show Email on Profile"
              description="Other users can see your email"
              left={() => <List.Icon icon="email-outline" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={privacy.showEmail}
                  onValueChange={(value) => setPrivacy(prev => ({ ...prev, showEmail: value }))}
                  color={colors.primary.main}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Show Phone on Profile"
              description="Other users can see your phone number"
              left={() => <List.Icon icon="phone" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={privacy.showPhone}
                  onValueChange={(value) => setPrivacy(prev => ({ ...prev, showPhone: value }))}
                  color={colors.primary.main}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Show Online Status"
              description="Others can see when you're online"
              left={() => <List.Icon icon="circle" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={privacy.showOnlineStatus}
                  onValueChange={(value) => setPrivacy(prev => ({ ...prev, showOnlineStatus: value }))}
                  color={colors.primary.main}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Show in Provider Directory"
              description="Appear in public search results"
              left={() => <List.Icon icon="briefcase" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={privacy.showInDirectory}
                  onValueChange={(value) => setPrivacy(prev => ({ ...prev, showInDirectory: value }))}
                  color={colors.primary.main}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Preferences Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <List.Item
              title="Language"
              description={preferences.language === 'en' ? 'English' : preferences.language === 'es' ? 'Spanish' : preferences.language === 'fr' ? 'French' : 'German'}
              left={() => <List.Icon icon="translate" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Select Language', 'Choose your preferred language', [
                  { text: 'English', onPress: () => setPreferences(prev => ({ ...prev, language: 'en' })) },
                  { text: 'Spanish', onPress: () => setPreferences(prev => ({ ...prev, language: 'es' })) },
                  { text: 'French', onPress: () => setPreferences(prev => ({ ...prev, language: 'fr' })) },
                  { text: 'German', onPress: () => setPreferences(prev => ({ ...prev, language: 'de' })) },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            />
            <Divider />
            <List.Item
              title="Currency"
              description={preferences.currency === 'USD' ? 'USD ($)' : preferences.currency === 'EUR' ? 'EUR (€)' : preferences.currency === 'GBP' ? 'GBP (£)' : 'CAD (C$)'}
              left={() => <List.Icon icon="currency-usd" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Select Currency', 'Choose your preferred currency', [
                  { text: 'USD ($)', onPress: () => setPreferences(prev => ({ ...prev, currency: 'USD' })) },
                  { text: 'EUR (€)', onPress: () => setPreferences(prev => ({ ...prev, currency: 'EUR' })) },
                  { text: 'GBP (£)', onPress: () => setPreferences(prev => ({ ...prev, currency: 'GBP' })) },
                  { text: 'CAD (C$)', onPress: () => setPreferences(prev => ({ ...prev, currency: 'CAD' })) },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            />
            <Divider />
            <List.Item
              title="Email Digest Frequency"
              description={preferences.emailDigest === 'daily' ? 'Daily' : preferences.emailDigest === 'weekly' ? 'Weekly' : preferences.emailDigest === 'monthly' ? 'Monthly' : 'Never'}
              left={() => <List.Icon icon="email-sync" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Email Digest', 'How often do you want to receive email summaries?', [
                  { text: 'Daily', onPress: () => setPreferences(prev => ({ ...prev, emailDigest: 'daily' })) },
                  { text: 'Weekly', onPress: () => setPreferences(prev => ({ ...prev, emailDigest: 'weekly' })) },
                  { text: 'Monthly', onPress: () => setPreferences(prev => ({ ...prev, emailDigest: 'monthly' })) },
                  { text: 'Never', onPress: () => setPreferences(prev => ({ ...prev, emailDigest: 'never' })) },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            />
          </Card.Content>
        </Card>

        {/* Save Settings Button */}
        <Button
          mode="contained"
          onPress={handleSaveSettings}
          style={styles.saveButton}
          buttonColor={colors.primary.main}
          loading={saving}
          disabled={saving}
          icon="content-save"
        >
          Save Settings
        </Button>

        {/* Account Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account</Text>
            <List.Item
              title="Edit Profile"
              description="Update your profile information"
              left={() => <List.Icon icon="account-edit" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                if (onNavigateToEditProfile) {
                  onNavigateToEditProfile();
                } else {
                  navigateTo('EditProfile');
                }
              }}
            />
            <Divider />
            <List.Item
              title="Change Password"
              description="Update your password"
              left={() => <List.Icon icon="lock" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  'Change Password',
                  'We will send a password reset link to your email address.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Send Link',
                      onPress: () => {
                        Alert.alert('Success', 'Password reset link sent to your email!');
                      }
                    }
                  ]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* About Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>About</Text>
            <List.Item
              title="Help & Support"
              left={() => <List.Icon icon="help-circle" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                if (onNavigateToSupport) {
                  onNavigateToSupport();
                } else {
                  navigateTo('Support');
                }
              }}
            />
            <Divider />
            <List.Item
              title="Terms of Service"
              left={() => <List.Icon icon="file-document" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                if (onNavigateToTerms) {
                  onNavigateToTerms();
                } else {
                  navigateTo('Terms');
                }
              }}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              left={() => <List.Icon icon="shield-lock" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                if (onNavigateToPrivacy) {
                  onNavigateToPrivacy();
                } else {
                  navigateTo('Privacy');
                }
              }}
            />
            <Divider />
            <List.Item
              title="App Version"
              description="1.0.0"
              left={() => <List.Icon icon="information" color={colors.primary.main} />}
            />
          </Card.Content>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.dangerCard}>
          <Card.Content>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <List.Item
              title="Delete Account"
              description="Permanently delete your account and all data"
              left={() => <List.Icon icon="delete-forever" color="#f44336" />}
              right={() => <List.Icon icon="chevron-right" color="#f44336" />}
              onPress={handleDeleteAccount}
              titleStyle={{ color: '#f44336' }}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#f44336"
          icon="logout"
        >
          Logout
        </Button>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  saveButton: {
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 4,
  },
  dangerCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f44336',
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
    borderColor: '#f44336',
    borderRadius: 12,
  },
});

export default SettingsScreen;





