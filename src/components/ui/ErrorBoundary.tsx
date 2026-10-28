import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertIcon } from '../../shared/ui/icons';
import { tokens } from '../../design/tokens';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary para capturar erros de renderização na árvore de componentes.
 * Exibe uma UI amigável com botão "Tentar novamente" que recarrega a página.
 * 
 * Nota: ErrorBoundaries não capturam erros em:
 * - Event handlers (use try/catch neles)
 * - Código assíncrono (setTimeout, promises)
 * - Server-side rendering
 * - O próprio componente ErrorBoundary
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log do erro para debugging (em produção, enviaria para serviço de monitoramento)
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);
  }

  private handleRetry = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: tokens.spacing[8],
            textAlign: 'center',
            background: tokens.colors.background,
            color: tokens.colors.ink,
          }}
        >
          <AlertIcon size={48} style={{ marginBottom: tokens.spacing[4], color: tokens.colors.err }} />
          <h2 style={{ margin: '0 0 0.5rem 0', fontFamily: tokens.typography.fontHeading, fontSize: tokens.typography.fontSize.xl }}>
            Algo deu errado
          </h2>
          <p style={{ margin: '0 0 1.5rem 0', color: tokens.colors.muted, maxWidth: '400px' }}>
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
              fontSize: tokens.typography.fontSize.base,
              fontFamily: tokens.typography.fontBody,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.inkInverse,
              background: tokens.colors.primary,
              border: 'none',
              borderRadius: tokens.radius.md,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = tokens.colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = tokens.colors.primary;
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;