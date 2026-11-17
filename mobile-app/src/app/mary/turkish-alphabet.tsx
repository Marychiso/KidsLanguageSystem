
import React from 'react';
import { Stack } from 'expo-router';

import TurkishAlphabetLesson from '@/components/languages/turkish/lessons/TurkishAlphabetLesson';

export default function TurkishAlphabetScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TurkishAlphabetLesson />
    </>
  );
}
