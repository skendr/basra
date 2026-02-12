import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface DeckPileProps {
  myCapturedCount: number;
  myBasras: number;
  myJackBasras: number;
}

export default function DeckPile({
  myCapturedCount,
  myBasras,
  myJackBasras,
}: DeckPileProps) {
  const totalBasras = myBasras + myJackBasras;

  return (
    <View style={styles.container}>
      <View style={styles.pile}>
        <Text style={styles.count}>{myCapturedCount}</Text>
        <Text style={styles.label}>captured</Text>
      </View>
      {totalBasras > 0 && (
        <View style={styles.basrasBadge}>
          <Text style={styles.basrasText}>
            {totalBasras}x Basra
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pile: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  count: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  basrasBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  basrasText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
});
