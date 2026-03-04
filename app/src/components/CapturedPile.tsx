import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, cardDimensions } from '../theme';

interface CapturedPileProps {
  count: number;
  basras: number;
  jackBasras: number;
  x: number;
  y: number;
  cardScale?: number;
}

export default function CapturedPile({
  count,
  basras,
  jackBasras,
  x,
  y,
  cardScale = 1,
}: CapturedPileProps) {
  const stackCount = Math.min(3, count);
  const pileW = 40 * cardScale;
  const pileH = 56 * cardScale;

  return (
    <View style={[styles.container, { left: x, top: y, width: pileW + 20 * cardScale }]}>
      {/* Stack visual */}
      <View style={{ width: pileW, height: pileH, position: 'relative' as const }}>
        {count === 0 ? (
          <View style={[styles.emptySlot, { width: pileW, height: pileH }]} />
        ) : (
          [...Array(stackCount)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.stackCard,
                {
                  width: pileW,
                  height: pileH,
                  top: -i * 2 * cardScale,
                  left: -i * 1 * cardScale,
                  shadowOpacity: 0.1 + i * 0.05,
                },
              ]}
            />
          ))
        )}
      </View>

      {/* Count badge */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>

      {/* Basra indicators */}
      {(basras > 0 || jackBasras > 0) && (
        <View style={styles.badges}>
          {basras > 0 && (
            <View style={styles.basraDot}>
              <Text style={styles.basraText}>{basras}</Text>
            </View>
          )}
          {jackBasras > 0 && (
            <View style={styles.jackDot}>
              <Text style={styles.jackText}>{jackBasras}</Text>
            </View>
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
  },
  emptySlot: {
    borderRadius: cardDimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    opacity: 0.25,
  },
  stackCard: {
    position: 'absolute',
    backgroundColor: colors.cardBack,
    borderRadius: cardDimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  countBadge: {
    marginTop: 3,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textDim,
  },
  badges: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
  },
  basraDot: {
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  basraText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primary,
  },
  jackDot: {
    backgroundColor: 'rgba(240, 192, 64, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  jackText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.accent,
  },
});
