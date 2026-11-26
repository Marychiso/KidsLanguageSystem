import React from 'react';
import { Stack } from 'expo-router';
import MandarinAnimalsLesson from '@/components/languages/chinese/lessons/MandarinAnimalsLesson';

export default function ChineseAnimalsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MandarinAnimalsLesson />
    </>
  );
}
