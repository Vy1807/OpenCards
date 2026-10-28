interface FlashcardProps {
  card: {
    id: string;
    card_code: string;
    front_text: string;
    back_text: string;
    front_image_path: string | null;
    back_image_path: string | null;
  };
  flipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({ card, flipped, onFlip }: FlashcardProps) {
  const frontImageUrl = card.front_image_path ? `image://${card.front_image_path}` : undefined;
  const backImageUrl = card.back_image_path ? `image://${card.back_image_path}` : undefined;

  return (
    <div className={`flashcard-card ${flipped ? 'flipped' : ''}`} onClick={onFlip}>
      {!flipped && (
        <div className="flashcard-face front">
          <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
            #{card.card_code} · Frente
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: card.front_image_path ? '0.5rem' : 0,
              wordBreak: 'break-word',
            }}
          >
            {card.front_text}
          </div>
          {card.front_image_path && (
            <img src={frontImageUrl} alt="frente" className="flashcard-image" />
          )}
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '1rem' }}>
            Clique para revelar a resposta
          </p>
        </div>
      )}
      {flipped && (
        <div className="flashcard-face back">
          <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
            #{card.card_code} · Verso
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: card.back_image_path ? '0.5rem' : 0,
              wordBreak: 'break-word',
            }}
          >
            {card.back_text}
          </div>
          {card.back_image_path && (
            <img src={backImageUrl} alt="verso" className="flashcard-image" />
          )}
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '1rem' }}>
            Clique para continuar
          </p>
        </div>
      )}
    </div>
  );
}
