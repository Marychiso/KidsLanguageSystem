import React from 'react';
import { Stack } from 'expo-router';
import MandarinShapesQuiz from '@/components/languages/chinese/quizzes/MandarinShapesQuiz';

export default function ChineseShapesQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MandarinShapesQuiz />
    </>
  );
}
