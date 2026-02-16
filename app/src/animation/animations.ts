import type {
  GameStartPayload,
  CardsDealtPayload,
  CardPlayedPayload,
  RoundEndPayload,
  Card,
} from '@basra/shared';
import type { CardEntitiesManager } from './useCardEntities';
import type { GameLayout } from './types';
import {
  getHandPositions,
  getOpponentHandPositions,
  getTablePositions,
} from './useGameLayout';
import {
  animateSpring,
  animateTiming,
  animatePosition,
  delay,
  fireSpring,
} from './utils';
import {
  SPRING_CARD,
  SPRING_QUICK,
  SPRING_BOUNCY,
  SPRING_HEAVY,
  DEAL_STAGGER,
  CAPTURE_FLY_STAGGER,
  TABLE_FLY_STAGGER,
  CAPTURE_PAUSE,
  ROUND_END_DELAY,
  ROUND_END_PAUSE,
  SHUFFLE_CYCLE_MS,
  SHUFFLE_CYCLES,
  TIMING_FLIP,
} from './springs';
import { lightTap, mediumTap, successVibration, basraVibration } from '../utils/haptics';

/**
 * Game Start: shuffle jiggle → deal to opponent → deal to table → deal to hand
 */
export async function gameStartSequence(
  entities: CardEntitiesManager,
  layout: GameLayout,
  payload: GameStartPayload
): Promise<void> {
  // Shuffle jiggle on deck
  const deckEntities = entities.getEntitiesByZone('deck');
  for (let cycle = 0; cycle < SHUFFLE_CYCLES; cycle++) {
    for (const e of deckEntities) {
      e.rotation.value = cycle % 2 === 0 ? 0.05 : -0.05;
      e.x.value += cycle % 2 === 0 ? 4 : -4;
    }
    await delay(SHUFFLE_CYCLE_MS);
  }
  // Reset deck
  for (const e of deckEntities) {
    e.rotation.value = 0;
  }

  // Deal cards to opponent (staggered, face-down)
  const oppCenter = {
    x: layout.opponentHand.x + layout.opponentHand.width / 2,
    y: layout.opponentHand.y + layout.opponentHand.height / 2 + 15,
  };
  const oppEntities = entities.getEntitiesByZone('opponentHand');
  const oppPositions = getOpponentHandPositions(oppEntities.length, oppCenter);

  for (let i = 0; i < oppEntities.length; i++) {
    const e = oppEntities[i];
    const pos = oppPositions[i];
    if (pos) {
      // Start from deck position
      e.x.value = layout.deck.x + layout.deck.width / 2;
      e.y.value = layout.deck.y + layout.deck.height / 2;
      e.opacity.value = 1;
      e.scale.value = 0.3;

      // Fly to position
      animateSpring(e.scale, 1, SPRING_CARD);
      animatePosition(e, pos.x, pos.y, SPRING_CARD);
      fireSpring(e.rotation, pos.rotation, SPRING_CARD);
      await delay(DEAL_STAGGER);
    }
  }

  // Deal cards to table (staggered, flip to face-up mid-flight)
  const tableEntities = entities.getEntitiesByZone('table');
  const tablePositions = getTablePositions(tableEntities.length, layout.table);

  for (let i = 0; i < tableEntities.length; i++) {
    const e = tableEntities[i];
    const pos = tablePositions[i];
    if (pos) {
      e.x.value = layout.deck.x + layout.deck.width / 2;
      e.y.value = layout.deck.y + layout.deck.height / 2;
      e.opacity.value = 1;
      e.scale.value = 0.3;
      e.faceUp = false;

      // Fly to position
      animateSpring(e.scale, 1, SPRING_CARD);
      animatePosition(e, pos.x, pos.y, SPRING_CARD);
      fireSpring(e.rotation, pos.rotation, SPRING_CARD);

      // Flip mid-flight
      delay(80).then(() => {
        animateTiming(e.scaleX, 0, TIMING_FLIP).then(() => {
          e.faceUp = true;
          animateTiming(e.scaleX, 1, TIMING_FLIP);
        });
      });

      await delay(DEAL_STAGGER);
    }
  }

  // Deal cards to hand (staggered, face-up, fan arc)
  const handCenter = {
    x: layout.myHand.x + layout.myHand.width / 2,
    y: layout.myHand.y + layout.myHand.height / 2,
  };
  const handEntities = entities.getEntitiesByZone('hand');
  const handPositions = getHandPositions(handEntities.length, handCenter);

  for (let i = 0; i < handEntities.length; i++) {
    const e = handEntities[i];
    const pos = handPositions[i];
    if (pos) {
      e.x.value = layout.deck.x + layout.deck.width / 2;
      e.y.value = layout.deck.y + layout.deck.height / 2;
      e.opacity.value = 1;
      e.scale.value = 0.3;

      animateSpring(e.scale, 1, SPRING_CARD);
      animatePosition(e, pos.x, pos.y, SPRING_CARD);
      fireSpring(e.rotation, pos.rotation, SPRING_CARD);
      lightTap();
      await delay(DEAL_STAGGER);
    }
  }

  // Wait for last animation to settle
  await delay(300);
}

