import React from 'react';
import { Stack } from 'expo-router';
import MandarinAnimalsQuiz from '@/components/languages/chinese/quizzes/MandarinAnimalsQuiz';

export default function ChineseAnimalsQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MandarinAnimalsQuiz />
    </>
  );
}
