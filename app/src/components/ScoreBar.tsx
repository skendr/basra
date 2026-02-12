import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface ScoreBarProps {
  myScore: number;
  opponentScore: number;
  myName: string;
  opponentName: string;
  targetScore: number;
  roundNumber: number;
  deckRemaining: number;
}

export default function ScoreBar({
  myScore,
  opponentScore,
  myName,
  opponentName,
  targetScore,
  roundNumber,
  deckRemaining,
}: ScoreBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.playerScore}>
        <Text style={styles.name} numberOfLines={1}>{myName}</Text>
        <Text style={styles.score}>{myScore}</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.round}>R{roundNumber}</Text>
        <Text style={styles.deck}>Deck: {deckRemaining}</Text>
        <Text style={styles.target}>/{targetScore}</Text>
      </View>

      <View style={styles.playerScore}>
        <Text style={styles.name} numberOfLines={1}>{opponentName}</Text>
        <Text style={styles.score}>{opponentScore}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
  },
  playerScore: {
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: fontSize.xs,
    color: colors.textDim,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  score: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.accent,
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  round: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    fontWeight: '700',
  },
  deck: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  target: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
