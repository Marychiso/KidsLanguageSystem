import React from 'react';
import { Stack } from 'expo-router';
import MandarinColorsLesson from '@/components/languages/chinese/lessons/MandarinColorsLesson';

export default function ChineseColorsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MandarinColorsLesson />
    </>
  );
}
