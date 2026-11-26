import React from 'react';
import { Stack } from 'expo-router';
import MandarinFruitsQuiz from '@/components/languages/chinese/quizzes/MandarinFruitsQuiz';

export default function ChineseFruitsQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MandarinFruitsQuiz />
    </>
  );
}
