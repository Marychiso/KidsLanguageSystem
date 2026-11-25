import React from 'react';
import { Stack } from 'expo-router';
import SpanishFruitsQuiz from '@/components/languages/spanish/quizzes/SpanishFruitsQuiz';

export default function SpanishFruitsQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpanishFruitsQuiz />
    </>
  );
}
