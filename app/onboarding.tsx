import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import {
  ONBOARDING_SLIDES,
  type OnboardingSlide,
} from "@/constants/onboarding-slides";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_500 = { light: "#DB2777", dark: "#EC4899" };

const ONBOARDING_DONE_KEY = "@kokoro/onboarding_done";

function SlideItem({
  item,
  width,
  paddingBottom,
}: {
  item: OnboardingSlide;
  width: number;
  paddingBottom: number;
}) {
  return (
    <Box className="flex-1 justify-center items-center" style={{ width }}>
      <Box
        className="px-8 gap-4 items-center"
        style={{ paddingBottom: paddingBottom + 80 }}
      >
        {/* Image */}
        {item.image != null && (
          <Image
            source={item.image}
            style={{ width: 200, height: 200, borderRadius: 200 }}
            contentFit="cover"
          />
        )}

        <Heading
          size="2xl"
          className="text-typography-900 dark:text-typography-0 font-bold text-center mt-3"
        >
          {item.title}
        </Heading>

        <Text
          size="sm"
          className="text-typography-500 dark:text-typography-400 leading-6 text-center"
        >
          {item.description}
        </Text>
      </Box>
    </Box>
  );
}

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const primaryColor = PRIMARY_500[colorScheme];
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const completeOnboarding = () => {
    AsyncStorage.setItem(ONBOARDING_DONE_KEY, "true");
    router.replace("/login");
  };

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex >= ONBOARDING_SLIDES.length - 1) {
      completeOnboarding();
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToOffset({
      offset: nextIndex * width,
      animated: true,
    });
  };

  return (
    <Box className="flex-1 bg-background-0">
      <Box
        className="absolute top-0 right-0 z-10 px-8 pt-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Pressable
          onPress={completeOnboarding}
          className="py-3 px-3 min-h-12 justify-center"
        >
          <Text size="lg" className="text-typography-400 font-semibold">
            SKIP
          </Text>
        </Pressable>
      </Box>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item }) => (
          <SlideItem
            item={item}
            width={width}
            paddingBottom={insets.bottom}
          />
        )}
      />

      {/* Bottom row: Dots (left) + Next (right) - same y-axis */}
      <Box
        className="absolute bottom-0 left-0 right-0 z-10 flex-row items-center justify-between px-8 min-h-12"
        style={{ paddingBottom: insets.bottom + 32 }}
      >
        <Box className="flex-row gap-2">
          {ONBOARDING_SLIDES.map((_, i) => (
            <Box
              key={i}
              className={`h-2 rounded-full ${
                i === currentIndex ? "bg-primary-500 w-8" : "bg-gray-300 w-2"
              }`}
            />
          ))}
        </Box>
        <Pressable
          onPress={goToNext}
          className="active:opacity-70 flex-row items-center gap-1 py-3 px-3"
        >
          <Text size="lg" className="text-primary-500 font-bold">
            {currentIndex >= ONBOARDING_SLIDES.length - 1
              ? "시작하기"
              : "다음"}
          </Text>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={primaryColor}
          />
        </Pressable>
      </Box>
    </Box>
  );
}
