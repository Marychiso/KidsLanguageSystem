import React from 'react';
import { Stack } from 'expo-router';
import TurkishFruitsQuiz from '@/components/languages/turkish/quizzes/TurkishFruitsQuiz';

export default function TurkishFruitsQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TurkishFruitsQuiz />
    </>
  );
}
