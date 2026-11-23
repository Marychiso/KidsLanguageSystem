import React from 'react';
import { Stack } from 'expo-router';
import TurkishColorsQuiz from '@/components/languages/turkish/quizzes/TurkishColorsQuiz';

export default function TurkishColorsQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TurkishColorsQuiz />
    </>
  );
}
