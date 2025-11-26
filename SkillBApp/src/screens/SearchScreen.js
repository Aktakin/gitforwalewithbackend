import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Chip, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { transformRequest } from '../utils/dataTransform';
import { colors } from '../theme/colors';

const SearchScreen = ({ navigation, onClose }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('all'); // 'all', 'requests', 'skills'

  const categories = [
    'All Categories',
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
    'Restoration & Conservation',
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);

      if (searchType === 'all' || searchType === 'requests') {
        const requests = await db.requests.getAll({
          search: searchQuery,
          pageSize: 20,
        });
        const transformedRequests = requests.map(transformRequest).filter(r => r !== null);
        setSearchResults(prev => [
          ...prev.filter(r => r.type !== 'request'),
          ...transformedRequests.map(r => ({ ...r, type: 'request' }))
        ]);
      }

      if (searchType === 'all' || searchType === 'skills') {
        const skills = await db.skills.getPublicSkills({
          search: searchQuery,
        });
        setSearchResults(prev => [
          ...prev.filter(r => r.type !== 'skill'),
          ...skills.map(s => ({ ...s, type: 'skill' }))
        ]);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType]);

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
          <Text style={styles.headerTitle}>Search</Text>
          <View style={{ width: 80 }} />
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search requests, skills, artisans..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          onSubmitEditing={handleSearch}
        />
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, searchType === 'all' && styles.filterTabActive]}
            onPress={() => setSearchType('all')}
          >
            <Text style={[styles.filterTabText, searchType === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, searchType === 'requests' && styles.filterTabActive]}
            onPress={() => setSearchType('requests')}
          >
            <Text style={[styles.filterTabText, searchType === 'requests' && styles.filterTabTextActive]}>
              Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, searchType === 'skills' && styles.filterTabActive]}
            onPress={() => setSearchType('skills')}
          >
            <Text style={[styles.filterTabText, searchType === 'skills' && styles.filterTabTextActive]}>
              Skills
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        ) : searchResults.length === 0 && searchQuery ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="magnify" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try different keywords or filters</Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="magnify" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyText}>Start searching</Text>
            <Text style={styles.emptySubtext}>Enter keywords to find requests or skills</Text>
          </View>
        ) : (
          searchResults.map((item, index) => (
            <Card
              key={item.id || index}
              style={styles.resultCard}
              onPress={() => {
                if (item.type === 'request') {
                  // Navigate to request detail
                  console.log('Navigate to request:', item.id);
                } else if (item.type === 'skill') {
                  // Navigate to skill detail
                  console.log('Navigate to skill:', item.id);
                }
              }}
            >
              <Card.Content>
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons
                    name={item.type === 'request' ? 'file-document' : 'hammer-wrench'}
                    size={24}
                    color={colors.primary.main}
                  />
                  <Text style={styles.resultTitle} numberOfLines={2}>
                    {item.title || item.name}
                  </Text>
                </View>
                {item.description && (
                  <Text style={styles.resultDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                {item.category && (
                  <Chip
                    icon="tag"
                    style={styles.categoryChip}
                    textStyle={styles.categoryChipText}
                  >
                    {item.category}
                  </Chip>
                )}
              </Card.Content>
            </Card>
          ))
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
  searchSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchbar: {
    marginBottom: 12,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary.main + '20',
  },
  filterTabText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: colors.primary.main,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
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
  resultCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  resultTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  resultDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  categoryChipText: {
    fontSize: 12,
  },
});

export default SearchScreen;

