import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const TermsScreen = ({ navigation, onClose }) => {
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
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={{ width: 80 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
            <Text style={styles.content}>
              By accessing and using SkillBridge, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>User Accounts</Text>
            <Text style={styles.content}>
              You are responsible for maintaining the confidentiality of your account and password. 
              You agree to accept responsibility for all activities that occur under your account.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>User Conduct</Text>
            <Text style={styles.content}>
              You agree not to use the service to post, transmit, or share any content that is 
              illegal, harmful, threatening, abusive, or otherwise objectionable. You must respect 
              other users and maintain professional conduct at all times.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Payment Terms</Text>
            <Text style={styles.content}>
              All payments are processed securely through our payment partners. Refunds are handled 
              according to our refund policy. Disputes should be resolved through our dispute resolution process.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Intellectual Property</Text>
            <Text style={styles.content}>
              All content on SkillBridge, including but not limited to text, graphics, logos, and 
              software, is the property of SkillBridge or its content suppliers and is protected 
              by copyright and other intellectual property laws.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Limitation of Liability</Text>
            <Text style={styles.content}>
              SkillBridge shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of or inability to use the service.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.content}>
              For questions about these Terms of Service, please contact us at legal@skillbridge.com
            </Text>
          </Card.Content>
        </Card>
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
    marginBottom: 12,
  },
  content: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 24,
  },
});

export default TermsScreen;





