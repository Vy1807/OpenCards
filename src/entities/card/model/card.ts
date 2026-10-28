export type Deck = {
  id: string;
  user_id: string;
  name: string;
  tag: string | null;
  created_at: string;
  cards_count?: number;
};

export type Card = {
  id: string;
  deck_id: string;
  user_id: string;
  card_code: string;
  front_text: string;
  back_text: string;
  front_image_path: string | null;
  back_image_path: string | null;
  created_at: string;
  box?: number;
  due_at?: string;
  review_count?: number;
  last_reviewed_at?: string;
};

export type NewCardInput = {
  deck_id: string;
  card_code?: string;
  front_text: string;
  back_text: string;
  front_image_path?: string | null;
  back_image_path?: string | null;
};

export type DeckStats = {
  total: number;
  mastered: number;
  dueToday: number;
  accuracy: number;
};

export type CardView = {
  id: string;
  card_code: string;
  front_text: string;
  back_text: string;
  front_image_path: string | null;
  back_image_path: string | null;
};
