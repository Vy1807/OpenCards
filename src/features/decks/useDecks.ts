import { useCards } from '../../app/providers/CardsProvider';

export function useDecks() {
  const { decks, loading, error, fetchDecks, createDeck, updateDeck, deleteDeck, clearError } =
    useCards();
  return { decks, loading, error, fetchDecks, createDeck, updateDeck, deleteDeck, clearError };
}
