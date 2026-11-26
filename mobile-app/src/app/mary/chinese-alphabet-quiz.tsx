import React from 'react';
import { Stack } from 'expo-router';
import MandarinPinyinQuiz from '@/components/languages/chinese/quizzes/MandarinPinyinQuiz';

export default function ChineseAlphabetQuizScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MandarinPinyinQuiz />
    </>
  );
}
