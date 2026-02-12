import { View, Text, StyleSheet } from 'react-native';
import { Card as CardType } from '@basra/shared';
import Card from './Card';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface TableAreaProps {
  cards: CardType[];
}

export default function TableArea({ cards }: TableAreaProps) {
  return (
    <View style={styles.container}>
      <View style={styles.table}>
        {cards.length === 0 ? (
          <Text style={styles.emptyText}>Table Empty</Text>
        ) : (
          <View style={styles.cardsGrid}>
            {cards.map((card, index) => (
              <View
                key={card.id}
                style={[
                  styles.cardWrapper,
                  {
                    transform: [
                      { rotate: `${(index % 5 - 2) * 5}deg` },
                    ],
                  },
                ]}
              >
                <Card card={card} faceUp small />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  table: {
    width: '100%',
    minHeight: 140,
    backgroundColor: colors.tableGreen,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.tableBorder,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  emptyText: {
    color: colors.tableBorder,
    fontSize: fontSize.md,
    fontStyle: 'italic',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  cardWrapper: {
    margin: 2,
  },
});
