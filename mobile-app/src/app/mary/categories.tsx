
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  Stack,
  router,
  useLocalSearchParams,
} from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningColors as C } from '@/constants/learning-theme';

// Five category IDs
type CategoryId =
  | 'alphabet'
  | 'animals'
  | 'colors'
  | 'fruits'
  | 'shapes';

// Four learning activities
type ActivityId =
  | 'lessons'
  | 'quizzes'
  | 'stories'
  | 'games';

type Translation = {
  activities: Record<ActivityId, string>;
  greeting: string;
  question: string;
  sectionTitle: string;
  back: string;
  explore: string;
  categories: Record<
    CategoryId,
    {
      title: string;
      description: string;
    }
  >;
  encouragementTitle: string;
  encouragementText: string;
  comingSoon: string;
};

// Translations for all six languages
const translations: Record<string, Translation> = {
  english: {
    activities: {
      lessons: 'Lessons',
      quizzes: 'Quizzes',
      stories: 'Stories',
      games: 'Games',
    },
    greeting: 'Hello, Little Explorer! 🌟',
    question: 'What would you like to explore today?',
    sectionTitle: 'Choose Your Favorite Topic!',
    back: 'Go Back',
    explore: 'Explore',
    categories: {
      alphabet: {
        title: 'Alphabet',
        description: 'Learn your ABCs!',
      },
      animals: {
        title: 'Animals',
        description: 'Meet animal friends!',
      },
      colors: {
        title: 'Colors',
        description: 'Explore the rainbow!',
      },
      fruits: {
        title: 'Fruits',
        description: 'Discover yummy fruits!',
      },
      shapes: {
        title: 'Shapes',
        description: 'Discover amazing shapes!',
      },
    },
    encouragementTitle: "You're Doing Amazing!",
    encouragementText:
      'Every new thing you learn makes you a language superstar!',
    comingSoon: 'This activity is coming soon!',
  },

  french: {
    activities: {
      lessons: 'Leçons',
      quizzes: 'Quiz',
      stories: 'Histoires',
      games: 'Jeux',
    },
    greeting: 'Bonjour, petit explorateur ! 🌟',
    question: "Qu'aimerais-tu découvrir aujourd'hui ?",
    sectionTitle: 'Choisis ton sujet préféré !',
    back: 'Retour',
    explore: 'Explorer',
    categories: {
      alphabet: {
        title: 'Alphabet',
        description: "Apprends l'alphabet !",
      },
      animals: {
        title: 'Animaux',
        description: 'Découvre les animaux !',
      },
      colors: {
        title: 'Couleurs',
        description: 'Explore les couleurs !',
      },
      fruits: {
        title: 'Fruits',
        description: 'Découvre les fruits !',
      },
      shapes: {
        title: 'Formes',
        description: 'Découvre les formes !',
      },
    },
    encouragementTitle: 'Bravo, petite star !',
    encouragementText:
      'Chaque jour, tu apprends quelque chose de nouveau !',
    comingSoon: 'Cette activité arrive bientôt !',
  },

  turkish: {
    activities: {
      lessons: 'Dersler',
      quizzes: 'Testler',
      stories: 'Hikâyeler',
      games: 'Oyunlar',
    },
    greeting: 'Merhaba, küçük kâşif! 🌟',
    question: 'Bugün ne keşfetmek istersin?',
    sectionTitle: 'En sevdiğin konuyu seç!',
    back: 'Geri Dön',
    explore: 'Keşfet',
    categories: {
      alphabet: {
        title: 'Alfabe',
        description: 'Alfabeyi öğren!',
      },
      animals: {
        title: 'Hayvanlar',
        description: 'Hayvan dostlarını tanı!',
      },
      colors: {
        title: 'Renkler',
        description: 'Renkleri keşfet!',
      },
      fruits: {
        title: 'Meyveler',
        description: 'Lezzetli meyveleri tanı!',
      },
      shapes: {
        title: 'Şekiller',
        description: 'Harika şekilleri öğren!',
      },
    },
    encouragementTitle: 'Harika gidiyorsun!',
    encouragementText:
      'Öğrendiğin her yeni şey seni daha da geliştirir!',
    comingSoon: 'Bu etkinlik yakında hazır olacak!',
  },

  spanish: {
    activities: {
      lessons: 'Lecciones',
      quizzes: 'Cuestionarios',
      stories: 'Cuentos',
      games: 'Juegos',
    },
    greeting: '¡Hola, pequeño explorador! 🌟',
    question: '¿Qué te gustaría explorar hoy?',
    sectionTitle: '¡Elige tu tema favorito!',
    back: 'Volver',
    explore: 'Explorar',
    categories: {
      alphabet: {
        title: 'Alfabeto',
        description: '¡Aprende el alfabeto!',
      },
      animals: {
        title: 'Animales',
        description: '¡Conoce a los animales!',
      },
      colors: {
        title: 'Colores',
        description: '¡Explora los colores!',
      },
      fruits: {
        title: 'Frutas',
        description: '¡Descubre frutas deliciosas!',
      },
      shapes: {
        title: 'Formas',
        description: '¡Descubre las formas!',
      },
    },
    encouragementTitle: '¡Lo estás haciendo genial!',
    encouragementText:
      '¡Cada cosa nueva que aprendes te convierte en una estrella!',
    comingSoon: '¡Esta actividad estará disponible pronto!',
  },

  chinese: {
    activities: {
      lessons: '课程',
      quizzes: '测验',
      stories: '故事',
      games: '游戏',
    },
    greeting: '你好，小小探险家！🌟',
    question: '今天你想探索什么？',
    sectionTitle: '选择你最喜欢的主题！',
    back: '返回',
    explore: '探索',
    categories: {
      alphabet: {
        title: '字母',
        description: '一起学习字母吧！',
      },
      animals: {
        title: '动物',
        description: '认识动物朋友！',
      },
      colors: {
        title: '颜色',
        description: '探索美丽的颜色！',
      },
      fruits: {
        title: '水果',
        description: '认识美味的水果！',
      },
      shapes: {
        title: '形状',
        description: '学习有趣的形状！',
      },
    },
    encouragementTitle: '你真棒！',
    encouragementText:
      '每天学习一点新知识，你就会越来越厉害！',
    comingSoon: '这个活动即将推出！',
  },

  swahili: {
    activities: {
      lessons: 'Masomo',
      quizzes: 'Majaribio',
      stories: 'Hadithi',
      games: 'Michezo',
    },
    greeting: 'Habari, mvumbuzi mdogo! 🌟',
    question: 'Ungependa kuchunguza nini leo?',
    sectionTitle: 'Chagua mada unayoipenda zaidi!',
    back: 'Rudi Nyuma',
    explore: 'Chunguza',
    categories: {
      alphabet: {
        title: 'Alfabeti',
        description: 'Jifunze alfabeti!',
      },
      animals: {
        title: 'Wanyama',
        description: 'Wafahamu marafiki wanyama!',
      },
      colors: {
        title: 'Rangi',
        description: 'Gundua rangi mbalimbali!',
      },
      fruits: {
        title: 'Matunda',
        description: 'Gundua matunda matamu!',
      },
      shapes: {
        title: 'Maumbo',
        description: 'Jifunze maumbo mbalimbali!',
      },
    },
    encouragementTitle: 'Unafanya vizuri sana!',
    encouragementText:
      'Kila jambo jipya unalojifunza linakufanya uwe bora zaidi!',
    comingSoon: 'Shughuli hii itapatikana hivi karibuni!',
  },
};

