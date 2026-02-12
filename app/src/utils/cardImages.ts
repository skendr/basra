import { Suit, Rank } from '@basra/shared';

const suitSymbols: Record<Suit, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

const suitColors: Record<Suit, string> = {
  hearts: '#e74c3c',
  diamonds: '#e74c3c',
  clubs: '#2c3e50',
  spades: '#2c3e50',
};

export function getSuitSymbol(suit: Suit): string {
  return suitSymbols[suit];
}

export function getSuitColor(suit: Suit): string {
  return suitColors[suit];
}

export function getDisplayRank(rank: Rank): string {
  return rank;
}
