import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { colors, fontSize } from '../theme';
import { basraVibration } from '../utils/haptics';

interface BasraToastProps {
  visible: boolean;
  isJackBasra: boolean;
  onHide: () => void;
}

export default function BasraToast({ visible, isJackBasra, onHide }: BasraToastProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      basraVibration();
      scale.value = withSequence(
        withSpring(1.3, { damping: 5, stiffness: 200 }),
        withSpring(1, { damping: 8 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1500, withTiming(0, { duration: 400 }, () => {
          runOnJS(onHide)();
        }))
      );
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.Text style={[styles.text, isJackBasra && styles.jackText]}>
        {isJackBasra ? 'JACK BASRA!' : 'BASRA!'}
      </Animated.Text>
      <Animated.Text style={styles.points}>
        +{isJackBasra ? 30 : 10} pts
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(233, 69, 96, 0.95)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    zIndex: 100,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  text: {
    fontSize: fontSize.xxl,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 4,
  },
  jackText: {
    color: colors.accent,
  },
  points: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
});
