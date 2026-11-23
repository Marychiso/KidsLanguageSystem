
import React from 'react';
import { Stack } from 'expo-router';

import TurkishFruitsLesson from '@/components/languages/turkish/lessons/TurkishFruitsLesson';

export default function TurkishFruitsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TurkishFruitsLesson />
    </>
  );
}
