import { useCallback, useRef } from 'react';
import { makeMutable } from 'react-native-reanimated';
import type { Card } from '@basra/shared';
import type { CardEntity, Zone } from './types';

function createEntity(
  id: string,
  card: Card | null,
  faceUp: boolean,
  zone: Zone,
  x: number = 0,
  y: number = 0
): CardEntity {
  return {
    id,
    card,
    faceUp,
    zone,
    x: makeMutable(x),
    y: makeMutable(y),
    rotation: makeMutable(0),
    scale: makeMutable(1),
    scaleX: makeMutable(1),
    opacity: makeMutable(1),
    zIndex: makeMutable(0),
    isDragging: makeMutable(0),
    dragOffsetX: makeMutable(0),
    dragOffsetY: makeMutable(0),
  };
}

/**
 * Manages the pool of CardEntity objects.
 * Entities are created/removed as cards enter/leave the game.
 * Uses a ref to avoid re-renders — the animation layer reads shared values directly.
 */
export function useCardEntities() {
  const entitiesRef = useRef<Map<string, CardEntity>>(new Map());
  // Trigger re-render when entity list changes (add/remove)
  const versionRef = useRef(0);
  const forceUpdate = useCallback(() => {
    versionRef.current += 1;
  }, []);

  const getEntity = useCallback((id: string): CardEntity | undefined => {
    return entitiesRef.current.get(id);
  }, []);

  const getAllEntities = useCallback((): CardEntity[] => {
    return Array.from(entitiesRef.current.values());
  }, []);

  const getEntitiesByZone = useCallback((zone: Zone): CardEntity[] => {
    return Array.from(entitiesRef.current.values()).filter(
      (e) => e.zone === zone
    );
  }, []);

  const addEntity = useCallback(
    (
      id: string,
      card: Card | null,
      faceUp: boolean,
      zone: Zone,
      x: number = 0,
      y: number = 0
    ): CardEntity => {
      const existing = entitiesRef.current.get(id);
      if (existing) {
        // Update existing entity
        existing.card = card;
        existing.faceUp = faceUp;
        existing.zone = zone;
        return existing;
      }
      const entity = createEntity(id, card, faceUp, zone, x, y);
      entitiesRef.current.set(id, entity);
      return entity;
    },
    []
  );

  const removeEntity = useCallback((id: string) => {
    entitiesRef.current.delete(id);
  }, []);

  const clearAll = useCallback(() => {
    entitiesRef.current.clear();
  }, []);

  /**
   * Batch-sync entities to match a new game state.
   * Creates entities for new cards, updates existing, removes stale.
   */
  const syncEntities = useCallback(
    (
      handCards: Card[],
      tableCards: Card[],
      opponentCount: number,
      deckRemaining: number
    ) => {
      const newIds = new Set<string>();

      // Hand cards
      for (const card of handCards) {
        newIds.add(card.id);
        const existing = entitiesRef.current.get(card.id);
        if (existing) {
          existing.card = card;
          existing.faceUp = true;
          existing.zone = 'hand';
        } else {
          addEntity(card.id, card, true, 'hand');
        }
      }

      // Table cards
      for (const card of tableCards) {
        newIds.add(card.id);
        const existing = entitiesRef.current.get(card.id);
        if (existing) {
          existing.card = card;
          existing.faceUp = true;
          existing.zone = 'table';
        } else {
          addEntity(card.id, card, true, 'table');
        }
      }

      // Opponent hand (face-down placeholders)
      // Remove old opponent cards, add new ones
      const oldOpponent = getEntitiesByZone('opponentHand');
      for (const e of oldOpponent) {
        if (!newIds.has(e.id)) {
          entitiesRef.current.delete(e.id);
        }
      }
      const currentOpponentCount = getEntitiesByZone('opponentHand').length;
      for (let i = currentOpponentCount; i < opponentCount; i++) {
        const id = `opp-${i}-${Date.now()}`;
        newIds.add(id);
        addEntity(id, null, false, 'opponentHand');
      }

      // Deck visual (just a few cards for the deck appearance)
      const deckVisualCount = Math.min(3, deckRemaining);
      const oldDeck = getEntitiesByZone('deck');
      for (const e of oldDeck) {
        entitiesRef.current.delete(e.id);
      }
      for (let i = 0; i < deckVisualCount; i++) {
        const id = `deck-${i}`;
        newIds.add(id);
        addEntity(id, null, false, 'deck');
      }

      // Remove entities not in any current set (captured cards, etc.)
      for (const [id, entity] of entitiesRef.current) {
        if (
          !newIds.has(id) &&
          entity.zone !== 'myPile' &&
          entity.zone !== 'opponentPile'
        ) {
          entitiesRef.current.delete(id);
        }
      }
    },
    [addEntity, getEntitiesByZone]
  );

  return {
    getEntity,
    getAllEntities,
    getEntitiesByZone,
    addEntity,
    removeEntity,
    clearAll,
    syncEntities,
    entitiesRef,
    versionRef,
    forceUpdate,
  };
}

export type CardEntitiesManager = ReturnType<typeof useCardEntities>;
