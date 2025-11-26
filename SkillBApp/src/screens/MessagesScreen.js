import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Avatar, Badge, Searchbar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformUser, formatTimeAgo } from '../utils/dataTransform';
import { colors } from '../theme/colors';


const MessagesScreen = ({ onNavigateToNewMessage }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const dbConversations = await db.conversations.getUserConversations(user.id);

      const allConversations = (dbConversations || []).map((conv) => {
        const otherUser =
          conv.user1_id === user.id
            ? transformUser(conv.user2 || conv.user2_id)
            : transformUser(conv.user1 || conv.user1_id);

        return {
          id: conv.id,
          otherUser: otherUser || {
            id: conv.user1_id === user.id ? conv.user2_id : conv.user1_id,
            name: 'Unknown User',
            firstName: 'Unknown',
            lastName: 'User',
          },
          lastMessage: {
            text: conv.last_message || 'No messages yet',
            timestamp: conv.last_message_at
              ? new Date(conv.last_message_at)
              : new Date(conv.created_at),
            sender: conv.last_message_sender_id === user.id ? 'me' : 'them',
            unread: false,
          },
          project: conv.requests?.title || 'General Conversation',
          unreadCount: 0,
          isStarred: false,
        };
      });

      // Sort by last message timestamp (most recent first)
      const sortedConversations = allConversations.sort((a, b) => {
        const aTime = a.lastMessage.timestamp instanceof Date
          ? a.lastMessage.timestamp
          : new Date(a.lastMessage.timestamp);
        const bTime = b.lastMessage.timestamp instanceof Date
          ? b.lastMessage.timestamp
          : new Date(b.lastMessage.timestamp);
        return bTime - aTime;
      });

      setConversations(sortedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.otherUser.name?.toLowerCase().includes(query) ||
      conv.otherUser.firstName?.toLowerCase().includes(query) ||
      conv.otherUser.lastName?.toLowerCase().includes(query) ||
      conv.project?.toLowerCase().includes(query) ||
      conv.lastMessage.text?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search conversations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
          iconColor={colors.primary.main}
        />
      </View>

      {/* New Message Button */}
      <View style={styles.newMessageContainer}>
        <Button
          mode="contained"
          icon="message-plus"
          onPress={() => onNavigateToNewMessage?.()}
          style={styles.newMessageButton}
          contentStyle={styles.newMessageButtonContent}
          labelStyle={styles.newMessageButtonLabel}
          buttonColor={colors.primary.main}
        >
          New Message
        </Button>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Stats */}
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="message-text" size={20} color={colors.primary.main} />
            <Text style={styles.statText}>{filteredConversations.length} Conversations</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="message-badge" size={20} color="#FF9800" />
            <Text style={styles.statText}>
              {conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)} Unread
            </Text>
          </View>
        </View>

        {filteredConversations.length === 0 ? (
          <Card style={styles.emptyCard} mode="outlined">
            <Card.Content style={styles.emptyCardContent}>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={64}
                color={colors.text.secondary}
              />
              <Text style={styles.emptyText}>No conversations found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery.trim()
                  ? 'Try adjusting your search terms'
                  : 'Start a conversation with an artisan or client'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = conversation.otherUser;
            const initials = `${otherUser.firstName?.[0] || ''}${otherUser.lastName?.[0] || ''}`.toUpperCase() || 'U';
            const isUnread = (conversation.unreadCount || 0) > 0;
            
            return (
              <TouchableOpacity
                key={conversation.id}
                activeOpacity={0.7}
                onPress={() => {
                  console.log('Open conversation:', conversation.id);
                }}
              >
                <Card style={styles.conversationCard} mode="outlined">
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.conversationRow}>
                      {/* Avatar with Online Status */}
                      <View style={styles.avatarContainer}>
                        {otherUser.avatar || otherUser.profilePicture ? (
                          <Avatar.Image
                            size={56}
                            source={{ uri: otherUser.avatar || otherUser.profilePicture }}
                          />
                        ) : (
                          <Avatar.Text
                            size={56}
                            label={initials}
                            style={styles.avatar}
                          />
                        )}
                        {otherUser.isOnline && (
                          <View style={styles.onlineIndicator} />
                        )}
                        {isUnread && (
                          <Badge style={styles.unreadBadge} size={20}>
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </View>

                      {/* Conversation Info */}
                      <View style={styles.conversationInfo}>
                        <View style={styles.conversationHeader}>
                          <View style={styles.nameContainer}>
                            <Text style={styles.conversationName} numberOfLines={1}>
                              {otherUser.name || `${otherUser.firstName} ${otherUser.lastName}` || 'Unknown User'}
                            </Text>
                            {conversation.isStarred && (
                              <MaterialCommunityIcons
                                name="star"
                                size={16}
                                color="#FFD700"
                                style={styles.starIcon}
                              />
                            )}
                          </View>
                          <Text style={styles.timeText}>
                            {formatTimeAgo(conversation.lastMessage.timestamp)}
                          </Text>
                        </View>

                        {conversation.project && (
                          <Text style={styles.projectText} numberOfLines={1}>
                            {conversation.project}
                          </Text>
                        )}

                        <View style={styles.messageContainer}>
                          {conversation.lastMessage.sender === 'me' && (
                            <MaterialCommunityIcons
                              name="check-all"
                              size={14}
                              color={colors.text.secondary}
                              style={styles.messageIcon}
                            />
                          )}
                          <Text
                            style={[
                              styles.lastMessage,
                              isUnread && styles.lastMessageUnread,
                            ]}
                            numberOfLines={2}
                          >
                            {conversation.lastMessage.text}
                          </Text>
                        </View>
                      </View>

                      {/* Action Button */}
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          console.log('Open conversation:', conversation.id);
                        }}
                      >
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={24}
                          color={colors.text.secondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  newMessageContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  newMessageButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newMessageButtonContent: {
    paddingVertical: 10,
  },
  newMessageButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchbarInput: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptyCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  conversationCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardContent: {
    padding: 16,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    backgroundColor: colors.primary.main,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
  },
  conversationInfo: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  starIcon: {
    marginLeft: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  projectText: {
    fontSize: 12,
    color: colors.primary.main,
    fontWeight: '600',
    marginBottom: 6,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  messageIcon: {
    marginTop: 2,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionButton: {
    padding: 4,
  },
});

export default MessagesScreen;
