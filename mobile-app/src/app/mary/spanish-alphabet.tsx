import React from 'react';
import { Stack } from 'expo-router';
import SpanishAlphabetLesson from '@/components/languages/spanish/lessons/SpanishAlphabetLesson';

export default function SpanishAlphabetScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpanishAlphabetLesson />
    </>
  );
}
