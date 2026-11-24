import React from 'react';
import { Stack } from 'expo-router';
import SpanishShapesLesson from '@/components/languages/spanish/lessons/SpanishShapesLesson';

export default function SpanishShapesScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpanishShapesLesson />
    </>
  );
}
