import { useImageUrl } from '../../shared/lib/useImageUrl';

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
  const frontImageUrl = useImageUrl(card.front_image_path);
  const backImageUrl = useImageUrl(card.back_image_path);

  return (
    <div className={`flashcard-card ${flipped ? 'flipped' : ''}`} onClick={onFlip}>
      {!flipped && (
        <div className="flashcard-face front" data-testid="flashcard-frente">
          <div
            style={{
              fontSize: 'var(--font-pequeno-size)',
              color: 'var(--muted)',
              marginBottom: '0.5rem',
            }}
          >
            #{card.card_code} · Pergunta
          </div>
          <div
            data-testid="flashcard-frente-texto"
            style={{
              fontSize: 'var(--font-subtitulo-size)',
              fontWeight: '600',
              wordBreak: 'break-word',
            }}
          >
            {card.front_text}
          </div>
          {frontImageUrl && (
            <img
              src={frontImageUrl}
              alt="frente"
              className="flashcard-image"
              style={{ marginTop: '1rem' }}
            />
          )}
          <p
            style={{
              fontSize: 'var(--font-pequeno-size)',
              color: 'var(--muted)',
              marginTop: '1rem',
            }}
          >
            Clique para revelar a resposta
          </p>
        </div>
      )}
      {flipped && (
        <div className="flashcard-face back" data-testid="flashcard-verso">
          <div
            style={{
              fontSize: 'var(--font-pequeno-size)',
              color: 'var(--muted)',
              marginBottom: '0.5rem',
            }}
          >
            #{card.card_code} · Resposta
          </div>
          <div
            data-testid="flashcard-verso-texto"
            style={{
              fontSize: 'var(--font-subtitulo-size)',
              fontWeight: '600',
              marginBottom: backImageUrl ? '0.5rem' : 0,
              wordBreak: 'break-word',
            }}
          >
            {card.back_text}
          </div>
          {backImageUrl && (
            <img
              src={backImageUrl}
              alt="verso"
              className="flashcard-image"
            />
          )}
          <p
            style={{
              fontSize: 'var(--font-pequeno-size)',
              color: 'var(--muted)',
              marginTop: '1rem',
            }}
          >
            Clique para continuar
          </p>
        </div>
      )}
    </div>
  );
}
