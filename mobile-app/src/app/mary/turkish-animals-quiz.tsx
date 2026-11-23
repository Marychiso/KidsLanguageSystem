import React from 'react';
import { Stack } from 'expo-router';
import TurkishAnimalsQuiz from '@/components/languages/turkish/quizzes/TurkishAnimalsQuiz';

export default function TurkishAnimalsQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TurkishAnimalsQuiz />
    </>
  );
}
