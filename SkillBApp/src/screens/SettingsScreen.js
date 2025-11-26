import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, List, Switch, Button, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

const SettingsScreen = ({ navigation, onClose }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
  });

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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
                />
              )}
            />
            <Divider />
            <List.Item
              title="Marketing Emails"
              description="Receive promotional emails"
              left={() => <List.Icon icon="email-multiple" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={notifications.marketing}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, marketing: value }))}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <List.Item
              title="Profile Visibility"
              description="Make your profile visible to others"
              left={() => <List.Icon icon="account" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={privacy.profileVisible}
                  onValueChange={(value) => setPrivacy(prev => ({ ...prev, profileVisible: value }))}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Show Email"
              description="Display email on your profile"
              left={() => <List.Icon icon="email-outline" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={privacy.showEmail}
                  onValueChange={(value) => setPrivacy(prev => ({ ...prev, showEmail: value }))}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Show Phone"
              description="Display phone on your profile"
              left={() => <List.Icon icon="phone" color={colors.primary.main} />}
              right={() => (
                <Switch
                  value={privacy.showPhone}
                  onValueChange={(value) => setPrivacy(prev => ({ ...prev, showPhone: value }))}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account</Text>
            <List.Item
              title="Edit Profile"
              description="Update your profile information"
              left={() => <List.Icon icon="account-edit" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                // Navigate to edit profile
                console.log('Navigate to edit profile');
              }}
            />
            <Divider />
            <List.Item
              title="Change Password"
              description="Update your password"
              left={() => <List.Icon icon="lock" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Change Password', 'Password change feature coming soon');
              }}
            />
            <Divider />
            <List.Item
              title="Delete Account"
              description="Permanently delete your account"
              left={() => <List.Icon icon="delete" color="#f44336" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Delete Account', 'This action cannot be undone', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => {
                    Alert.alert('Delete Account', 'Account deletion feature coming soon');
                  }}
                ]);
              }}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>About</Text>
            <List.Item
              title="Help & Support"
              left={() => <List.Icon icon="help-circle" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                // Navigate to support
                console.log('Navigate to support');
              }}
            />
            <Divider />
            <List.Item
              title="Terms of Service"
              left={() => <List.Icon icon="file-document" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                // Navigate to terms
                console.log('Navigate to terms');
              }}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              left={() => <List.Icon icon="shield-lock" color={colors.primary.main} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                // Navigate to privacy
                console.log('Navigate to privacy');
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
  logoutButton: {
    marginTop: 16,
    marginBottom: 32,
    borderColor: '#f44336',
  },
});

export default SettingsScreen;




