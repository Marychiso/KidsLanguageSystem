import React from 'react';
import { Stack } from 'expo-router';
import TurkishAlphabetQuiz from '@/components/languages/turkish/quizzes/TurkishAlphabetQuiz';

export default function TurkishAlphabetQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TurkishAlphabetQuiz />
    </>
  );
}
