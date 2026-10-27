import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Flashcard from '../components/Flashcard'

const card = {
  id: 'c1',
  card_code: 'CARD-001',
  front_text: 'Qual é a capital da França?',
  back_text: 'Paris',
  front_image_path: null,
  back_image_path: null,
}

describe('Flashcard', () => {
  it('starts showing the front', () => {
    render(<Flashcard card={card} flipped={false} onFlip={() => {}} />)
    expect(screen.getByText('Qual é a capital da França?')).toBeInTheDocument()
    expect(screen.queryByText('Paris')).not.toBeInTheDocument()
  })

  it('shows the back when flipped', () => {
    render(<Flashcard card={card} flipped={true} onFlip={() => {}} />)
    expect(screen.getByText('Paris')).toBeInTheDocument()
    expect(screen.queryByText('Qual é a capital da França?')).not.toBeInTheDocument()
  })

  it('toggles when clicked', () => {
    const onFlip = vi.fn()
    render(<Flashcard card={card} flipped={false} onFlip={onFlip} />)
    fireEvent.click(screen.getByText('Qual é a capital da França?'))
    expect(onFlip).toHaveBeenCalledTimes(1)
  })
})
