import { Stack } from 'expo-router';
import FrenchShapesGame from '@/components/languages/french/games/FrenchShapesGame';

export default function FrenchShapesGameScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FrenchShapesGame />
    </>
  );
}