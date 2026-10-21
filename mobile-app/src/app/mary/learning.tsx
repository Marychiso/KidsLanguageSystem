
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Stack,
  router,
  useLocalSearchParams,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningColors as C } from '@/constants/learning-theme';

// Four available activities
type ActivityId =
  | 'lessons'
  | 'quizzes'
  | 'stories'
  | 'games';

type ActivityTranslation = {
  title: string;
  description: string;
};

type LearningTranslation = {
  greeting: string;
  heading: string;
  subtitle: string;
  badge: string;
  sectionTitle: string;
  back: string;
  explore: string;
  activities: Record<ActivityId, ActivityTranslation>;
  encouragementTitle: string;
  encouragementText: string;
};

// Language information and actual flag images
const languages: Record<
  string,
  {
    name: string;
    flag: ImageSourcePropType;
  }
> = {
  english: {
    name: 'English',
    flag: require('../../../assets/flags/english.png'),
  },
  french: {
    name: 'French',
    flag: require('../../../assets/flags/french.png'),
  },
  turkish: {
    name: 'Turkish',
    flag: require('../../../assets/flags/turkish.png'),
  },
  spanish: {
    name: 'Spanish',
    flag: require('../../../assets/flags/spanish.png'),
  },
  chinese: {
    name: 'Chinese',
    flag: require('../../../assets/flags/chinese.png'),
  },
  swahili: {
    name: 'Swahili',
    flag: require('../../../assets/flags/swahili.png'),
  },
};

