import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, cardDimensions } from '../theme';

interface CapturedPileProps {
  count: number;
  basras: number;
  jackBasras: number;
  x: number;
  y: number;
}

const PILE_W = 40;
const PILE_H = 56;

export default function CapturedPile({
  count,
  basras,
  jackBasras,
  x,
  y,
}: CapturedPileProps) {
  const stackCount = Math.min(3, count);

  return (
    <View style={[styles.container, { left: x, top: y }]}>
      {/* Stack visual */}
      <View style={styles.stackWrap}>
        {count === 0 ? (
          <View style={styles.emptySlot} />
        ) : (
          [...Array(stackCount)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.stackCard,
                {
                  top: -i * 2,
                  left: -i * 1,
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
    width: PILE_W + 20,
  },
  stackWrap: {
    width: PILE_W,
    height: PILE_H,
    position: 'relative',
  },
  emptySlot: {
    width: PILE_W,
    height: PILE_H,
    borderRadius: cardDimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    opacity: 0.25,
  },
  stackCard: {
    position: 'absolute',
    width: PILE_W,
    height: PILE_H,
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
