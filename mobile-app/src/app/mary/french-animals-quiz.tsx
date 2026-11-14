
import React from 'react';
import { Stack, router } from 'expo-router';

import FrenchAnimalsQuiz from '@/components/languages/french/quizzes/FrenchAnimalsQuiz';

export default function FrenchAnimalsQuizScreen() {
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
      <FrenchAnimalsQuiz onExit={handleExit} />
    </>
  );
}