/**
 * Mid-round deal: new cards fly from deck to hand + opponent
 */
export async function dealSequence(
  entities: CardEntitiesManager,
  layout: GameLayout,
  payload: CardsDealtPayload
): Promise<void> {
  // Will be handled by sync + position (game state update triggers entity sync)
  // Animate new hand cards from deck
  const handCenter = {
    x: layout.myHand.x + layout.myHand.width / 2,
    y: layout.myHand.y + layout.myHand.height / 2,
  };
  const handEntities = entities.getEntitiesByZone('hand');
  const handPositions = getHandPositions(handEntities.length, handCenter);

  for (let i = 0; i < handEntities.length; i++) {
    const e = handEntities[i];
    const pos = handPositions[i];
    if (pos) {
      // Start from deck
      e.x.value = layout.deck.x + layout.deck.width / 2;
      e.y.value = layout.deck.y + layout.deck.height / 2;
      e.scale.value = 0.3;
      e.opacity.value = 1;

      animateSpring(e.scale, 1, SPRING_CARD);
      animatePosition(e, pos.x, pos.y, SPRING_CARD);
      fireSpring(e.rotation, pos.rotation, SPRING_CARD);
      lightTap();
      await delay(DEAL_STAGGER);
    }
  }

  // Opponent gets cards too
  const oppCenter = {
    x: layout.opponentHand.x + layout.opponentHand.width / 2,
    y: layout.opponentHand.y + layout.opponentHand.height / 2 + 15,
  };
  const oppEntities = entities.getEntitiesByZone('opponentHand');
  const oppPositions = getOpponentHandPositions(oppEntities.length, oppCenter);

  for (let i = 0; i < oppEntities.length; i++) {
    const e = oppEntities[i];
    const pos = oppPositions[i];
    if (pos) {
      e.x.value = layout.deck.x + layout.deck.width / 2;
      e.y.value = layout.deck.y + layout.deck.height / 2;
      e.scale.value = 0.3;
      e.opacity.value = 1;

      animateSpring(e.scale, 1, SPRING_CARD);
      animatePosition(e, pos.x, pos.y, SPRING_CARD);
      fireSpring(e.rotation, pos.rotation, SPRING_CARD);
      await delay(DEAL_STAGGER);
    }
  }

  await delay(200);
}

/**
 * My card played: card snaps to table → capture animation → re-fan hand
 */
