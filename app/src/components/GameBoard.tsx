import { useEffect, useCallback, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Card } from '@basra/shared';
import { findCaptures } from '@basra/shared';
import { colors, cardDimensions } from '../theme';
import { useGameLayout, getHandPositions, getOpponentHandPositions, getTablePositions } from '../animation/useGameLayout';
import { useCardEntities } from '../animation/useCardEntities';
import { useAnimationQueue } from '../animation/useAnimationQueue';
import { useDragToPlay } from '../animation/useDragToPlay';
import type { CardEntity, GameLayout } from '../animation/types';
import { SPRING_CARD } from '../animation/springs';
import AnimatedCard from './AnimatedCard';
import BoardBackground from './BoardBackground';
import CapturedPile from './CapturedPile';

interface GameBoardProps {
  hand: Card[];
  table: Card[];
  opponentCardCount: number;
  deckRemaining: number;
  isMyTurn: boolean;
  myId: string | null;
  myCapturedCount: number;
  myBasras: number;
  myJackBasras: number;
  opponentCapturedCount: number;
  opponentBasras: number;
  opponentJackBasras: number;
  onPlayCard: (cardId: string) => void;
}

export default function GameBoard({
  hand,
  table,
  opponentCardCount,
  deckRemaining,
  isMyTurn,
  myId,
  myCapturedCount,
  myBasras,
  myJackBasras,
  opponentCapturedCount,
  opponentBasras,
  opponentJackBasras,
  onPlayCard,
}: GameBoardProps) {
  const { layout, onBoardLayout } = useGameLayout();
  const entities = useCardEntities();
  const [renderVersion, setRenderVersion] = useState(0);
  const prevStateRef = useRef<string>('');

  // Animation queue
  const queue = useAnimationQueue(entities, layout);

  // Drag-to-play
  const { createDragGesture } = useDragToPlay({
    entities,
    layout,
    isMyTurn,
    table,
    onPlayCard,
  });

  // Sync entities when game state changes
  useEffect(() => {
    if (!layout) return;

    // Build a fingerprint to detect actual changes
    const handIds = hand.map((c) => c.id).join(',');
    const tableIds = table.map((c) => c.id).join(',');
    const fingerprint = `${handIds}|${tableIds}|${opponentCardCount}|${deckRemaining}`;

    if (fingerprint === prevStateRef.current) return;
    prevStateRef.current = fingerprint;

    entities.syncEntities(hand, table, opponentCardCount, deckRemaining);
    positionAllEntities(entities, layout, hand, table, opponentCardCount);
    setRenderVersion((v) => v + 1);
  }, [hand, table, opponentCardCount, deckRemaining, layout]);

  // Get all entities for rendering
  const allEntities = entities.getAllEntities();

  if (!layout) {
    return (
      <View style={styles.container} onLayout={onBoardLayout} />
    );
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onBoardLayout}>
      <BoardBackground layout={layout} />

      {/* All cards rendered as absolute-positioned siblings */}
      {allEntities.map((entity) => {
        const isHandCard = entity.zone === 'hand';
        const gesture = isHandCard && isMyTurn
          ? createDragGesture(entity)
          : undefined;

        return (
          <AnimatedCard
            key={entity.id}
            entity={entity}
            small={entity.zone === 'table' || entity.zone === 'opponentHand'}
            gesture={gesture}
          />
        );
      })}

      {/* Captured piles */}
      <CapturedPile
        count={myCapturedCount}
        basras={myBasras}
        jackBasras={myJackBasras}
        x={layout.myPile.x}
        y={layout.myPile.y}
        label="Mine"
      />
      <CapturedPile
        count={opponentCapturedCount}
        basras={opponentBasras}
        jackBasras={opponentJackBasras}
        x={layout.opponentPile.x}
        y={layout.opponentPile.y}
        label="Opp"
      />
    </GestureHandlerRootView>
  );
}

/**
 * Position all entities to their correct zone positions (instant, no animation).
 */
function positionAllEntities(
  entities: ReturnType<typeof useCardEntities>,
  layout: GameLayout,
  hand: Card[],
  table: Card[],
  opponentCount: number
) {
  // Hand positions
  const handCenter = {
    x: layout.myHand.x + layout.myHand.width / 2,
    y: layout.myHand.y + layout.myHand.height / 2,
  };
  const handPositions = getHandPositions(hand.length, handCenter);
  hand.forEach((card, i) => {
    const entity = entities.getEntity(card.id);
    if (entity && handPositions[i]) {
      entity.x.value = handPositions[i].x;
      entity.y.value = handPositions[i].y;
      entity.rotation.value = handPositions[i].rotation;
      entity.scale.value = 1;
      entity.scaleX.value = 1;
      entity.opacity.value = 1;
      entity.zIndex.value = 10 + i;
    }
  });

  // Table positions
  const tablePositions = getTablePositions(table.length, layout.table);
  table.forEach((card, i) => {
    const entity = entities.getEntity(card.id);
    if (entity && tablePositions[i]) {
      entity.x.value = tablePositions[i].x;
      entity.y.value = tablePositions[i].y;
      entity.rotation.value = tablePositions[i].rotation;
      entity.scale.value = 1;
      entity.scaleX.value = 1;
      entity.opacity.value = 1;
      entity.zIndex.value = 5 + i;
    }
  });

  // Opponent hand positions
  const oppCenter = {
    x: layout.opponentHand.x + layout.opponentHand.width / 2,
    y: layout.opponentHand.y + layout.opponentHand.height / 2 + 15,
  };
  const oppPositions = getOpponentHandPositions(opponentCount, oppCenter);
  const oppEntities = entities.getEntitiesByZone('opponentHand');
  oppEntities.forEach((entity, i) => {
    if (oppPositions[i]) {
      entity.x.value = oppPositions[i].x;
      entity.y.value = oppPositions[i].y;
      entity.rotation.value = oppPositions[i].rotation;
      entity.scale.value = 1;
      entity.scaleX.value = 1;
      entity.opacity.value = 1;
      entity.zIndex.value = 1 + i;
    }
  });

  // Deck positions (stacked at deck zone)
  const deckEntities = entities.getEntitiesByZone('deck');
  deckEntities.forEach((entity, i) => {
    entity.x.value = layout.deck.x + layout.deck.width / 2 + i * 1.5;
    entity.y.value = layout.deck.y + layout.deck.height / 2 - i * 2;
    entity.rotation.value = 0;
    entity.scale.value = 1;
    entity.scaleX.value = 1;
    entity.opacity.value = 1;
    entity.zIndex.value = i;
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
});
