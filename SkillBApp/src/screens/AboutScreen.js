import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const AboutScreen = ({ navigation, onClose }) => {
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
          <Text style={styles.headerTitle}>About SkillBridge</Text>
          <View style={{ width: 80 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Our Mission</Text>
            <Text style={styles.content}>
              To democratize access to professional skills and create meaningful connections 
              between talented individuals and businesses worldwide. We believe everyone 
              deserves the opportunity to showcase their expertise and find fulfilling work.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Our Story</Text>
            <Text style={styles.content}>
              SkillBridge was founded with a vision to bridge the gap between skilled professionals 
              and those seeking their expertise. We've grown from a small startup to a platform 
              connecting thousands of artisans and clients worldwide.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Our Values</Text>
            <View style={styles.valueItem}>
              <MaterialCommunityIcons name="handshake" size={24} color={colors.primary.main} />
              <Text style={styles.valueText}>Trust & Transparency</Text>
            </View>
            <View style={styles.valueItem}>
              <MaterialCommunityIcons name="heart" size={24} color={colors.primary.main} />
              <Text style={styles.valueText}>Community First</Text>
            </View>
            <View style={styles.valueItem}>
              <MaterialCommunityIcons name="lightbulb" size={24} color={colors.primary.main} />
              <Text style={styles.valueText}>Innovation</Text>
            </View>
            <View style={styles.valueItem}>
              <MaterialCommunityIcons name="shield-check" size={24} color={colors.primary.main} />
              <Text style={styles.valueText}>Safety & Security</Text>
            </View>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  content: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 24,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  valueText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default AboutScreen;