export async function myPlaySequence(
  entities: CardEntitiesManager,
  layout: GameLayout,
  payload: CardPlayedPayload
): Promise<void> {
  const cardEntity = entities.getEntity(payload.card.id);

  if (cardEntity) {
    // Snap to table center
    const tableCenter = {
      x: layout.table.x + layout.table.width / 2,
      y: layout.table.y + layout.table.height / 2,
    };
    await animatePosition(cardEntity, tableCenter.x, tableCenter.y, SPRING_QUICK);
    cardEntity.zone = 'table';
    cardEntity.zIndex.value = 50;
  }

  // Capture animation
  if (payload.capturedCards.length > 0) {
    await delay(CAPTURE_PAUSE);

    // Haptic
    if (payload.isBasra || payload.isJackBasra) {
      basraVibration();
    } else {
      mediumTap();
    }

    // Converge all captured + played card to center
    const centerX = layout.table.x + layout.table.width / 2;
    const centerY = layout.table.y + layout.table.height / 2;

    const captureTargets = [
      ...payload.capturedCards.map((c) => entities.getEntity(c.id)),
      cardEntity,
    ].filter(Boolean) as import('./types').CardEntity[];

    // Converge
    await Promise.all(
      captureTargets.map((e) =>
        animatePosition(e, centerX, centerY, SPRING_QUICK)
      )
    );

    // Scale pulse
    await Promise.all(
      captureTargets.map((e) => animateSpring(e.scale, 1.15, SPRING_BOUNCY))
    );

    // Fly to my pile (staggered)
    for (let i = 0; i < captureTargets.length; i++) {
      const e = captureTargets[i];
      e.zone = 'myPile';
      animateSpring(e.scale, 0.5, SPRING_HEAVY);
      animateSpring(e.opacity, 0, SPRING_HEAVY);
      animatePosition(
        e,
        layout.myPile.x + layout.myPile.width / 2,
        layout.myPile.y + layout.myPile.height / 2,
        SPRING_HEAVY
      );
      await delay(CAPTURE_FLY_STAGGER);
    }

    await delay(200);

    // Remove captured entities
    for (const e of captureTargets) {
      entities.removeEntity(e.id);
    }
  } else {
    // No capture: card joins table, reposition all table cards
    if (cardEntity) {
      cardEntity.zone = 'table';
    }
  }

  // Re-fan remaining hand cards
  const handEntities = entities.getEntitiesByZone('hand');
  const handCenter = {
    x: layout.myHand.x + layout.myHand.width / 2,
    y: layout.myHand.y + layout.myHand.height / 2,
  };
  const handPositions = getHandPositions(handEntities.length, handCenter);

  handEntities.forEach((e, i) => {
    if (handPositions[i]) {
      animatePosition(e, handPositions[i].x, handPositions[i].y, SPRING_CARD);
      fireSpring(e.rotation, handPositions[i].rotation, SPRING_CARD);
      e.zIndex.value = 10 + i;
    }
  });

  // Re-position table cards
  const tableEntities = entities.getEntitiesByZone('table');
  const tablePositions = getTablePositions(tableEntities.length, layout.table);
  tableEntities.forEach((e, i) => {
    if (tablePositions[i]) {
      animatePosition(e, tablePositions[i].x, tablePositions[i].y, SPRING_CARD);
      fireSpring(e.rotation, tablePositions[i].rotation, SPRING_CARD);
    }
  });
}

/**
 * Opponent plays: card flies from opponent area → flip → capture/place
 */
