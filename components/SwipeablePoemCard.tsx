import { BlurView } from "expo-blur";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { PoemCard as PoemCardType, SwipeDirection } from "@/types";

type SwipeFeedback = "like" | "dislike" | "";

const ROTATION_MAX = 10;

interface SwipeablePoemCardProps {
  card: PoemCardType;
  index: number;
  onSwipe: (direction: SwipeDirection) => void;
  isActive: boolean;
}

export const SwipeablePoemCard: React.FC<SwipeablePoemCardProps> = ({
  card,
  index,
  onSwipe,
  isActive,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const swipeThreshold = screenWidth * 0.3;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isActive ? 1 : 0.95);
  const opacity = useSharedValue(isActive ? 1 : 0.8);
  const [feedbackType, setFeedbackType] = useState<SwipeFeedback>("");

  useEffect(() => {
    scale.value = withTiming(isActive ? 1 : 0.95, { duration: 200 });
    opacity.value = withTiming(isActive ? 1 : 0.8, { duration: 200 });
  }, [isActive, scale, opacity]);

  const panGesture = Gesture.Pan()
    .enabled(isActive)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const absX = Math.abs(event.translationX);
      const absY = Math.abs(event.translationY);

      if (absX > swipeThreshold) {
        const direction: SwipeDirection =
          event.translationX > 0 ? "right" : "left";

        // 즉시 콜백 호출 (상태 업데이트는 지연 없이 실행)
        runOnJS(onSwipe)(direction);

        // 카드를 화면 밖으로 이동 (애니메이션은 백그라운드에서 실행)
        const finalX =
          event.translationX > 0 ? screenWidth + 100 : -screenWidth - 100;
        translateX.value = withSpring(finalX, { damping: 15 });
        translateY.value = withSpring(event.translationY * 2, { damping: 15 });
        opacity.value = withTiming(0, { duration: 200 });
      } else if (absY > swipeThreshold) {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      } else {
        // 원래 위치로 복귀
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      [-ROTATION_MAX, 0, ROTATION_MAX],
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const feedbackOpacity = useDerivedValue(() => {
    return Math.abs(translateX.value) > 50
      ? Math.min(Math.abs(translateX.value) / 100, 1)
      : 0;
  });

  const feedbackTextStyle = useAnimatedStyle(() => {
    const opacity = feedbackOpacity.value;
    return {
      opacity,
    };
  });

  // 피드백 타입 업데이트 (오버레이 + 아이콘)
  useAnimatedReaction(
    () => translateX.value,
    (value) => {
      if (Math.abs(value) > 50) {
        runOnJS(setFeedbackType)(value > 0 ? "like" : "dislike");
      } else {
        runOnJS(setFeedbackType)("");
      }
    },
  );

  return (
    <GestureDetector gesture={panGesture}>
      <Box className="absolute w-[90%] max-w-[400px] self-center z-[1]">
        <Animated.View style={[cardStyle, { width: "100%" }]}>
          <BlurView intensity={80} tint="dark" style={styles.card}>
            <Animated.View
              className="absolute inset-0 rounded-[20px] justify-center items-center z-10"
              style={[
                feedbackTextStyle,
                feedbackType === "like" && {
                  backgroundColor: "rgba(76, 175, 80, 0.5)",
                },
                feedbackType === "dislike" && {
                  backgroundColor: "rgba(244, 67, 54, 0.5)",
                },
              ]}
              pointerEvents="none"
            >
              {feedbackType !== "" && (
                <MaterialIcons
                  name={feedbackType === "like" ? "thumb-up" : "thumb-down"}
                  size={64}
                  color="#FFFFFF"
                />
              )}
            </Animated.View>
            <Box className="flex-1 justify-center items-center">
              <Text className="text-2xl font-bold text-typography-0 leading-9 text-center">
                {card.Poem_Text_KR}
              </Text>
            </Box>
            <Box className="mt-4 pt-4 border-t border-white/20">
              <Text className="text-sm font-semibold text-white/80 text-center uppercase tracking-wider">
                {card.Tag}
              </Text>
            </Box>
          </BlurView>
        </Animated.View>
      </Box>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    aspectRatio: 0.7,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 24,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
});
