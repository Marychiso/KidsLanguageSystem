import React from 'react';
import { Stack } from 'expo-router';
import SpanishShapesQuiz from '@/components/languages/spanish/quizzes/SpanishShapesQuiz';

export default function SpanishShapesQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SpanishShapesQuiz />
    </>
  );
}
