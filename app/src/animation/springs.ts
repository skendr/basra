import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';

// Spring configs
export const SPRING_CARD: WithSpringConfig = {
  damping: 12,
  stiffness: 100,
  mass: 0.8,
};

export const SPRING_QUICK: WithSpringConfig = {
  damping: 15,
  stiffness: 200,
  mass: 0.6,
};

export const SPRING_BOUNCY: WithSpringConfig = {
  damping: 6,
  stiffness: 150,
  mass: 1.0,
};

export const SPRING_SETTLE: WithSpringConfig = {
  damping: 14,
  stiffness: 80,
  mass: 1.0,
};

export const SPRING_HEAVY: WithSpringConfig = {
  damping: 18,
  stiffness: 120,
  mass: 1.2,
};

// Timing configs
export const TIMING_FLIP: WithTimingConfig = {
  duration: 100,
  easing: Easing.inOut(Easing.ease),
};

export const TIMING_FAST: WithTimingConfig = {
  duration: 150,
  easing: Easing.out(Easing.ease),
};

// Durations (ms)
export const DEAL_STAGGER = 120;
export const CAPTURE_FLY_STAGGER = 30;
export const TABLE_FLY_STAGGER = 50;
export const CAPTURE_PAUSE = 150;
export const ROUND_END_DELAY = 800;
export const ROUND_END_PAUSE = 600;
export const SHUFFLE_CYCLE_MS = 80;
export const SHUFFLE_CYCLES = 5;

// Drag
export const DRAG_SCALE = 1.1;
export const PREVIEW_WOBBLE_SCALE = 1.15;
