import { Stack } from 'expo-router';
import FrenchFruitGame from '@/components/languages/french/games/FrenchFruitGame';

export default function FrenchFruitGameScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FrenchFruitGame />
    </>
  );
}