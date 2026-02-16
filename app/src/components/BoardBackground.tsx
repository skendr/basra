import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import type { GameLayout } from '../animation/types';

interface BoardBackgroundProps {
  layout: GameLayout;
}

export default function BoardBackground({ layout }: BoardBackgroundProps) {
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
    </>
  );
}

const styles = StyleSheet.create({
  tableZone: {
    position: 'absolute',
    backgroundColor: colors.tableGreen,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.tableBorder,
    opacity: 0.4,
  },
  deckZone: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.tableBorder,
    borderStyle: 'dashed',
    opacity: 0.3,
  },
});
