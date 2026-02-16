import { Card, BasraType } from './types';
import { DIAMOND_7_ID } from './constants';

/**
 * Detect if a capture results in a basra.
 * A basra occurs when ALL cards are captured from the table, leaving it empty.
 *
 * - Jack basra: 30 pts
 * - Diamond 7 basra: 10 pts
 * - Regular basra: 10 pts
 */
export function detectBasra(
  played: Card,
  tableBefore: Card[],
  capturedCards: Card[]
): BasraType {
  // No capture happened -> not basra
  if (capturedCards.length === 0) return 'none';

  // Table was empty -> not basra
  if (tableBefore.length === 0) return 'none';

  // Must capture ALL cards on the table
  if (capturedCards.length !== tableBefore.length) return 'none';

  // Jack sweeps all cards by default — that's not a basra
  if (played.rank === 'J') return 'none';

  // Diamond 7 or regular numeral basra (10 pts)
  return 'basra';
}
