import React from 'react';
import { Stack } from 'expo-router';
import SpanishColorsLesson from '@/components/languages/spanish/lessons/SpanishColorsLesson';

export default function SpanishColorsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpanishColorsLesson />
    </>
  );
}