// Category cards
const categories: {
  id: CategoryId;
  emoji: string;
  color: string;
  englishName: string;
}[] = [
  {
    id: 'alphabet',
    emoji: '🔤',
    color: C.pink,
    englishName: 'Alphabet',
  },
  {
    id: 'animals',
    emoji: '🦁',
    color: C.green,
    englishName: 'Animals',
  },
  {
    id: 'colors',
    emoji: '🎨',
    color: C.blue,
    englishName: 'Colors',
  },
  {
    id: 'fruits',
    emoji: '🍎',
    color: C.yellow,
    englishName: 'Fruits',
  },
  {
    id: 'shapes',
    emoji: '🔺',
    color: '#E8DFFF',
    englishName: 'Shapes',
  },
];

export default function CategoriesScreen() {
  const params = useLocalSearchParams<{
    language?: string;
    activity?: string;
  }>();

  const languageId =
    typeof params.language === 'string'
      ? params.language.toLowerCase()
      : 'english';

  const activityId =
    typeof params.activity === 'string'
      ? params.activity.toLowerCase()
      : 'lessons';

  // Choose the correct language
  const t = translations[languageId] ?? translations.english;

  // Check which activity was selected
  const validActivity: ActivityId =
    activityId === 'lessons' ||
    activityId === 'quizzes' ||
    activityId === 'stories' ||
    activityId === 'games'
      ? activityId
      : 'lessons';

  // Back to Learning page
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/learning',
        params: {
          language: translations[languageId]
            ? languageId
            : 'english',
        },
      });
    }
  }

  // Navigate when a category is selected
  function handleCategoryPress(categoryId: CategoryId) {

    // MARY: English Lessons
    if (
      languageId === 'english' &&
      validActivity === 'lessons'
    ) {
      router.push({
        pathname: '/mary/lesson',
        params: {
          language: languageId,
          category: categoryId,
        },
      });
      return;
    }

    
    // MARY: English Quizzes
    // Open the quiz screen for the selected category.
    if (
      languageId === 'english' &&
      validActivity === 'quizzes'
    ) {
      router.push({
        pathname: '/mary/quiz',
        params: {
          language: languageId,
          category: categoryId,
        },
      });
      return;
    }


    // CINDY: All five English Stories
    if (
      languageId === 'english' &&
      validActivity === 'stories'
    ) {
      const storyRoutes = {
        alphabet: '/cindy/alphabet-story',
        animals: '/cindy/animal-story',
        colors: '/cindy/color-story',
        fruits: '/cindy/fruit-story',
        shapes: '/cindy/shapes-story',
      } as const;

      const storyRoute = storyRoutes[categoryId];

      router.push({
        pathname: storyRoute,
        params: {
          language: languageId,
          category: categoryId,
        },
      });
      return;
    }

    // CINDY: All five English Games
    if (
      languageId === 'english' &&
      validActivity === 'games'
    ) {
      const gameRoutes = {
        alphabet: '/cindy/alphabet-game',
        animals: '/cindy/animal-game',
        colors: '/cindy/colors-game',
        fruits: '/cindy/fruit-game',
        shapes: '/cindy/shapes-game',
      } as const;

      router.push({
        pathname: gameRoutes[categoryId],
        params: {
          language: languageId,
          category: categoryId,
          activity: 'games',
        },
      });
      return;
    }

    // Activities in other languages will be connected as developed.
    console.log(
      `Selected ${languageId} - ${validActivity} - ${categoryId}`
    );

    Alert.alert(
      t.categories[categoryId].title,
      t.comingSoon
    );
  }

 

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Back button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backText}>
            ← {t.back}
          </Text>
        </Pressable>

        {/* Welcome header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>
            🌈 📚 ✨
          </Text>

          <Text style={styles.greeting}>
            {t.greeting}
          </Text>

          <Text style={styles.headerTitle}>
            {t.activities[validActivity]}
          </Text>

          <Text style={styles.headerSubtitle}>
            {t.question}
          </Text>
        </View>

        {/* Category heading */}
        <Text style={styles.sectionTitle}>
          {t.sectionTitle} 🎉
        </Text>

        {/* Five category cards */}
        <View style={styles.grid}>
          {categories.map((category) => {
            const translated = t.categories[category.id];

            return (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityLabel={translated.title}
                onPress={() =>
                  handleCategoryPress(category.id)
                }
                style={({ pressed }) => [
                  styles.categoryCard,
                  {
                    backgroundColor: category.color,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.emojiCircle}>
                  <Text style={styles.categoryEmoji}>
                    {category.emoji}
                  </Text>
                </View>

                <Text style={styles.categoryTitle}>
                  {translated.title}
                </Text>

                {/* English hint for beginners */}
                {languageId !== 'english' && (
                  <Text style={styles.englishHint}>
                    {category.englishName}
                  </Text>
                )}

                <Text style={styles.categoryDescription}>
                  {translated.description}
                </Text>

                <View style={styles.exploreButton}>
                  <Text style={styles.exploreText}>
                    {t.explore} →
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Encouragement section */}
        <View style={styles.footerCard}>
          <Text style={styles.footerEmoji}>
            ⭐ 🏆 ⭐
          </Text>

          <Text style={styles.footerTitle}>
            {t.encouragementTitle}
          </Text>

          <Text style={styles.footerDescription}>
            {t.encouragementText}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 50,
  },

  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: C.blue,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 20,
  },

  backText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  header: {
    backgroundColor: C.blue,
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    marginBottom: 26,
  },

  headerEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },

  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primary,
    textAlign: 'center',
    marginBottom: 9,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    marginBottom: 17,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  categoryCard: {
    width: '48%',
    minHeight: 235,
    borderRadius: 25,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  categoryEmoji: {
    fontSize: 37,
  },

  categoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  englishHint: {
    fontSize: 11,
    fontWeight: '500',
    color: C.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  categoryDescription: {
    fontSize: 12,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 12,
  },

  exploreButton: {
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },

  exploreText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  footerCard: {
    backgroundColor: C.green,
    borderRadius: 25,
    padding: 22,
    alignItems: 'center',
  },

  footerEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },

  footerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  footerDescription: {

    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 9,
  },
});