export async function opponentPlaySequence(
  entities: CardEntitiesManager,
  layout: GameLayout,
  payload: CardPlayedPayload
): Promise<void> {
  // Create entity for the opponent's played card
  const oppCenter = {
    x: layout.opponentHand.x + layout.opponentHand.width / 2,
    y: layout.opponentHand.y + layout.opponentHand.height / 2 + 15,
  };

  // Remove one opponent hand entity (the one that "played")
  const oppEntities = entities.getEntitiesByZone('opponentHand');
  let flyingEntity: import('./types').CardEntity | null = null;

  if (oppEntities.length > 0) {
    flyingEntity = oppEntities[oppEntities.length - 1];
    // Give it the real card data
    flyingEntity.card = payload.card;
    flyingEntity.zone = 'table';
  } else {
    // Fallback: create a new entity
    flyingEntity = entities.addEntity(
      payload.card.id,
      payload.card,
      false,
      'table',
      oppCenter.x,
      oppCenter.y
    );
  }

  // Fly to table center
  const tableCenter = {
    x: layout.table.x + layout.table.width / 2,
    y: layout.table.y + layout.table.height / 2,
  };

  flyingEntity.zIndex.value = 50;
  await animatePosition(flyingEntity, tableCenter.x, tableCenter.y, SPRING_CARD);

  // Flip effect: scaleX 1→0, swap content, scaleX 0→1
  await animateTiming(flyingEntity.scaleX, 0, TIMING_FLIP);
  flyingEntity.faceUp = true;
  flyingEntity.id = payload.card.id; // Update ID to match the real card
  await animateTiming(flyingEntity.scaleX, 1, TIMING_FLIP);

  // Capture animation
  if (payload.capturedCards.length > 0) {
    await delay(CAPTURE_PAUSE);

    if (payload.isBasra || payload.isJackBasra) {
      basraVibration();
    } else {
      mediumTap();
    }

    const centerX = layout.table.x + layout.table.width / 2;
    const centerY = layout.table.y + layout.table.height / 2;

    const captureTargets = [
      ...payload.capturedCards.map((c) => entities.getEntity(c.id)),
      flyingEntity,
    ].filter(Boolean) as import('./types').CardEntity[];

    // Converge
    await Promise.all(
      captureTargets.map((e) =>
        animatePosition(e, centerX, centerY, SPRING_QUICK)
      )
    );

    // Pulse
    await Promise.all(
      captureTargets.map((e) => animateSpring(e.scale, 1.15, SPRING_BOUNCY))
    );

    // Fly to opponent pile
    for (let i = 0; i < captureTargets.length; i++) {
      const e = captureTargets[i];
      e.zone = 'opponentPile';
      animateSpring(e.scale, 0.5, SPRING_HEAVY);
      animateSpring(e.opacity, 0, SPRING_HEAVY);
      animatePosition(
        e,
        layout.opponentPile.x + layout.opponentPile.width / 2,
        layout.opponentPile.y + layout.opponentPile.height / 2,
        SPRING_HEAVY
      );
      await delay(CAPTURE_FLY_STAGGER);
    }

    await delay(200);

    // Remove captured entities
    for (const e of captureTargets) {
      entities.removeEntity(e.id);
    }
  }

  // Re-fan opponent hand
  const remainingOpp = entities.getEntitiesByZone('opponentHand');
  const newOppPositions = getOpponentHandPositions(remainingOpp.length, oppCenter);
  remainingOpp.forEach((e, i) => {
    if (newOppPositions[i]) {
      animatePosition(e, newOppPositions[i].x, newOppPositions[i].y, SPRING_CARD);
      fireSpring(e.rotation, newOppPositions[i].rotation, SPRING_CARD);
    }
  });

  // Re-position table cards
  const tableEntities = entities.getEntitiesByZone('table');
  const tablePositions = getTablePositions(tableEntities.length, layout.table);
  tableEntities.forEach((e, i) => {
    if (tablePositions[i]) {
      animatePosition(e, tablePositions[i].x, tablePositions[i].y, SPRING_CARD);
      fireSpring(e.rotation, tablePositions[i].rotation, SPRING_CARD);
    }
  });
}

/**
 * Round end: remaining table cards fly to last capturer's pile
 */
export async function roundEndSequence(
  entities: CardEntitiesManager,
  layout: GameLayout,
  payload: RoundEndPayload & { lastCapturePlayerId?: string; myId?: string }
): Promise<void> {
  await delay(ROUND_END_DELAY);

  const tableEntities = entities.getEntitiesByZone('table');
  const isMyPile = payload.lastCapturePlayerId === payload.myId;
  const pileLayout = isMyPile ? layout.myPile : layout.opponentPile;
  const pileCenter = {
    x: pileLayout.x + pileLayout.width / 2,
    y: pileLayout.y + pileLayout.height / 2,
  };

  // Fly table cards to pile (staggered)
  for (let i = 0; i < tableEntities.length; i++) {
    const e = tableEntities[i];
    e.zone = isMyPile ? 'myPile' : 'opponentPile';
    animateSpring(e.scale, 0.5, SPRING_HEAVY);
    animateSpring(e.opacity, 0, SPRING_HEAVY);
    animatePosition(e, pileCenter.x, pileCenter.y, SPRING_HEAVY);
    await delay(TABLE_FLY_STAGGER);
  }

  await delay(ROUND_END_PAUSE);

  // Clean up
  for (const e of tableEntities) {
    entities.removeEntity(e.id);
  }
}
