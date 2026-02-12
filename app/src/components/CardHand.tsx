import { View, StyleSheet, ScrollView } from 'react-native';
import { Card as CardType } from '@basra/shared';
import Card from './Card';
import { spacing } from '../theme';

interface CardHandProps {
  cards: CardType[];
  onCardPress?: (card: CardType) => void;
  selectedCardId?: string | null;
  disabled?: boolean;
}

export default function CardHand({
  cards,
  onCardPress,
  selectedCardId,
  disabled = false,
}: CardHandProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {cards.map((card, index) => (
        <View
          key={card.id}
          style={[styles.cardWrapper, { marginLeft: index === 0 ? 0 : -15 }]}
        >
          <Card
            card={card}
            faceUp
            onPress={onCardPress}
            selected={selectedCardId === card.id}
            disabled={disabled}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cardWrapper: {
    zIndex: 1,
  },
});
