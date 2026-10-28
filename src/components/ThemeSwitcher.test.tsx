import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ThemeSwitcher from './ThemeSwitcher'

const THEME_KEYS = [
  'slate', 'cobalt', 'emerald', 'amber', 'rose',
  'indigo', 'teal', 'violet', 'zinc', 'abyss',
] as const

beforeEach(() => {
  localStorage.removeItem('selected-theme')
  document.documentElement.className = ''
})

describe('ThemeSwitcher', () => {
  it('renders a select with all 10 themes, defaulting to slate', () => {
    render(<ThemeSwitcher />)
    const select = screen.getByLabelText(/tema/i)
    expect(select).toBeInTheDocument()
    expect(select).toHaveAttribute('value', 'slate')

    for (const key of THEME_KEYS) {
      expect(screen.getByRole('option', { name: key })).toBeInTheDocument()
    }
  })

  it('switches the <html> theme class in real time and persists the choice', () => {
    render(<ThemeSwitcher />)
    const select = screen.getByLabelText(/tema/i) as HTMLSelectElement

    expect(document.documentElement.classList.contains('theme-slate')).toBe(true)

    fireEvent.change(select, { target: { value: 'cobalt' } })
    expect(document.documentElement.classList.contains('theme-cobalt')).toBe(true)
    expect(document.documentElement.classList.contains('theme-slate')).toBe(false)
    expect(localStorage.getItem('selected-theme')).toBe('cobalt')

    fireEvent.change(select, { target: { value: 'abyss' } })
    expect(document.documentElement.classList.contains('theme-abyss')).toBe(true)
    expect(document.documentElement.classList.contains('theme-cobalt')).toBe(false)
    expect(localStorage.getItem('selected-theme')).toBe('abyss')
  })

  it('restores the persisted theme on mount', () => {
    localStorage.setItem('selected-theme', 'emerald')
    render(<ThemeSwitcher />)
    const select = screen.getByLabelText(/tema/i) as HTMLSelectElement
    expect(select.value).toBe('emerald')
    expect(document.documentElement.classList.contains('theme-emerald')).toBe(true)
  })

  it('only emits theme-* classes for the active theme', () => {
    render(<ThemeSwitcher />)
    const select = screen.getByLabelText(/tema/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'zinc' } })
    const themeClasses = Array.from(document.documentElement.classList).filter((c) =>
      c.startsWith('theme-'),
    )
    expect(themeClasses).toEqual(['theme-zinc'])
  })
})
