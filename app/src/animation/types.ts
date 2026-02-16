import type { Card } from '@basra/shared';
import type { SharedValue } from 'react-native-reanimated';

export type Zone =
  | 'deck'
  | 'hand'
  | 'opponentHand'
  | 'table'
  | 'myPile'
  | 'opponentPile';

export interface CardEntity {
  id: string;
  card: Card | null; // null for face-down unknowns
  faceUp: boolean;
  zone: Zone;
  // Shared values (makeMutable)
  x: SharedValue<number>;
  y: SharedValue<number>;
  rotation: SharedValue<number>;
  scale: SharedValue<number>;
  scaleX: SharedValue<number>;
  opacity: SharedValue<number>;
  zIndex: SharedValue<number>;
  // Drag state
  isDragging: SharedValue<number>; // 0 or 1 (worklet-friendly)
  dragOffsetX: SharedValue<number>;
  dragOffsetY: SharedValue<number>;
}

export interface ZoneLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoardDimensions {
  width: number;
  height: number;
}

export interface GameLayout {
  board: BoardDimensions;
  opponentHand: ZoneLayout;
  opponentPile: ZoneLayout;
  table: ZoneLayout;
  deck: ZoneLayout;
  myPile: ZoneLayout;
  myHand: ZoneLayout;
}

export type AnimationEventType =
  | 'game-start'
  | 'cards-dealt'
  | 'my-play'
  | 'opponent-play'
  | 'round-end';

export interface AnimationEvent {
  type: AnimationEventType;
  payload: any;
}
