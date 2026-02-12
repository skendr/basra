import { Card, CaptureResult } from './types';
import { DIAMOND_7_ID } from './constants';
import { detectBasra } from './basra';

function isJack(card: Card): boolean {
  return card.rank === 'J';
}

function isDiamond7(card: Card): boolean {
  return card.id === DIAMOND_7_ID;
}

/**
 * Find all subsets of `cards` whose values sum to `target`.
 * Returns an array of card arrays (each inner array is one valid subset).
 */
function findSubsetsWithSum(cards: Card[], target: number): Card[][] {
  const results: Card[][] = [];

  function backtrack(start: number, current: Card[], currentSum: number) {
    if (currentSum === target && current.length > 0) {
      results.push([...current]);
    }
    if (currentSum >= target) return;

    for (let i = start; i < cards.length; i++) {
      current.push(cards[i]);
      backtrack(i + 1, current, currentSum + cards[i].value);
      current.pop();
    }
  }

  backtrack(0, [], 0);
  return results;
}

/**
 * Given a played card and the current table cards, determine what gets captured.
 *
 * Rules:
 * - Jack or Diamond 7: sweep all table cards
 * - Queen: captures only other Queens
 * - King: captures only other Kings
 * - Numeral (A, 2-10): captures cards of same rank + any combination of numerals summing to its value
 */
export function findCaptures(played: Card, table: Card[]): Card[] {
  if (table.length === 0) return [];

  // Jack sweeps all
  if (isJack(played)) {
    return [...table];
  }

  // Diamond 7 sweeps all
  if (isDiamond7(played)) {
    return [...table];
  }

  // Queen captures only queens
  if (played.rank === 'Q') {
    const queens = table.filter(c => c.rank === 'Q');
    return queens.length > 0 ? queens : [];
  }

  // King captures only kings
  if (played.rank === 'K') {
    const kings = table.filter(c => c.rank === 'K');
    return kings.length > 0 ? kings : [];
  }

  // Numeral card: capture same rank + sum combinations
  const sameRank = table.filter(c => c.rank === played.rank);
  const remaining = table.filter(
    c => !sameRank.includes(c) && c.value > 0 // exclude face cards and same-rank cards
  );

  const sumSubsets = findSubsetsWithSum(remaining, played.value);

  // Combine: same rank cards + all cards from sum subsets (deduplicated)
  const captured = new Set<Card>(sameRank);
  for (const subset of sumSubsets) {
    for (const card of subset) {
      captured.add(card);
    }
  }

  return captured.size > 0 ? Array.from(captured) : [];
}

/**
 * Process a card play: find captures and detect basra.
 */
export function processPlay(played: Card, table: Card[]): CaptureResult {
  const captured = findCaptures(played, table);
  const basraType = detectBasra(played, table, captured);

  return { captured, basraType };
}
