import { useCallback } from 'react';
import {
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export function useCardAnimation() {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const playToTable = useCallback(() => {
    translateY.value = withSpring(-200, { damping: 12, stiffness: 100 });
    scale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
  }, []);

  const captureAnimation = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) })
    );
    opacity.value = withTiming(0, { duration: 450 });
  }, []);

  const dealAnimation = useCallback((delay: number = 0) => {
    scale.value = 0;
    opacity.value = 0;
    translateY.value = -100;

    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 80 });
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 12, stiffness: 80 });
    }, delay);
  }, []);

  const basraCelebration = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.5, { duration: 200 }),
      withSpring(1, { damping: 5, stiffness: 100 })
    );
    rotate.value = withSequence(
      withTiming(-0.1, { duration: 100 }),
      withTiming(0.1, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  }, []);

  return {
    scale,
    translateY,
    rotate,
    opacity,
    playToTable,
    captureAnimation,
    dealAnimation,
    basraCelebration,
  };
}
