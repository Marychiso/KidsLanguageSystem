
import React from 'react';
import { Stack } from 'expo-router';
import TurkishAnimalsLesson from '@/components/languages/turkish/lessons/TurkishAnimalsLesson';

export default function TurkishAnimalsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TurkishAnimalsLesson />
    </>
  );
}
