
import React from 'react';
import { Stack } from 'expo-router';

import TurkishShapesLesson from '@/components/languages/turkish/lessons/TurkishShapesLesson';

export default function TurkishShapesScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TurkishShapesLesson />
    </>
  );
}
