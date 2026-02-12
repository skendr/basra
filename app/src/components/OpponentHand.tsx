import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, cardDimensions } from '../theme';

interface OpponentHandProps {
  cardCount: number;
  nickname: string;
  score: number;
  capturedCount: number;
}

export default function OpponentHand({
  cardCount,
  nickname,
  score,
  capturedCount,
}: OpponentHandProps) {
  const smallW = cardDimensions.width * 0.55;
  const smallH = cardDimensions.height * 0.55;

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Text style={styles.nickname}>{nickname}</Text>
        <Text style={styles.score}>{score} pts</Text>
        <Text style={styles.captured}>Pile: {capturedCount}</Text>
      </View>
      <View style={styles.cardsRow}>
        {Array.from({ length: cardCount }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.cardBack,
              { width: smallW, height: smallH, marginLeft: i === 0 ? 0 : -20 },
            ]}
          >
            <Text style={styles.backText}>B</Text>
          </View>
        ))}
        {cardCount === 0 && (
          <Text style={styles.emptyText}>No cards</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  nickname: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  score: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: '600',
  },
  captured: {
    fontSize: fontSize.sm,
    color: colors.textDim,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cardBack: {
    backgroundColor: colors.cardBack,
    borderRadius: cardDimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.accent,
    opacity: 0.3,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
});
