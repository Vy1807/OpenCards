import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import {
  answerCard as apiAnswerCard,
  createCard as apiCreateCard,
  createDeck as apiCreateDeck,
  deleteCard as apiDeleteCard,
  deleteDeck as apiDeleteDeck,
  getCards as apiGetCards,
  getDeck as apiGetDeck,
  getDeckStats as apiGetDeckStats,
  getDecks as apiGetDecks,
  updateCard as apiUpdateCard,
  updateDeck as apiUpdateDeck,
  uploadImage as apiUploadImage,
  upsertCard as apiUpsertCard,
} from '../../entities/card/api/cards';
import type { Card, Deck, DeckStats, NewCardInput } from '../../entities/card/model/card';

export type CardsContextValue = {
  decks: Deck[];
  deck: Deck | null;
  cards: Card[];
  loading: boolean;
  error: string | null;
  fetchDecks: () => Promise<void>;
  fetchDeck: (id: string) => Promise<void>;
  fetchCards: (deckId: string) => Promise<void>;
  getDeckStats: (deckId: string) => Promise<DeckStats | null>;
  createDeck: (name: string, tag: string | null) => Promise<Deck | null>;
  updateDeck: (id: string, updates: { name?: string; tag?: string | null }) => Promise<Deck | null>;
  deleteDeck: (id: string) => Promise<boolean>;
  createCard: (input: NewCardInput) => Promise<Card | null>;
  updateCard: (id: string, updates: Partial<NewCardInput>) => Promise<Card | null>;
  deleteCard: (id: string) => Promise<boolean>;
  upsertCard: (input: NewCardInput) => Promise<Card | null>;
  answerCard: (cardId: string, correct: boolean) => Promise<Card | null>;
  uploadImage: (file: File, folder: 'front' | 'back') => Promise<string | null>;
  clearError: () => void;
};

const CardsContext = createContext<CardsContextValue | undefined>(undefined);

export function useCards(): CardsContextValue {
  const ctx = useContext(CardsContext);
  if (ctx === undefined) {
    throw new Error('useCards deve ser usado dentro de um <CardsProvider>.');
  }
  return ctx;
}

/**
 * Estado global de baralhos e cartões. Todas as chamadas ao Supabase passam
 * pela camada de dados (entities/card/api); este provider apenas guarda o
 * estado em memória e expõe ações tipadas para as features.
 */
export function CardsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const setFailure = useCallback((err: unknown) => {
    setError(err instanceof Error ? err.message : 'Erro inesperado');
    setLoading(false);
  }, []);

  const fetchDecks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDecks(await apiGetDecks());
    } catch (err) {
      setFailure(err);
    }
  }, [setFailure]);

  const fetchDeck = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        setDeck(await apiGetDeck(id));
      } catch (err) {
        setFailure(err);
      }
    },
    [setFailure]
  );

  const fetchCards = useCallback(
    async (deckId: string) => {
      setLoading(true);
      setError(null);
      try {
        setCards(await apiGetCards(deckId));
      } catch (err) {
        setFailure(err);
      }
    },
    [setFailure]
  );

  const getDeckStats = useCallback(
    async (deckId: string) => {
      try {
        return await apiGetDeckStats(deckId);
      } catch (err) {
        setFailure(err);
        return null;
      }
    },
    [setFailure]
  );

  const createDeck = useCallback(
    async (name: string, tag: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const created = await apiCreateDeck(name, tag);
        setDecks((current) => [created, ...current]);
        return created;
      } catch (err) {
        setFailure(err);
        return null;
      }
    },
    [setFailure]
  );

  const updateDeck = useCallback(
    async (id: string, updates: { name?: string; tag?: string | null }) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await apiUpdateDeck(id, updates);
        setDecks((current) => current.map((d) => (d.id === id ? updated : d)));
        setDeck((current) => (current?.id === id ? updated : current));
        return updated;
      } catch (err) {
        setFailure(err);
        return null;
      }
    },
    [setFailure]
  );

  const deleteDeck = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await apiDeleteDeck(id);
        setDecks((current) => current.filter((d) => d.id !== id));
        setDeck((current) => (current?.id === id ? null : current));
        return true;
      } catch (err) {
        setFailure(err);
        return false;
      }
    },
    [setFailure]
  );

  const createCard = useCallback(
    async (input: NewCardInput) => {
      setLoading(true);
      setError(null);
      try {
        const created = await apiCreateCard(input);
        setCards((current) => [...current, created]);
        return created;
      } catch (err) {
        setFailure(err);
        return null;
      }
    },
    [setFailure]
  );

  const updateCard = useCallback(
    async (id: string, updates: Partial<NewCardInput>) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await apiUpdateCard(id, updates);
        setCards((current) => current.map((c) => (c.id === id ? updated : c)));
        return updated;
      } catch (err) {
        setFailure(err);
        return null;
      }
    },
    [setFailure]
  );

  const deleteCard = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await apiDeleteCard(id);
        setCards((current) => current.filter((c) => c.id !== id));
        return true;
      } catch (err) {
        setFailure(err);
        return false;
      }
    },
    [setFailure]
  );

  const upsertCard = useCallback(
    async (input: NewCardInput) => {
      setLoading(true);
      setError(null);
      try {
        const created = await apiUpsertCard(input);
        setCards((current) => {
          const exists = current.findIndex((c) => c.id === created.id);
          return exists >= 0
            ? current.map((c) => (c.id === created.id ? created : c))
            : [...current, created];
        });
        return created;
      } catch (err) {
        setFailure(err);
        return null;
      }
    },
    [setFailure]
  );

  const answerCard = useCallback(
    async (cardId: string, correct: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await apiAnswerCard(cardId, correct);
        setCards((current) => current.map((c) => (c.id === cardId ? updated : c)));
        return updated;
      } catch (err) {
        setFailure(err);
        return null;
      }
    },
    [setFailure]
  );

  const uploadImage = useCallback(
    async (file: File, folder: 'front' | 'back') => {
      if (!user) {
        setError('Usuário não autenticado');
        setLoading(false);
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        return await apiUploadImage(file, user.id, folder);
      } catch (err) {
        setFailure(err);
        return null;
      }
    },
    [user, setFailure]
  );

  return (
    <CardsContext.Provider
      value={{
        decks,
        deck,
        cards,
        loading,
        error,
        fetchDecks,
        fetchDeck,
        fetchCards,
        getDeckStats,
        createDeck,
        updateDeck,
        deleteDeck,
        createCard,
        updateCard,
        deleteCard,
        upsertCard,
        answerCard,
        uploadImage,
        clearError,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
}
