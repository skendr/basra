import {
  withSpring,
  withTiming,
  type SharedValue,
  type WithSpringConfig,
  type WithTimingConfig,
  runOnJS,
} from 'react-native-reanimated';

/**
 * Promise-wrapped spring animation.
 * Animates a shared value and resolves when the animation completes.
 */
export function animateSpring(
  sv: SharedValue<number>,
  toValue: number,
  config: WithSpringConfig
): Promise<void> {
  return new Promise((resolve) => {
    sv.value = withSpring(toValue, config, (finished) => {
      if (finished !== false) {
        runOnJS(resolve)();
      } else {
        runOnJS(resolve)();
      }
    });
  });
}

/**
 * Promise-wrapped timing animation.
 */
export function animateTiming(
  sv: SharedValue<number>,
  toValue: number,
  config: WithTimingConfig
): Promise<void> {
  return new Promise((resolve) => {
    sv.value = withTiming(toValue, config, (finished) => {
      if (finished !== false) {
        runOnJS(resolve)();
      } else {
        runOnJS(resolve)();
      }
    });
  });
}

/**
 * Animate position (x, y) simultaneously with spring.
 */
export function animatePosition(
  entity: { x: SharedValue<number>; y: SharedValue<number> },
  toX: number,
  toY: number,
  config: WithSpringConfig
): Promise<void> {
  // Both run simultaneously, resolve when both done
  return Promise.all([
    animateSpring(entity.x, toX, config),
    animateSpring(entity.y, toY, config),
  ]).then(() => {});
}

/**
 * JS-side delay (for sequencing between animations).
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fire-and-forget spring (no await, for parallel non-critical animations).
 */
export function fireSpring(
  sv: SharedValue<number>,
  toValue: number,
  config: WithSpringConfig
): void {
  sv.value = withSpring(toValue, config);
}

/**
 * Fire-and-forget timing.
 */
export function fireTiming(
  sv: SharedValue<number>,
  toValue: number,
  config: WithTimingConfig
): void {
  sv.value = withTiming(toValue, config);
}
