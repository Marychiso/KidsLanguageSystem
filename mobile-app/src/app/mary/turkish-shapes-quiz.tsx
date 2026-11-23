import React from 'react';
import { Stack } from 'expo-router';
import TurkishShapesQuiz from '@/components/languages/turkish/quizzes/TurkishShapesQuiz';

export default function TurkishShapesQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TurkishShapesQuiz />
    </>
  );
}
