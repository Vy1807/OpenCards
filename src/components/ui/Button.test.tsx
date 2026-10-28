import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Button from './Button'

describe('Button', () => {
  it('renderiza com papel de botão e texto informado', () => {
    render(<Button variant="solid">Salvar card</Button>)
    expect(screen.getByRole('button', { name: 'Salvar card' })).toBeInTheDocument()
  })

  it('aplica variante solid com cor primária de fundo', () => {
    const { container } = render(<Button variant="solid">Salvar</Button>)
    const button = container.firstChild as HTMLElement
    expect(button).toHaveStyle('background-color: #E0527F')
    expect(button).toHaveStyle('color: #ffffff')
  })

  it('desabilitado aplica opacidade e desativa interação', () => {
    render(<Button disabled>Desabilitado</Button>)
    const button = screen.getByRole('button', { name: 'Desabilitado' })
    expect(button).toBeDisabled()
    expect(button).toHaveStyle('opacity: 0.55')
  })

  it('é full width quando solicitado', () => {
    const { container } = render(<Button fullWidth>Largo</Button>)
    expect(container.firstChild).toHaveStyle('width: 100%')
  })

  it('gera snapshot de regressão visual (marcador de markup + estilos inline)', () => {
    const { container } = render(
      <Button variant="outline" size="sm">Pequeno</Button>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
