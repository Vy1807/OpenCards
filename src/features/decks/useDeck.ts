import { useCallback } from 'react';
import { useCards } from '../../app/providers/CardsProvider';

export function useDeck(deckId: string) {
  const {
    deck,
    cards,
    loading,
    error,
    fetchDeck,
    fetchCards,
    updateDeck,
    deleteDeck,
    createCard,
    updateCard,
    deleteCard,
    upsertCard,
    answerCard,
    getDeckStats,
  } = useCards();

  const refresh = useCallback(async () => {
    await fetchDeck(deckId);
    await fetchCards(deckId);
  }, [deckId, fetchDeck, fetchCards]);

  return {
    deck,
    cards,
    loading,
    error,
    refresh,
    updateDeck,
    deleteDeck,
    createCard,
    updateCard,
    deleteCard,
    upsertCard,
    answerCard,
    getDeckStats,
  };
}
