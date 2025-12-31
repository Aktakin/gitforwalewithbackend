// Quick test file to verify navigation structure
// This file helps verify that all components are properly imported

import DashboardScreen from '../screens/DashboardScreen';
import RequestsScreen from '../screens/RequestsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// If you can import this file without errors, all screens are properly exported
console.log('All screens imported successfully:', {
  DashboardScreen: !!DashboardScreen,
  RequestsScreen: !!RequestsScreen,
  MessagesScreen: !!MessagesScreen,
  ProfileScreen: !!ProfileScreen,
  LoginScreen: !!LoginScreen,
  RegisterScreen: !!RegisterScreen,
  ForgotPasswordScreen: !!ForgotPasswordScreen,
});