// Translations for all six languages
const translations: Record<string, LearningTranslation> = {
  english: {
    greeting: 'Hello!',
    heading: "Let's Learn English!",
    subtitle: 'Pick something fun to do today!',
    badge: '🌟 Every word is a new adventure!',
    sectionTitle: 'Choose Your Adventure!',
    back: 'Go Back',
    explore: 'Explore',
    activities: {
      lessons: {
        title: 'Lessons',
        description: 'Discover new words!',
      },
      quizzes: {
        title: 'Quizzes',
        description: 'Show what you know!',
      },
      stories: {
        title: 'Stories',
        description: 'Explore magical tales!',
      },
      games: {
        title: 'Games',
        description: 'Play and learn!',
      },
    },
    encouragementTitle: 'Keep Going, Superstar!',
    encouragementText:
      'Every little step makes you a better language learner!',
  },

  french: {
    greeting: 'Bonjour !',
    heading: 'Apprenons le français !',
    subtitle: "Choisis une activité amusante aujourd'hui !",
    badge: '🌟 Chaque mot est une nouvelle aventure !',
    sectionTitle: 'Choisis ton aventure !',
    back: 'Retour',
    explore: 'Explorer',
    activities: {
      lessons: {
        title: 'Leçons',
        description: 'Découvre de nouveaux mots !',
      },
      quizzes: {
        title: 'Quiz',
        description: 'Montre ce que tu sais !',
      },
      stories: {
        title: 'Histoires',
        description: 'Découvre des histoires magiques !',
      },
      games: {
        title: 'Jeux',
        description: 'Joue et apprends !',
      },
    },
    encouragementTitle: 'Continue, petite star !',
    encouragementText:
      'Chaque petit pas te fait progresser !',
  },

  turkish: {
    greeting: 'Merhaba!',
    heading: 'Haydi Türkçe öğrenelim!',
    subtitle: 'Bugün eğlenceli bir etkinlik seç!',
    badge: '🌟 Her kelime yeni bir macera!',
    sectionTitle: 'Maceranı seç!',
    back: 'Geri Dön',
    explore: 'Keşfet',
    activities: {
      lessons: {
        title: 'Dersler',
        description: 'Yeni kelimeler öğren!',
      },
      quizzes: {
        title: 'Testler',
        description: 'Bildiklerini göster!',
      },
      stories: {
        title: 'Hikâyeler',
        description: 'Büyülü hikâyeleri keşfet!',
      },
      games: {
        title: 'Oyunlar',
        description: 'Oyna ve öğren!',
      },
    },
    encouragementTitle: 'Devam et, küçük yıldız!',
    encouragementText:
      'Her küçük adım seni daha iyi bir öğrenci yapar!',
  },

  spanish: {
    greeting: '¡Hola!',
    heading: '¡Aprendamos español!',
    subtitle: '¡Elige una actividad divertida para hoy!',
    badge: '🌟 ¡Cada palabra es una nueva aventura!',
    sectionTitle: '¡Elige tu aventura!',
    back: 'Volver',
    explore: 'Explorar',
    activities: {
      lessons: {
        title: 'Lecciones',
        description: '¡Descubre nuevas palabras!',
      },
      quizzes: {
        title: 'Cuestionarios',
        description: '¡Demuestra lo que sabes!',
      },
      stories: {
        title: 'Cuentos',
        description: '¡Descubre cuentos mágicos!',
      },
      games: {
        title: 'Juegos',
        description: '¡Juega y aprende!',
      },
    },
    encouragementTitle: '¡Sigue adelante, pequeña estrella!',
    encouragementText:
      '¡Cada pequeño paso te ayuda a aprender más!',
  },

  chinese: {
    greeting: '你好！',
    heading: '一起学中文吧！',
    subtitle: '今天选择一个有趣的活动吧！',
    badge: '🌟 每个词语都是一次新的冒险！',
    sectionTitle: '选择你的冒险！',
    back: '返回',
    explore: '探索',
    activities: {
      lessons: {
        title: '课程',
        description: '学习新词语！',
      },
      quizzes: {
        title: '测验',
        description: '展示你学到的知识！',
      },
      stories: {
        title: '故事',
        description: '探索神奇的故事！',
      },
      games: {
        title: '游戏',
        description: '边玩边学！',
      },
    },
    encouragementTitle: '继续加油，小明星！',
    encouragementText:
      '每前进一步，你都会学到更多知识！',
  },

  swahili: {
    greeting: 'Jambo!',
    heading: 'Tujifunze Kiswahili!',
    subtitle: 'Chagua shughuli ya kufurahisha leo!',
    badge: '🌟 Kila neno ni mwanzo wa safari mpya!',
    sectionTitle: 'Chagua safari yako!',
    back: 'Rudi Nyuma',
    explore: 'Chunguza',
    activities: {
      lessons: {
        title: 'Masomo',
        description: 'Jifunze maneno mapya!',
      },
      quizzes: {
        title: 'Majaribio',
        description: 'Onyesha unachojua!',
      },
      stories: {
        title: 'Hadithi',
        description: 'Gundua hadithi za ajabu!',
      },
      games: {
        title: 'Michezo',
        description: 'Cheza na ujifunze!',
      },
    },
    encouragementTitle: 'Endelea kujifunza, nyota mdogo!',
    encouragementText:
      'Kila hatua ndogo inakusaidia kujifunza zaidi!',
  },
};

// Activity card appearance
const activities: {
  id: ActivityId;
  emoji: string;
  color: string;
}[] = [
  {
    id: 'lessons',
    emoji: '📚',
    color: C.pink,
  },
  {
    id: 'quizzes',
    emoji: '🧠',
    color: C.blue,
  },
  {
    id: 'stories',
    emoji: '📖',
    color: '#E8DFFF',
  },
  {
    id: 'games',
    emoji: '🎮',
    color: C.yellow,
  },
];

// Floating animation
function AdventureAnimation() {
  const floatValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [floatValue]);

  const floatY = floatValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, -12],
  });

  return (
    <Animated.View
      style={[
        styles.animationContainer,
        {
          transform: [{ translateY: floatY }],
        },
      ]}
    >
      <Text style={styles.animationEmoji}>
        🌍 🚀 ✨
      </Text>
    </Animated.View>
  );
}

