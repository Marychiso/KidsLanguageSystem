import React from 'react';
import { Stack, router } from 'expo-router';

import FrenchAlphabetQuiz from '@/components/languages/french/quizzes/FrenchAlphabetQuiz';

export default function FrenchAlphabetQuizScreen() {
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
      <FrenchAlphabetQuiz onExit={handleExit} />
    </>
  );
}