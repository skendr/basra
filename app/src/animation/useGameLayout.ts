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
 * Compute hand fan positions: cards spread with ~50px gap (max),
 * slight parabolic arc (8px height), rotation ±0.04rad from center.
 */
export function getHandPositions(
  count: number,
  zoneCenter: { x: number; y: number },
  maxGap: number = 50
): { x: number; y: number; rotation: number }[] {
  if (count === 0) return [];
  const totalWidth = Math.min(maxGap, 50) * (count - 1);
  const startX = zoneCenter.x - totalWidth / 2;
  const positions: { x: number; y: number; rotation: number }[] = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1; // -1 to 1
    const x = startX + i * Math.min(maxGap, 50);
    const y = zoneCenter.y + Math.abs(t) * 8; // parabolic arc
    const rotation = t * 0.04;
    positions.push({ x, y, rotation });
  }
  return positions;
}

/**
 * Opponent hand positions: smaller, tighter spacing.
 */
export function getOpponentHandPositions(
  count: number,
  zoneCenter: { x: number; y: number }
): { x: number; y: number; rotation: number }[] {
  if (count === 0) return [];
  const gap = 25;
  const totalWidth = gap * (count - 1);
  const startX = zoneCenter.x - totalWidth / 2;
  const positions: { x: number; y: number; rotation: number }[] = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
    positions.push({
      x: startX + i * gap,
      y: zoneCenter.y + Math.abs(t) * 4,
      rotation: t * 0.03,
    });
  }
  return positions;
}

/**
 * Table scatter: 5-column grid with ±7px jitter for organic feel.
 * Uses deterministic jitter based on index for consistency.
 */
export function getTablePositions(
  count: number,
  zone: ZoneLayout
): { x: number; y: number; rotation: number }[] {
  if (count === 0) return [];
  const cols = Math.min(5, count);
  const colGap = SMALL_W + 8;
  const rowGap = SMALL_H + 4;
  const gridWidth = cols * colGap;
  const startX = zone.x + (zone.width - gridWidth) / 2 + colGap / 2;
  const startY = zone.y + 10;
  const positions: { x: number; y: number; rotation: number }[] = [];

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // Deterministic jitter from index
    const jx = ((i * 7 + 3) % 15) - 7;
    const jy = ((i * 11 + 5) % 15) - 7;
    const jr = ((i * 13 + 2) % 9 - 4) * 0.02;
    positions.push({
      x: startX + col * colGap + jx,
      y: startY + row * rowGap + jy,
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

    // Zone bands (top to bottom percentages)
    const opponentHand: ZoneLayout = {
      x: 0,
      y: H * 0.0,
      width: W,
      height: H * 0.06,
    };

    const opponentPile: ZoneLayout = {
      x: W - SMALL_W - 20,
      y: H * 0.07,
      width: SMALL_W + 10,
      height: SMALL_H + 10,
    };

    const table: ZoneLayout = {
      x: 10,
      y: H * 0.18,
      width: W - 20,
      height: H * 0.38,
    };

    const deck: ZoneLayout = {
      x: 20,
      y: H * 0.60,
      width: CARD_W + 10,
      height: CARD_H + 10,
    };

    const myPile: ZoneLayout = {
      x: W - SMALL_W - 20,
      y: H * 0.60,
      width: SMALL_W + 10,
      height: SMALL_H + 10,
    };

    const myHand: ZoneLayout = {
      x: 0,
      y: H * 0.78,
      width: W,
      height: H * 0.22,
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
