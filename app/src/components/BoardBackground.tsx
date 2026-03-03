import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import type { GameLayout } from '../animation/types';

interface BoardBackgroundProps {
  layout: GameLayout;
  isMyTurn: boolean;
}

export default function BoardBackground({ layout, isMyTurn }: BoardBackgroundProps) {
  return (
    <>
      {/* Table felt zone */}
      <View
        style={[
          styles.tableZone,
          {
            left: layout.table.x,
            top: layout.table.y,
            width: layout.table.width,
            height: layout.table.height,
          },
        ]}
      />
      {/* Table inner border for depth */}
      <View
        style={[
          styles.tableInner,
          {
            left: layout.table.x + 6,
            top: layout.table.y + 6,
            width: layout.table.width - 12,
            height: layout.table.height - 12,
          },
        ]}
      />

      {/* Deck area indicator */}
      <View
        style={[
          styles.deckZone,
          {
            left: layout.deck.x,
            top: layout.deck.y,
            width: layout.deck.width,
            height: layout.deck.height,
          },
        ]}
      />

      {/* Hand zone glow when it's my turn */}
      {isMyTurn && (
        <View
          style={[
            styles.handGlow,
            {
              left: layout.myHand.x + 20,
              top: layout.myHand.y - 2,
              width: layout.myHand.width - 40,
              height: 2,
            },
          ]}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tableZone: {
    position: 'absolute',
    backgroundColor: colors.tableGreen,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.tableBorder,
    opacity: 0.45,
  },
  tableInner: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.tableBorder,
    opacity: 0.2,
  },
  deckZone: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.tableBorder,
    borderStyle: 'dashed',
    opacity: 0.2,
  },
  handGlow: {
    position: 'absolute',
    backgroundColor: colors.success,
    borderRadius: 1,
    opacity: 0.5,
  },
});