export default function LearningScreen() {
  // Read the selected language from navigation
  const params = useLocalSearchParams<{
    language?: string;
  }>();

  const requestedLanguage =
    typeof params.language === 'string'
      ? params.language.toLowerCase()
      : '';

  // Use English as a safe fallback
  const languageId = languages[requestedLanguage]
    ? requestedLanguage
    : 'english';

  const selectedLanguage = languages[languageId];
  const t = translations[languageId];

  // Back navigation
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/mary/language-selection');
    }
  }

  // Navigate to the translated Category Selection screen
  function handleActivityPress(activity: ActivityId) {
    router.push({
      pathname: '/mary/categories',
      params: {
        language: languageId,
        activity: activity,
      },
    });
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
          accessibilityLabel={t.back}
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

        {/* Multilingual welcome header */}
        <View style={styles.welcomeCard}>
          <AdventureAnimation />

          {/* Actual flag image */}
          <View style={styles.flagContainer}>
            <Image
              source={selectedLanguage.flag}
              style={styles.flagImage}
              resizeMode="contain"
              accessibilityLabel={`${selectedLanguage.name} flag`}
            />
          </View>

          <Text style={styles.greeting}>
            {t.greeting}
          </Text>

          <Text style={styles.welcomeTitle}>
            {t.heading}
          </Text>

          <Text style={styles.welcomeSubtitle}>
            {t.subtitle}
          </Text>

          <View style={styles.welcomeBadge}>
            <Text style={styles.welcomeBadgeText}>
              {t.badge}
            </Text>
          </View>
        </View>

        {/* Translated activity heading */}
        <Text style={styles.sectionTitle}>
          {t.sectionTitle} 🎉
        </Text>

        {/* Four multilingual activity cards */}
        <View style={styles.activityGrid}>
          {activities.map((activity) => {
            const translated = t.activities[activity.id];

            return (
              <Pressable
                key={activity.id}
                accessibilityRole="button"
                accessibilityLabel={translated.title}
                onPress={() =>
                  handleActivityPress(activity.id)
                }
                style={({ pressed }) => [
                  styles.activityCard,
                  { backgroundColor: activity.color },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.emojiCircle}>
                  <Text style={styles.activityEmoji}>
                    {activity.emoji}
                  </Text>
                </View>

                <Text style={styles.activityTitle}>
                  {translated.title}
                </Text>

                <Text style={styles.activityDescription}>
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

        {/* Multilingual encouragement */}
        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementEmoji}>
            ⭐🏆⭐
          </Text>

          <Text style={styles.encouragementTitle}>
            {t.encouragementTitle}
          </Text>

          <Text style={styles.encouragementText}>
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

  // Back button
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

  // Welcome card
  welcomeCard: {
    backgroundColor: C.blue,
    borderRadius: 30,
    padding: 22,
    alignItems: 'center',
    marginBottom: 26,
    overflow: 'hidden',
  },

  animationContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },

  animationEmoji: {
    fontSize: 43,
  },

  // Actual flag image
  flagContainer: {
    width: 98,
    height: 82,
    backgroundColor: C.white,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 14,
  },

  flagImage: {
    width: 76,
    height: 53,
  },

  greeting: {
    fontSize: 19,
    fontWeight: '800',
    color: C.primary,
    marginBottom: 8,
  },

  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  welcomeSubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
  },

  welcomeBadge: {
    backgroundColor: C.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  welcomeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
    textAlign: 'center',
  },

  // Activity heading
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginBottom: 16,
  },

  // Activity grid
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  activityCard: {
    width: '48%',
    minHeight: 225,
    borderRadius: 25,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiCircle: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  activityEmoji: {
    fontSize: 38,
  },

  activityTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  activityDescription: {
    fontSize: 12,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 13,
  },

  exploreButton: {
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  exploreText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  // Encouragement card
  encouragementCard: {
    backgroundColor: C.green,
    borderRadius: 25,
    padding: 22,
    alignItems: 'center',
  },

  encouragementEmoji: {
    fontSize: 33,
    marginBottom: 10,
  },

  encouragementTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  encouragementText: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
  },
});
