import { useNavigate, useLocation } from 'react-router-dom';
import { LayersIcon, RefreshIcon, PlusIcon } from '../../shared/ui/icons';

/**
 * Barra de navegação inferior para celular/tablet (PARTE 1, seção 8).
 * Apenas visível em telas < 1024px. Contém:
 * - Baralhos, Revisar, Tarefas
 * - Botão "+" rosa rosa central para criar do contexto
 * - Some na tela de revisão
 */
export default function BottomNavigation({
  onCreate,
  activeTab = 'decks',
}: {
  onCreate?: () => void;
  activeTab?: 'decks' | 'review' | 'tasks';
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Oculta barra de baixo na tela de revisão
  const isReview = location?.pathname?.includes('/review') ?? false;

  if (isReview) return null;

  return (
    <nav className="bottom-nav">
      <button
        type="button"
        className={`bottom-nav__item ${activeTab === 'decks' ? 'active' : ''}`}
        onClick={() => navigate('/')}
        aria-label="Baralhos"
      >
        <LayersIcon size={24} />
        <span>Baralhos</span>
      </button>
      <button
        type="button"
        className={`bottom-nav__item ${activeTab === 'review' ? 'active' : ''}`}
        onClick={() => navigate('/decks/:id/review')}
        aria-label="Revisar"
      >
        <RefreshIcon size={24} />
        <span>Revisar</span>
      </button>
      <button
        type="button"
        className="bottom-nav__add"
        onClick={onCreate}
        aria-label="Novo"
      >
        <PlusIcon size={24} />
      </button>
      <button
        type="button"
        className={`bottom-nav__item ${activeTab === 'tasks' ? 'active' : ''}`}
        onClick={() => navigate('/kanban')}
        aria-label="Tarefas"
      >
        <LayersIcon size={24} />
        <span>Tarefas</span>
      </button>
    </nav>
  );
}
