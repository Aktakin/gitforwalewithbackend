import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Accordion, Button, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const SupportScreen = ({ navigation, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState([]);

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: "How do I get started on SkillBridge?",
      answer: "Getting started is easy! First, create your account by clicking the 'Sign Up' button. Then, complete your profile with your skills, experience, and portfolio. If you're a provider, you can create skill listings. If you're a client, you can browse skills or post project requests.",
    },
    {
      id: 2,
      category: 'Getting Started',
      question: "What's the difference between a skill listing and a project request?",
      answer: "A skill listing is created by providers to showcase their services with fixed packages and pricing. A project request is posted by clients describing what they need, and providers can submit custom proposals with their own pricing and timeline.",
    },
    {
      id: 3,
      category: 'Account',
      question: "How do I verify my account?",
      answer: "Account verification helps build trust on the platform. Go to your Profile Settings > Verification. You can verify your identity with a government ID, verify your skills with certificates, and verify your payment method. Verified accounts get a blue checkmark and better visibility.",
    },
    {
      id: 4,
      category: 'Payments',
      question: "How does payment protection work?",
      answer: "SkillBridge uses escrow protection for all transactions. When a client pays for a project, the money is held securely until the work is completed and approved. This protects both parties - clients get their work delivered, and providers get paid for completed work.",
    },
    {
      id: 5,
      category: 'Payments',
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards (Visa, MasterCard, American Express), PayPal, bank transfers, and cryptocurrency (Bitcoin, Ethereum). Payment processing is handled securely through our certified payment partners.",
    },
    {
      id: 6,
      category: 'Projects',
      question: "How do I submit a proposal?",
      answer: "To submit a proposal, find a project request that matches your skills, click 'Submit Proposal', fill out the proposal form with your approach, timeline, and pricing, then submit. The client will review all proposals and select the best fit.",
    },
    {
      id: 7,
      category: 'Security',
      question: "How do I stay safe on SkillBridge?",
      answer: "Always communicate through SkillBridge's messaging system, use escrow protection for payments, verify user profiles before working together, and report any suspicious activity. Never share personal information outside the platform.",
    },
  ];

  const filteredFAQs = searchQuery
    ? faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const toggleExpanded = (id) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 80 }} />
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search help articles..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.contactCard}>
          <Card.Content>
            <Text style={styles.contactTitle}>Need More Help?</Text>
            <Text style={styles.contactSubtitle}>Contact our support team</Text>
            <View style={styles.contactButtons}>
              <Button
                mode="contained"
                icon="email"
                style={styles.contactButton}
                buttonColor={colors.primary.main}
              >
                Email Support
              </Button>
              <Button
                mode="outlined"
                icon="chat"
                style={styles.contactButton}
                textColor={colors.primary.main}
              >
                Live Chat
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {filteredFAQs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="help-circle-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try different search terms</Text>
          </View>
        ) : (
          filteredFAQs.map((faq) => (
            <Card
              key={faq.id}
              style={styles.faqCard}
            >
              <Card.Content>
                <TouchableOpacity
                  onPress={() => toggleExpanded(faq.id)}
                  style={styles.faqHeader}
                >
                  <View style={styles.faqHeaderContent}>
                    <MaterialCommunityIcons
                      name={expandedItems.includes(faq.id) ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={colors.primary.main}
                    />
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                  </View>
                  <Chip style={styles.categoryChip} textStyle={styles.categoryChipText}>
                    {faq.category}
                  </Chip>
                </TouchableOpacity>
                {expandedItems.includes(faq.id) && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
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
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  contactCard: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
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
  faqCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoryChip: {
    marginLeft: 8,
  },
  categoryChipText: {
    fontSize: 11,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default SupportScreen;




