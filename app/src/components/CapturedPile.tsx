import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, borderRadius, cardDimensions } from '../theme';

interface CapturedPileProps {
  count: number;
  basras: number;
  jackBasras: number;
  x: number;
  y: number;
  label?: string;
}

const SMALL_W = cardDimensions.width * 0.55;
const SMALL_H = cardDimensions.height * 0.55;

export default function CapturedPile({
  count,
  basras,
  jackBasras,
  x,
  y,
  label,
}: CapturedPileProps) {
  return (
    <View style={[styles.container, { left: x, top: y }]}>
      {/* Stack visual — show up to 3 offset cards */}
      {count > 0 && (
        <View style={styles.stack}>
          {[...Array(Math.min(3, count))].map((_, i) => (
            <View
              key={i}
              style={[
                styles.stackCard,
                { top: -i * 2, left: -i * 1.5 },
              ]}
            />
          ))}
        </View>
      )}
      <Text style={styles.count}>{count}</Text>
      {(basras > 0 || jackBasras > 0) && (
        <View style={styles.badges}>
          {basras > 0 && (
            <Text style={styles.basraBadge}>B{basras}</Text>
          )}
          {jackBasras > 0 && (
            <Text style={styles.jackBadge}>J{jackBasras}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    width: SMALL_W + 16,
  },
  stack: {
    width: SMALL_W,
    height: SMALL_H,
    position: 'relative',
  },
  stackCard: {
    position: 'absolute',
    width: SMALL_W,
    height: SMALL_H,
    backgroundColor: colors.cardBack,
    borderRadius: cardDimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  count: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textDim,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 1,
  },
  basraBadge: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primary,
  },
  jackBadge: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.accent,
  },
});
