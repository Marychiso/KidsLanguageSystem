import React from 'react';
import { Stack } from 'expo-router';
import SpanishFruitsLesson from '@/components/languages/spanish/lessons/SpanishFruitsLesson';

export default function SpanishFruitsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpanishFruitsLesson />
    </>
  );
}
