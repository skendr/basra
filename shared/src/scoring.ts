import { PlayerState, RoundScoreResult } from './types';
import { MOST_CARDS_BONUS, BASRA_POINTS, JACK_BASRA_POINTS } from './constants';

/**
 * Calculate round scores for both players.
 */
export function calculateRoundScores(
  player1: PlayerState,
  player2: PlayerState
): RoundScoreResult {
  let p1Points = 0;
  let p2Points = 0;

  // Most captured cards bonus (30 points)
  if (player1.capturedCount > player2.capturedCount) {
    p1Points += MOST_CARDS_BONUS;
  } else if (player2.capturedCount > player1.capturedCount) {
    p2Points += MOST_CARDS_BONUS;
  }
  // If equal, neither gets the bonus

  // Basra points
  p1Points += player1.basras * BASRA_POINTS;
  p1Points += player1.jackBasras * JACK_BASRA_POINTS;

  p2Points += player2.basras * BASRA_POINTS;
  p2Points += player2.jackBasras * JACK_BASRA_POINTS;

  return {
    player1Cards: player1.capturedCount,
    player2Cards: player2.capturedCount,
    player1RoundPoints: p1Points,
    player2RoundPoints: p2Points,
  };
}

/**
 * Check if a player has won (reached target score).
 */
export function checkWinner(
  players: [PlayerState, PlayerState],
  targetScore: number
): PlayerState | null {
  // Both could reach target in same round - higher score wins
  const [p1, p2] = players;
  const p1Reached = p1.score >= targetScore;
  const p2Reached = p2.score >= targetScore;

  if (p1Reached && p2Reached) {
    return p1.score >= p2.score ? p1 : p2;
  }
  if (p1Reached) return p1;
  if (p2Reached) return p2;
  return null;
}
