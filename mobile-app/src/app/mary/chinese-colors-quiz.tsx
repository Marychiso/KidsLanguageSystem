import React from 'react';
import { Stack } from 'expo-router';
import MandarinColorsQuiz from '@/components/languages/chinese/quizzes/MandarinColorsQuiz';

export default function ChineseColorsQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MandarinColorsQuiz />
    </>
  );
}
