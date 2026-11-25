import React from 'react';
import { Stack } from 'expo-router';
import SpanishColorsQuiz from '@/components/languages/spanish/quizzes/SpanishColorsQuiz';

export default function SpanishColorsQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpanishColorsQuiz />
    </>
  );
}
