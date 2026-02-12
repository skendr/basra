import { Rank, Suit } from './types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const RANK_VALUES: Record<Rank, number> = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 0,
  'Q': 0,
  'K': 0,
};

export const CARDS_PER_DEAL = 4;
export const INITIAL_TABLE_CARDS = 4;
export const TOTAL_CARDS = 52;

// Scoring
export const MOST_CARDS_BONUS = 30;
export const BASRA_POINTS = 10;
export const JACK_BASRA_POINTS = 30;
export const DEFAULT_TARGET_SCORE = 121;

// Special cards
export const DIAMOND_7_ID = '7-diamonds';
