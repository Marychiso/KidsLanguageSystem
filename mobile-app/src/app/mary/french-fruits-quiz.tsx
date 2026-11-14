import React from 'react';
import { Stack, router } from 'expo-router';

import FrenchFruitsQuiz from '@/components/languages/french/quizzes/FrenchFruitsQuiz';

export default function FrenchFruitsQuizScreen() {
  function handleExit() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: {
          language: 'french',
          activity: 'quizzes',
        },
      });
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FrenchFruitsQuiz onExit={handleExit} />
    </>
  );
}
