import type { ReactNode } from 'react'
import { useEffect, useId } from 'react'

import { CloseIcon } from '../../icons'
import { tokens } from '../../design/tokens'

export interface ModalProps {
  /** Quando true o modal fica visível. */
  isOpen: boolean
  /** Chamado ao fechar (ESC, clique no backdrop ou botão de fechar). */
  onClose: () => void
  /** Título exibido no cabeçalho (opcional). */
  title?: ReactNode
  /** Oculta o botão de fechar do cabeçalho. */
  hideClose?: boolean
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function Modal({
  isOpen,
  onClose,
  title,
  hideClose = false,
  children,
  className = '',
  style,
}: ModalProps) {
  const modalId = useId()

  useEffect(() => {
    if (!isOpen) return
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={`ui-modal ${className}`.trim()}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${modalId}-title` : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="ui-modal__panel" style={{ padding: tokens.spacing[10] }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: tokens.spacing[6],
          }}
        >
          {title && (
            <h2
              id={`${modalId}-title`}
              style={{
                margin: 0,
                fontFamily: tokens.typography.fontHeading,
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.ink,
                lineHeight: tokens.typography.lineHeight.tight,
              }}
            >
              {title}
            </h2>
          )}
          {!hideClose && (
            <button
              type="button"
              aria-label="Fechar"
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: tokens.touchTarget,
                height: tokens.touchTarget,
                borderRadius: tokens.radius.full,
                border: `1px solid ${tokens.colors.line}`,
                background: tokens.colors.surface,
                color: tokens.colors.muted,
                cursor: 'pointer',
                transition:
                  'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                padding: 0,
              }}
            >
              <CloseIcon size="lg" />
            </button>
          )}
        </div>
        <div style={{ outline: 'none' }}>{children}</div>
      </div>
    </div>
  )
}

Modal.displayName = 'Modal'
