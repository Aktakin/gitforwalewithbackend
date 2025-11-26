import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform, Animated, Pressable } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// BlurView will be conditionally imported if available

// Initial Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import DashboardScreen from '../screens/DashboardScreen';
import RequestsScreen from '../screens/RequestsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateRequestScreen from '../screens/CreateRequestScreen';
import CreateSkillScreen from '../screens/CreateSkillScreen';
import NewMessageScreen from '../screens/NewMessageScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import CreateProposalScreen from '../screens/CreateProposalScreen';
import ViewProposalsScreen from '../screens/ViewProposalsScreen';
import SkillDetailScreen from '../screens/SkillDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';
import BrowseSkillsScreen from '../screens/BrowseSkillsScreen';
import SupportScreen from '../screens/SupportScreen';
import AboutScreen from '../screens/AboutScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import TermsScreen from '../screens/TermsScreen';

const AppNavigator = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState('splash'); // splash -> onboarding -> auth -> main
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [authScreen, setAuthScreen] = useState('Login');
  const [modalScreen, setModalScreen] = useState(null); // Various modal screens
  const [modalParams, setModalParams] = useState({}); // Parameters for modal screens
  
  // Animation values for each tab
  const tabAnimations = useRef({
    Dashboard: new Animated.Value(1),
    Requests: new Animated.Value(0.85),
    Messages: new Animated.Value(0.85),
    Profile: new Animated.Value(0.85),
  }).current;
  
  // Badge counts (can be connected to real data later)
  const badgeCounts = {
    Messages: 3,
    Requests: 0,
    Dashboard: 0,
    Profile: 0,
  };

  // Handle splash screen completion
  const handleSplashFinish = () => {
    setAppState('onboarding');
  };

  // Handle onboarding completion
  const handleOnboardingFinish = () => {
    setAppState('auth');
  };

  const handleOnboardingSkip = () => {
    setAppState('auth');
  };

  // Haptic feedback helper
  const triggerHaptic = () => {
    try {
      if (Platform.OS === 'ios') {
        // iOS haptic feedback - try expo-haptics if available
        try {
          const Haptics = require('expo-haptics');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {
          // Fallback: no haptics
        }
      } else {
        // Android vibration
        const { Vibration } = require('react-native');
        Vibration.vibrate(10);
      }
    } catch (e) {
      // Silently fail if haptics not available
    }
  };

  // Smooth tab switching with animations
  const handleTabPress = (screen) => {
    if (currentScreen === screen) return;
    
    triggerHaptic();
    
    // Animate previous tab out
    Animated.spring(tabAnimations[currentScreen], {
      toValue: 0.85,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    // Animate new tab in
    Animated.spring(tabAnimations[screen], {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    setCurrentScreen(screen);
  };

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // Reset to splash screen when user logs out
  useEffect(() => {
    if (!isAuthenticated && appState === 'main') {
      setAppState('splash');
      setAuthScreen('Login');
    }
  }, [isAuthenticated, appState]);

  // Start with splash screen on initial app load
  useEffect(() => {
    if (!authLoading && !isAuthenticated && appState !== 'splash' && appState !== 'onboarding' && appState !== 'auth') {
      setAppState('splash');
    }
  }, [authLoading, isAuthenticated, appState]);

  // Update app state when authentication changes
  useEffect(() => {
    if (isAuthenticated && (appState === 'auth' || appState === 'onboarding')) {
      setAppState('main');
    }
  }, [isAuthenticated, appState]);

  // NOW WE CAN DO CONDITIONAL RETURNS (after all hooks are declared)
  // Show splash screen
  if (appState === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show onboarding screens
  if (appState === 'onboarding') {
    return (
      <OnboardingScreen
        onFinish={handleOnboardingFinish}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Show auth loading state
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated && appState === 'auth') {
    if (authScreen === 'Login') {
      return (
        <LoginScreen
          onNavigateToRegister={() => setAuthScreen('Register')}
          onNavigateToForgotPassword={() => setAuthScreen('ForgotPassword')}
        />
      );
    }
    if (authScreen === 'Register') {
      return (
        <RegisterScreen
          onNavigateToLogin={() => setAuthScreen('Login')}
        />
      );
    }
    if (authScreen === 'ForgotPassword') {
      return (
        <ForgotPasswordScreen
          onNavigateToLogin={() => setAuthScreen('Login')}
        />
      );
    }
  }

  // Main app with bottom tabs (only show if authenticated)
  if (isAuthenticated && appState === 'main') {
    const renderScreen = () => {
      switch (currentScreen) {
        case 'Dashboard':
          return <DashboardScreen 
            onNavigateToCreateRequest={() => setModalScreen('CreateRequest')}
            onNavigateToCreateSkill={() => setModalScreen('CreateSkill')}
            onNavigateToRequestDetail={(requestId) => {
              setModalParams({ requestId });
              setModalScreen('RequestDetail');
            }}
          />;
        case 'Requests':
          return <RequestsScreen 
            onNavigateToCreateRequest={() => setModalScreen('CreateRequest')}
            onNavigateToCreateSkill={() => setModalScreen('CreateSkill')}
            onNavigateToRequestDetail={(requestId) => {
              setModalParams({ requestId });
              setModalScreen('RequestDetail');
            }}
          />;
        case 'Messages':
          return <MessagesScreen onNavigateToNewMessage={() => setModalScreen('NewMessage')} />;
        case 'Profile':
          return <ProfileScreen 
            navigation={{
              navigate: (screen, params) => {
                if (screen === 'EditProfile') {
                  setModalParams(params || {});
                  setModalScreen('EditProfile');
                } else if (screen === 'PublicProfile') {
                  setModalParams(params || {});
                  setModalScreen('PublicProfile');
                } else if (screen === 'Settings') {
                  setModalParams(params || {});
                  setModalScreen('Settings');
                } else if (screen === 'Notifications') {
                  setModalParams(params || {});
                  setModalScreen('Notifications');
                } else if (screen === 'Support') {
                  setModalParams(params || {});
                  setModalScreen('Support');
                }
              }
            }}
            onNavigateToEditProfile={() => {
              setModalParams({});
              setModalScreen('EditProfile');
            }}
            onNavigateToSettings={() => {
              setModalParams({});
              setModalScreen('Settings');
            }}
            onNavigateToNotifications={() => {
              setModalParams({});
              setModalScreen('Notifications');
            }}
          />;
        default:
          return <DashboardScreen 
            onNavigateToCreateRequest={() => setModalScreen('CreateRequest')}
            onNavigateToCreateSkill={() => setModalScreen('CreateSkill')}
          />;
      }
    };

    const renderModal = () => {
      if (modalScreen === 'CreateRequest') {
        return (
          <View style={styles.modalOverlay}>
            <CreateRequestScreen
              onClose={() => setModalScreen(null)}
              onSuccess={() => {
                // Refresh the current screen if needed
                setModalScreen(null);
              }}
            />
          </View>
        );
      }
      if (modalScreen === 'CreateSkill') {
        return (
          <View style={styles.modalOverlay}>
            <CreateSkillScreen
              onClose={() => setModalScreen(null)}
              onSuccess={() => {
                // Refresh the current screen if needed
                setModalScreen(null);
              }}
            />
          </View>
        );
      }
      if (modalScreen === 'NewMessage') {
        return (
          <View style={styles.modalOverlay}>
            <NewMessageScreen
              onClose={() => setModalScreen(null)}
              onSuccess={() => {
                setModalScreen(null);
              }}
            />
          </View>
        );
      }
      if (modalScreen === 'RequestDetail') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <RequestDetailScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
                navigate: (screen, params) => {
                  if (screen === 'CreateProposal') {
                    setModalParams(params);
                    setModalScreen('CreateProposal');
                  } else if (screen === 'ViewProposals') {
                    setModalParams(params);
                    setModalScreen('ViewProposals');
                  } else if (screen === 'NewMessage') {
                    setModalParams(params);
                    setModalScreen('NewMessage');
                  } else if (screen === 'CreateProposal') {
                    setModalParams(params);
                    setModalScreen('CreateProposal');
                  } else if (screen === 'SkillDetail') {
                    setModalParams(params);
                    setModalScreen('SkillDetail');
                  } else if (screen === 'EditProfile') {
                    setModalParams(params);
                    setModalScreen('EditProfile');
                  } else if (screen === 'Settings') {
                    setModalParams(params);
                    setModalScreen('Settings');
                  } else if (screen === 'Notifications') {
                    setModalParams(params);
                    setModalScreen('Notifications');
                  } else if (screen === 'Search') {
                    setModalParams(params);
                    setModalScreen('Search');
                  } else if (screen === 'BrowseSkills') {
                    setModalParams(params);
                    setModalScreen('BrowseSkills');
                  } else if (screen === 'Support') {
                    setModalParams(params);
                    setModalScreen('Support');
                  } else if (screen === 'About') {
                    setModalParams(params);
                    setModalScreen('About');
                  } else if (screen === 'Privacy') {
                    setModalParams(params);
                    setModalScreen('Privacy');
                  } else if (screen === 'Terms') {
                    setModalParams(params);
                    setModalScreen('Terms');
                  }
                },
              }}
            />
          </View>
        );
      }
      if (modalScreen === 'CreateProposal') {
        return (
          <View style={styles.modalOverlay}>
            <CreateProposalScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'ViewProposals') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <ViewProposalsScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'SkillDetail') {
        return (
          <View style={styles.modalOverlay}>
            <SkillDetailScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
                navigate: (screen, params) => {
                  if (screen === 'NewMessage') {
                    setModalParams(params);
                    setModalScreen('NewMessage');
                  }
                },
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'EditProfile') {
        return (
          <View style={styles.modalOverlay}>
            <EditProfileScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'PublicProfile') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <PublicProfileScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
                navigate: (screen, params) => {
                  if (screen === 'NewMessage') {
                    setModalParams(params);
                    setModalScreen('NewMessage');
                  } else if (screen === 'EditProfile') {
                    setModalParams(params);
                    setModalScreen('EditProfile');
                  }
                },
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'Settings') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <SettingsScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
                navigate: (screen, params) => {
                  if (screen === 'EditProfile') {
                    setModalParams(params);
                    setModalScreen('EditProfile');
                  } else if (screen === 'Support') {
                    setModalParams(params);
                    setModalScreen('Support');
                  } else if (screen === 'Privacy') {
                    setModalParams(params);
                    setModalScreen('Privacy');
                  } else if (screen === 'Terms') {
                    setModalParams(params);
                    setModalScreen('Terms');
                  }
                },
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'Notifications') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <NotificationsScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'Search') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <SearchScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
                navigate: (screen, params) => {
                  if (screen === 'RequestDetail') {
                    setModalParams(params);
                    setModalScreen('RequestDetail');
                  } else if (screen === 'SkillDetail') {
                    setModalParams(params);
                    setModalScreen('SkillDetail');
                  }
                },
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'BrowseSkills') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <BrowseSkillsScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
                navigate: (screen, params) => {
                  if (screen === 'SkillDetail') {
                    setModalParams(params);
                    setModalScreen('SkillDetail');
                  }
                },
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'Support') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <SupportScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'About') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <AboutScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'Privacy') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <PrivacyScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      if (modalScreen === 'Terms') {
        return (
          <View style={styles.modalOverlayWithTabBar}>
            <TermsScreen
              route={{ params: modalParams }}
              navigation={{
                goBack: () => setModalScreen(null),
              }}
              onClose={() => setModalScreen(null)}
            />
          </View>
        );
      }
      return null;
    };

    const TabItem = ({ screen, icon, iconOutline, label, badgeCount = 0 }) => {
      const isActive = currentScreen === screen;
      const scaleAnim = tabAnimations[screen];
      const badgeOpacityRef = useRef(new Animated.Value(badgeCount > 0 ? 1 : 0));
      const badgeOpacity = badgeOpacityRef.current;
      
      useEffect(() => {
        Animated.spring(badgeOpacity, {
          toValue: badgeCount > 0 ? 1 : 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }, [badgeCount, badgeOpacity]);
      
      return (
        <Pressable
          style={[styles.tabItem]}
          onPress={() => handleTabPress(screen)}
          android_ripple={{ color: colors.primary.main + '20', borderless: true }}
        >
          <Animated.View 
            style={[
              styles.tabItemContent,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {isActive && (
              <Animated.View 
                style={[
                  styles.activeIndicator,
                  {
                    opacity: scaleAnim.interpolate({
                      inputRange: [0.85, 1],
                      outputRange: [0, 1],
                    }),
                  }
                ]} 
              />
            )}
            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
              <MaterialCommunityIcons
                name={isActive ? icon : iconOutline}
                size={isActive ? 28 : 24}
                color={isActive ? colors.primary.main : '#8E8E93'}
              />
              {badgeCount > 0 && (
                <Animated.View 
                  style={[
                    styles.badge,
                    {
                      opacity: badgeOpacity,
                      transform: [{
                        scale: badgeOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </Animated.View>
              )}
            </View>
            <Animated.Text 
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
                {
                  opacity: scaleAnim.interpolate({
                    inputRange: [0.85, 1],
                    outputRange: [0.6, 1],
                  }),
                }
              ]}
            >
              {label}
            </Animated.Text>
          </Animated.View>
        </Pressable>
      );
    };

    // Render tab bar content (extracted for reuse)
    const renderTabBarContent = () => (
    <View style={styles.tabBar}>
      <TabItem
        screen="Dashboard"
        icon="home-circle"
        iconOutline="home-circle-outline"
        label="Home"
        badgeCount={badgeCounts.Dashboard}
      />
      <TabItem
        screen="Requests"
        icon="briefcase-check"
        iconOutline="briefcase-outline"
        label="Requests"
        badgeCount={badgeCounts.Requests}
      />
      
      {/* Center Floating Action Button */}
      <View style={styles.centerButtonContainer}>
        <Pressable
          onPress={() => {
            triggerHaptic();
            setModalScreen('CreateRequest');
          }}
          style={({ pressed }) => [
            styles.centerButton,
            pressed && styles.centerButtonPressed,
          ]}
          android_ripple={{ color: colors.primary.dark, borderless: true }}
        >
          <LinearGradient
            colors={[colors.primary.main, colors.primary.light]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.centerButtonGradient}
          >
            <MaterialCommunityIcons
              name="plus"
              size={28}
              color="#FFFFFF"
            />
          </LinearGradient>
        </Pressable>
      </View>
      
      <TabItem
        screen="Messages"
        icon="message-text"
        iconOutline="message-text-outline"
        label="Messages"
        badgeCount={badgeCounts.Messages}
      />
      <TabItem
        screen="Profile"
        icon="account-circle"
        iconOutline="account-circle-outline"
        label="Profile"
        badgeCount={badgeCounts.Profile}
      />
    </View>
  );

    return (
      <View style={styles.container}>
        <View style={styles.screenContainer}>
          {renderScreen()}
        </View>

        {/* Modal Screens */}
        {renderModal()}

        {/* Enhanced Bottom Tab Bar - Show for RequestDetail and ViewProposals, hide for full-screen modals */}
        {(!modalScreen || modalScreen === 'RequestDetail' || modalScreen === 'ViewProposals') && (
          <View style={[styles.tabBarWrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            {/* Sophisticated top border with gradient */}
            <LinearGradient
              colors={[colors.primary.main + '20', colors.primary.light + '10', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topBorderGradient}
            />
            
            {/* Blur background for iOS, solid for Android */}
            {Platform.OS === 'ios' ? (
              (() => {
                try {
                  const { BlurView } = require('expo-blur');
                  return (
                    <BlurView intensity={80} tint="light" style={styles.tabBarContainer}>
                      {renderTabBarContent()}
                    </BlurView>
                  );
                } catch (e) {
                  return (
                    <View style={[styles.tabBarContainer, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}>
                      {renderTabBarContent()}
                    </View>
                  );
                }
              })()
            ) : (
              <View style={styles.tabBarContainer}>
                {renderTabBarContent()}
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  // Fallback loading state
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary.main} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text.secondary,
    fontSize: 16,
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2000, // Higher than modal to ensure it's always visible when shown
  },
  tabBarContainer: {
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#FFFFFF',
    borderTopWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
    }),
  },
  topBorderGradient: {
    height: 3,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 8,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'visible',
    minHeight: 60,
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -24,
    width: 48,
    height: 4,
    backgroundColor: colors.primary.main,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    padding: 6,
    borderRadius: 12,
    width: 44,
    height: 44,
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: colors.primary.main + '15',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary.main,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  centerButtonContainer: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    zIndex: 10,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  centerButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  modalOverlayWithTabBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 90, // Leave space for tab bar
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  modalOverlayFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
});

export default AppNavigator;
