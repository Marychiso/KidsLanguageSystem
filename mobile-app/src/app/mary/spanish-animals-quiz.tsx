import React from 'react';
import { Stack } from 'expo-router';
import SpanishAnimalsQuiz from '@/components/languages/spanish/quizzes/SpanishAnimalsQuiz';

export default function SpanishAnimalsQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpanishAnimalsQuiz />
    </>
  );
}
