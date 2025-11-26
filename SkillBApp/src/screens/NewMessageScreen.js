import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator, Avatar, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { colors } from '../theme/colors';

const NewMessageScreen = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load users for new message
    loadUsers();
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      // Fetch users from Supabase
      const dbUsers = await db.users.search(searchQuery);
      
      const formattedUsers = (dbUsers || []).map(user => ({
        id: user.id,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        userType: user.user_type || 'customer',
        profilePicture: user.profile_picture,
        isVerified: user.is_verified || false,
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (u.id === user?.id) return false; // Don't show current user
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(query) ||
      u.lastName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
  });

  const handleSelectUser = (selected) => {
    setSelectedUser(selected);
  };

  const handleSendMessage = async () => {
    if (!selectedUser) {
      Alert.alert('Error', 'Please select a user to message');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to send messages');
      return;
    }

    try {
      setLoading(true);

      // Get or create conversation
      const conversation = await db.conversations.getOrCreate(user.id, selectedUser.id);

      // Send the message
      await db.messages.send({
        conversation_id: conversation.id,
        sender_id: user.id,
        message: message.trim(),
        created_at: new Date().toISOString(),
      });

      Alert.alert('Success', `Message sent to ${selectedUser.firstName} ${selectedUser.lastName}!`, [
        {
          text: 'OK',
          onPress: () => {
            onSuccess?.();
            onClose?.();
          },
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', `Failed to send message: ${error.message || 'Please try again.'}`);
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
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Message</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Select Recipient</Text>
            <TextInput
              mode="outlined"
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              left={<TextInput.Icon icon="magnify" color={colors.primary.main} />}
            />
          </Card.Content>
        </Card>

        {/* User List */}
        {!selectedUser ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>
                {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'} Found
              </Text>
              {filteredUsers.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="account-search-outline"
                    size={48}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.emptyText}>No users found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your search</Text>
                </View>
              ) : (
                filteredUsers.map((userItem) => {
                  const initials = `${userItem.firstName?.[0] || ''}${userItem.lastName?.[0] || ''}`.toUpperCase() || 'U';
                  return (
                    <TouchableOpacity
                      key={userItem.id}
                      style={styles.userItem}
                      onPress={() => handleSelectUser(userItem)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.userInfo}>
                        {userItem.profilePicture ? (
                          <Avatar.Image size={48} source={{ uri: userItem.profilePicture }} />
                        ) : (
                          <Avatar.Text
                            size={48}
                            label={initials}
                            style={{ backgroundColor: colors.primary.main }}
                          />
                        )}
                        <View style={styles.userDetails}>
                          <View style={styles.userNameRow}>
                            <Text style={styles.userName}>
                              {userItem.firstName} {userItem.lastName}
                            </Text>
                            {userItem.isVerified && (
                              <MaterialCommunityIcons
                                name="check-decagram"
                                size={16}
                                color={colors.success.main}
                                style={styles.verifiedIcon}
                              />
                            )}
                          </View>
                          <Text style={styles.userEmail}>{userItem.email}</Text>
                          <Chip
                            style={styles.userTypeChip}
                            textStyle={styles.userTypeChipText}
                            mode="outlined"
                          >
                            {userItem.userType === 'provider' ? 'Service Provider' : 'Client'}
                          </Chip>
                        </View>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color={colors.text.secondary}
                      />
                    </TouchableOpacity>
                  );
                })
              )}
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Selected User Card */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.selectedUserHeader}>
                  <Text style={styles.sectionTitle}>Message To</Text>
                  <TouchableOpacity onPress={() => setSelectedUser(null)}>
                    <Text style={styles.changeButton}>Change</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.selectedUserInfo}>
                  {selectedUser.profilePicture ? (
                    <Avatar.Image size={56} source={{ uri: selectedUser.profilePicture }} />
                  ) : (
                    <Avatar.Text
                      size={56}
                      label={`${selectedUser.firstName?.[0] || ''}${selectedUser.lastName?.[0] || ''}`.toUpperCase() || 'U'}
                      style={{ backgroundColor: colors.primary.main }}
                    />
                  )}
                  <View style={styles.selectedUserDetails}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.selectedUserName}>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </Text>
                      {selectedUser.isVerified && (
                        <MaterialCommunityIcons
                          name="check-decagram"
                          size={18}
                          color={colors.success.main}
                          style={styles.verifiedIcon}
                        />
                      )}
                    </View>
                    <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Message Input */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Your Message</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Type your message here..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  style={styles.messageInput}
                />
              </Card.Content>
            </Card>

            {/* Send Button */}
            <Button
              mode="contained"
              onPress={handleSendMessage}
              loading={loading}
              disabled={loading || !message.trim()}
              style={styles.sendButton}
              buttonColor={colors.primary.main}
              labelStyle={styles.sendButtonLabel}
              icon="send"
            >
              Send Message
            </Button>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  userEmail: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  userTypeChip: {
    alignSelf: 'flex-start',
    height: 24,
    borderColor: colors.primary.main,
  },
  userTypeChipText: {
    fontSize: 11,
    color: colors.primary.main,
  },
  selectedUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  selectedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedUserDetails: {
    marginLeft: 16,
    flex: 1,
  },
  selectedUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  selectedUserEmail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  messageInput: {
    backgroundColor: '#F5F5F5',
    minHeight: 120,
  },
  sendButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  sendButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default NewMessageScreen;


