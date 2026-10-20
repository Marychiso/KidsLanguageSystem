import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningColors as C } from '@/constants/learning-theme';
import AnimatedAlphabet from '@/components/animated-alphabet';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<
    'email' | 'password' | null
  >(null);

  function clearMessage() {
    setMessage('');
    setSuccess(false);
  }

function handleLogin() {
  clearMessage();

  if (!email.trim() || !password) {
    setMessage('Please enter your email and password.');
    return;
  }

  // Temporary demo account until backend integration.
  if (
    email.trim().toLowerCase() === 'demo@example.com' &&
    password === 'Hello123!'
  ) {
    router.replace('/mary/dashboard');
    return;
  }

  setMessage('The email or password is incorrect. Please try again.');
}

  
  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.panel}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/cindy/welcome')}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <AnimatedAlphabet />

            <Text style={styles.heading}>Hello again!</Text>

            <View style={styles.formCard}>
              <Text style={styles.label}>Email</Text>

              <TextInput
                accessibilityLabel="Email"
                style={[
                  styles.input,
                  focusedField === 'email' && styles.focusedInput,
                ]}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  clearMessage();
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your email"
                placeholderTextColor={C.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />

              <Text style={styles.label}>Password</Text>

              <View
                style={[
                  styles.passwordRow,
                  focusedField === 'password' && styles.focusedInput,
                ]}
              >
                <TextInput
                  accessibilityLabel="Password"
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    clearMessage();
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  placeholderTextColor={C.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showButton}
                >
                  <Text style={styles.linkText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>

              {!!message && (
                <View
                  style={[
                    styles.messageBox,
                    { backgroundColor: success ? C.green : C.pink },
                  ]}
                >
                  <Text
                    accessibilityLiveRegion="polite"
                    style={styles.messageText}
                  >
                    {message}
                  </Text>
                </View>
              )}

              <Pressable
                accessibilityRole="button"
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.loginButtonText}>Sign in →</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: C.blue,
    marginBottom: 8,
  },
  backText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: C.white,
    borderRadius: 28,
    padding: 22,
    borderWidth: 2,
    borderColor: C.blue,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginBottom: 10,
  },
  input: {
    minHeight: 56,
    borderWidth: 2,
    borderColor: C.blue,
    backgroundColor: C.background,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: C.text,
    marginBottom: 20,
  },
  focusedInput: {
    borderColor: C.primary,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 2,
    borderColor: C.blue,
    backgroundColor: C.background,
    borderRadius: 18,
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: C.text,
  },
  showButton: {
    minHeight: 48,
    minWidth: 64,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  messageBox: {
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  messageText: {
    color: C.text,
    fontSize: 14,
    lineHeight: 21,
  },
  loginButton: {
    minHeight: 56,
    backgroundColor: C.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 24,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },
});