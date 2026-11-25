import React from 'react';
import { Stack } from 'expo-router';
import SpanishAlphabetQuiz from '@/components/languages/spanish/quizzes/SpanishAlphabetQuiz';

export default function SpanishAlphabetQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpanishAlphabetQuiz />
    </>
  );
}
