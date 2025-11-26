import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onFinish, onSkip }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);

  const pages = [
    {
      icon: 'hammer-wrench',
      title: 'Find Artisans',
      description: 'Discover skilled artisans for your projects. From woodworking to pottery, find the perfect match.',
      gradient: [colors.primary.main, colors.primary.dark],
    },
    {
      icon: 'briefcase-outline',
      title: 'Post Requests',
      description: 'Create detailed requests for your projects. Get proposals from qualified artisans.',
      gradient: [colors.primary.main, colors.primary.dark],
    },
    {
      icon: 'handshake-outline',
      title: 'Connect & Collaborate',
      description: 'Communicate directly with artisans, discuss project details, and bring your vision to life.',
      gradient: [colors.primary.main, colors.primary.dark],
    },
  ];

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      const nextPage = currentPage + 1;
      scrollViewRef.current?.scrollTo({ x: nextPage * width, animated: true });
      setCurrentPage(nextPage);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const renderPage = (page, index) => (
    <View key={index} style={styles.page}>
      <LinearGradient
        colors={page.gradient}
        style={styles.pageGradient}
      >
        <View style={styles.pageContent}>
          <MaterialCommunityIcons
            name={page.icon}
            size={80}
            color="#FFFFFF"
          />
          <Text style={styles.pageTitle}>{page.title}</Text>
          <Text style={styles.pageDescription}>{page.description}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {pages.map((page, index) => renderPage(page, index))}
      </ScrollView>

      {/* Skip Button */}
      <View style={styles.skipContainer}>
        <Button
          mode="text"
          onPress={handleSkip}
          textColor="#FFFFFF"
          style={styles.skipButton}
          labelStyle={styles.skipButtonLabel}
        >
          Skip
        </Button>
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Next/Get Started Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleNext}
          buttonColor="#FFFFFF"
          textColor={colors.primary.main}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width,
    height,
    flex: 1,
  },
  pageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pageContent: {
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  pageDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 8,
  },
  skipButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  button: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;

