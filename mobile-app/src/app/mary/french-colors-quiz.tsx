
import React from 'react';
import { Stack, router } from 'expo-router';

import FrenchColorsQuiz from '@/components/languages/french/quizzes/FrenchColorsQuiz';

export default function FrenchColorsQuizScreen() {
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
      <FrenchColorsQuiz onExit={handleExit} />
    </>
  );
}
