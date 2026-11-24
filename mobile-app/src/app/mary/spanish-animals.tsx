import React from 'react';
import { Stack } from 'expo-router';
import SpanishAnimalsLesson from '@/components/languages/spanish/lessons/SpanishAnimalsLesson';

export default function SpanishAnimalsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpanishAnimalsLesson />
    </>
  );
}
