import { Stack } from 'expo-router';
import FrenchColorsGame from '@/components/languages/french/games/FrenchColorsGame';

export default function FrenchColorsGameScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FrenchColorsGame />
    </>
  );
}