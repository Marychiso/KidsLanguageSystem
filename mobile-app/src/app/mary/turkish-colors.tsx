
import React from 'react';
import { Stack } from 'expo-router';
import TurkishColorsLesson from '@/components/languages/turkish/lessons/TurkishColorsLesson';

export default function TurkishColorsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TurkishColorsLesson />
    </>
  );
}
