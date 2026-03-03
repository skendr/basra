import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Card, GamePhase } from '@basra/shared';
import {
  useGameLayout,
  getHandPositions,
  getOpponentHandPositions,
  getTablePositions,
} from '../animation/useGameLayout';
import { useCardEntities } from '../animation/useCardEntities';
import { useAnimationQueue } from '../animation/useAnimationQueue';
import { useDragToPlay } from '../animation/useDragToPlay';
import type { GameLayout } from '../animation/types';
import { SPRING_HEAVY } from '../animation/springs';
import { animateSpring, animatePosition, delay } from '../animation/utils';
import AnimatedCard from './AnimatedCard';
import BoardBackground from './BoardBackground';
import CapturedPile from './CapturedPile';

const SMALL_SCALE = 0.7;

interface GameBoardProps {
  hand: Card[];
  table: Card[];
  opponentCardCount: number;
  deckRemaining: number;
  isMyTurn: boolean;
  myId: string | null;
  phase: GamePhase;
  lastCapturePlayerId: string | null;
  myCapturedCount: number;
  myBasras: number;
  myJackBasras: number;
  opponentCapturedCount: number;
  opponentBasras: number;
  opponentJackBasras: number;
  onPlayCard: (cardId: string) => void;
  onRoundEndAnimDone?: () => void;
}

export default function GameBoard({
  hand,
  table,
  opponentCardCount,
  deckRemaining,
  isMyTurn,
  myId,
  phase,
  lastCapturePlayerId,
  myCapturedCount,
  myBasras,
  myJackBasras,
  opponentCapturedCount,
  opponentBasras,
  opponentJackBasras,
  onPlayCard,
  onRoundEndAnimDone,
}: GameBoardProps) {
  const { layout, onBoardLayout } = useGameLayout();
  const entities = useCardEntities();
  const [renderVersion, setRenderVersion] = useState(0);
  const prevStateRef = useRef<string>('');
  const roundEndAnimatedRef = useRef(false);

  // Animation queue (for future use)
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

    const handIds = hand.map((c) => c.id).join(',');
    const tableIds = table.map((c) => c.id).join(',');
    const fingerprint = `${handIds}|${tableIds}|${opponentCardCount}|${deckRemaining}`;

    if (fingerprint === prevStateRef.current) return;
    prevStateRef.current = fingerprint;

    entities.syncEntities(hand, table, opponentCardCount, deckRemaining);
    positionAllEntities(entities, layout, hand, table, opponentCardCount);
    setRenderVersion((v) => v + 1);
  }, [hand, table, opponentCardCount, deckRemaining, layout]);

  // Round-end animation: fly remaining table cards to last capturer's pile
  useEffect(() => {
    if (phase !== 'round-end' && phase !== 'game-over') {
      roundEndAnimatedRef.current = false;
      return;
    }
    if (!layout || roundEndAnimatedRef.current) return;
    roundEndAnimatedRef.current = true;

    const tableEntities = entities.getEntitiesByZone('table');
    if (tableEntities.length === 0) {
      onRoundEndAnimDone?.();
      return;
    }

    const isMyPile = lastCapturePlayerId === myId;
    const pileLayout = isMyPile ? layout.myPile : layout.opponentPile;
    const px = pileLayout.x + pileLayout.width / 2;
    const py = pileLayout.y + pileLayout.height / 2;

    (async () => {
      for (let i = 0; i < tableEntities.length; i++) {
        const e = tableEntities[i];
        e.zone = isMyPile ? 'myPile' : 'opponentPile';
        animateSpring(e.scale, 0.4, SPRING_HEAVY);
        animateSpring(e.opacity, 0, SPRING_HEAVY);
        animatePosition(e, px, py, SPRING_HEAVY);
        await delay(60);
      }
      await delay(400);
      for (const e of tableEntities) {
        entities.removeEntity(e.id);
      }
      setRenderVersion((v) => v + 1);
      onRoundEndAnimDone?.();
    })();
  }, [phase, layout]);

  const allEntities = entities.getAllEntities();

  if (!layout) {
    return <View style={styles.container} onLayout={onBoardLayout} />;
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onBoardLayout}>
      <BoardBackground layout={layout} isMyTurn={isMyTurn} />

      {allEntities.map((entity) => {
        const isHandCard = entity.zone === 'hand';
        const gesture =
          isHandCard && isMyTurn ? createDragGesture(entity) : undefined;

        return (
          <AnimatedCard
            key={entity.id}
            entity={entity}
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
      />
      <CapturedPile
        count={opponentCapturedCount}
        basras={opponentBasras}
        jackBasras={opponentJackBasras}
        x={layout.opponentPile.x}
        y={layout.opponentPile.y}
      />
    </GestureHandlerRootView>
  );
}

/**
 * Position all entities at correct zone positions.
 * Small-zone cards get scale=0.7 instead of different dimensions.
 */
function positionAllEntities(
  entities: ReturnType<typeof useCardEntities>,
  layout: GameLayout,
  hand: Card[],
  table: Card[],
  opponentCount: number
) {
  // Hand cards (full-size)
  const handCenter = {
    x: layout.myHand.x + layout.myHand.width / 2,
    y: layout.myHand.y + layout.myHand.height / 2,
  };
  const handPositions = getHandPositions(hand.length, handCenter, 55, layout.board.width);
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

  // Table cards (small scale)
  const tablePositions = getTablePositions(table.length, layout.table);
  table.forEach((card, i) => {
    const entity = entities.getEntity(card.id);
    if (entity && tablePositions[i]) {
      entity.x.value = tablePositions[i].x;
      entity.y.value = tablePositions[i].y;
      entity.rotation.value = tablePositions[i].rotation;
      entity.scale.value = SMALL_SCALE;
      entity.scaleX.value = 1;
      entity.opacity.value = 1;
      entity.zIndex.value = 5 + i;
    }
  });

  // Opponent hand (small scale, face-down)
  const oppCenter = {
    x: layout.opponentHand.x + layout.opponentHand.width / 2,
    y: layout.opponentHand.y + layout.opponentHand.height / 2 + 12,
  };
  const oppPositions = getOpponentHandPositions(opponentCount, oppCenter);
  const oppEntities = entities.getEntitiesByZone('opponentHand');
  oppEntities.forEach((entity, i) => {
    if (oppPositions[i]) {
      entity.x.value = oppPositions[i].x;
      entity.y.value = oppPositions[i].y;
      entity.rotation.value = oppPositions[i].rotation;
      entity.scale.value = SMALL_SCALE;
      entity.scaleX.value = 1;
      entity.opacity.value = 1;
      entity.zIndex.value = 1 + i;
    }
  });

  // Deck stack
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
