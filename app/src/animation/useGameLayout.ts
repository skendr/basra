import { useState, useCallback, useMemo } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { cardDimensions } from '../theme';
import type { BoardDimensions, GameLayout, ZoneLayout } from './types';

const CARD_W = cardDimensions.width;
const CARD_H = cardDimensions.height;
const SMALL_SCALE = 0.7;
const SMALL_W = CARD_W * SMALL_SCALE;
const SMALL_H = CARD_H * SMALL_SCALE;

/**
 * Hand fan: cards spread with ~55px gap (max),
 * slight parabolic arc (6px height), rotation ±0.04rad from center.
 */
export function getHandPositions(
  count: number,
  zoneCenter: { x: number; y: number },
  maxGap: number = 55,
  boardWidth: number = 400
): { x: number; y: number; rotation: number }[] {
  if (count === 0) return [];
  // Scale gap for small screens so cards don't overflow
  const scaledMax = Math.min(maxGap, boardWidth * 0.14);
  const gap = Math.min(scaledMax, 55);
  const totalWidth = gap * (count - 1);
  const startX = zoneCenter.x - totalWidth / 2;
  const positions: { x: number; y: number; rotation: number }[] = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1; // -1 to 1
    positions.push({
      x: startX + i * gap,
      y: zoneCenter.y + Math.abs(t) * 6, // gentle arc
      rotation: t * 0.04,
    });
  }
  return positions;
}

/**
 * Opponent hand: smaller, tighter spacing.
 */
export function getOpponentHandPositions(
  count: number,
  zoneCenter: { x: number; y: number }
): { x: number; y: number; rotation: number }[] {
  if (count === 0) return [];
  const gap = 28;
  const totalWidth = gap * (count - 1);
  const startX = zoneCenter.x - totalWidth / 2;
  const positions: { x: number; y: number; rotation: number }[] = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
    positions.push({
      x: startX + i * gap,
      y: zoneCenter.y + Math.abs(t) * 3,
      rotation: t * 0.03,
    });
  }
  return positions;
}

/**
 * Table scatter: centered grid with ±6px jitter for organic feel.
 */
export function getTablePositions(
  count: number,
  zone: ZoneLayout
): { x: number; y: number; rotation: number }[] {
  if (count === 0) return [];
  const cols = Math.min(5, count);
  const colGap = SMALL_W + 12;
  const rowGap = SMALL_H + 8;
  const rows = Math.ceil(count / cols);
  const gridWidth = cols * colGap;
  const gridHeight = rows * rowGap;

  // Center the grid both horizontally and vertically in the zone
  const baseX = zone.x + (zone.width - gridWidth) / 2 + colGap / 2;
  const baseY = zone.y + (zone.height - gridHeight) / 2 + rowGap / 2;

  const positions: { x: number; y: number; rotation: number }[] = [];

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // Deterministic jitter from index
    const jx = ((i * 7 + 3) % 13) - 6;
    const jy = ((i * 11 + 5) % 13) - 6;
    const jr = ((i * 13 + 2) % 9 - 4) * 0.015;
    positions.push({
      x: baseX + col * colGap + jx,
      y: baseY + row * rowGap + jy,
      rotation: jr,
    });
  }
  return positions;
}

export function useGameLayout() {
  const [board, setBoard] = useState<BoardDimensions>({ width: 0, height: 0 });

  const onBoardLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBoard({ width, height });
  }, []);

  const layout = useMemo<GameLayout | null>(() => {
    if (board.width === 0 || board.height === 0) return null;
    const { width: W, height: H } = board;

    const opponentHand: ZoneLayout = {
      x: 0,
      y: 0,
      width: W,
      height: H * 0.08,
    };

    const opponentPile: ZoneLayout = {
      x: W - 56,
      y: H * 0.09,
      width: 46,
      height: 64,
    };

    const table: ZoneLayout = {
      x: 12,
      y: H * 0.17,
      width: W - 24,
      height: H * 0.40,
    };

    const deck: ZoneLayout = {
      x: 16,
      y: H * 0.61,
      width: CARD_W + 10,
      height: CARD_H + 10,
    };

    const myPile: ZoneLayout = {
      x: W - 56,
      y: H * 0.61,
      width: 46,
      height: 64,
    };

    const myHand: ZoneLayout = {
      x: 0,
      y: H * 0.76,
      width: W,
      height: H * 0.24,
    };

    return {
      board,
      opponentHand,
      opponentPile,
      table,
      deck,
      myPile,
      myHand,
    };
  }, [board]);

  return { layout, onBoardLayout, board };
}
