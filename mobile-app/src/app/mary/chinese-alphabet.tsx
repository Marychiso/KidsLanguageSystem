import React from 'react';
import { Stack } from 'expo-router';
import MandarinPinyinLesson from '@/components/languages/chinese/lessons/MandarinPinyinLesson';

export default function ChineseAlphabetScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MandarinPinyinLesson />
    </>
  );
}
