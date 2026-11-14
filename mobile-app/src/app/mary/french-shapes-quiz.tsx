
import React from 'react';
import { Stack, router } from 'expo-router';

import FrenchShapesQuiz from '@/components/languages/french/quizzes/FrenchShapesQuiz';

export default function FrenchShapesQuizScreen() {
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
      <FrenchShapesQuiz onExit={handleExit} />
    </>
  );
}
