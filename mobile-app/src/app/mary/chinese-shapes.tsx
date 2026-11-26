import React from 'react';
import { Stack } from 'expo-router';
import MandarinShapesLesson from '@/components/languages/chinese/lessons/MandarinShapesLesson';

export default function ChineseShapesScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MandarinShapesLesson />
    </>
  );
}
