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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  function clearMessage() {
    setMessage('');
    setSuccess(false);
  }

  function handleRegister() {
    clearMessage();

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setMessage('Please fill in every field.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setMessage('Use at least 8 characters for your password.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Your passwords do not match.');
      return;
    }

    setSuccess(true);
    setPassword('');
    setConfirmPassword('');
    setMessage(
      'Demo sign-up complete! No account was saved. Use the demo login to continue.'
    );
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
              <Text style={styles.linkText}>← Back</Text>
            </Pressable>

            <AnimatedAlphabet />

            <Text style={styles.heading}>Join the fun!</Text>

            <View style={styles.formCard}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                accessibilityLabel="Name"
                style={styles.input}
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  clearMessage();
                }}
                placeholder="What should we call you?"
                placeholderTextColor={C.textSecondary}
                autoCapitalize="words"
                autoComplete="name"
                maxLength={50}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                accessibilityLabel="Email"
                style={styles.input}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  clearMessage();
                }}
                placeholder="Enter your email"
                placeholderTextColor={C.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  accessibilityLabel="Password"
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    clearMessage();
                  }}
                  placeholder="At least 8 characters"
                  placeholderTextColor={C.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Hide passwords' : 'Show passwords'
                  }
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showButton}
                >
                  <Text style={styles.linkText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                accessibilityLabel="Confirm password"
                style={styles.input}
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  clearMessage();
                }}
                placeholder="Enter your password again"
                placeholderTextColor={C.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

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

              {success ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.replace('/cindy/login')}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.buttonText}>Go to sign in →</Text>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleRegister}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.buttonText}>Create account →</Text>
                </Pressable>
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/cindy/login')}
              style={styles.signInButton}
            >
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text style={styles.linkText}>Sign in</Text>
              </Text>
            </Pressable>
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 2,
    borderColor: C.blue,
    backgroundColor: C.background,
    borderRadius: 18,
    marginBottom: 20,
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
    marginBottom: 16,
  },
  messageText: {
    color: C.text,
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    minHeight: 56,
    backgroundColor: C.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },
  signInButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  footerText: {
    color: C.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});