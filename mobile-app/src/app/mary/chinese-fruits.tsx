import React from 'react';
import { Stack } from 'expo-router';
import MandarinFruitsLesson from '@/components/languages/chinese/lessons/MandarinFruitsLesson';

export default function ChineseFruitsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MandarinFruitsLesson />
    </>
  );
}
