/// <reference types="node" />

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'fs';
import Header from '../../components/ui/Header';

const cssPath = '/home/openclaw/flashcards/src/styles/tokens.css';
const tokensCss = readFileSync(cssPath, 'utf-8');

/**
 * Q-440 — Testes de layout e responsividade
 *
 * Verifica que:
 * 1. Os breakpoints CSS (mobile/tablet/desktop) estão definidos em tokens.css
 * 2. O Header renderiza navegação desktop
 * 3. As classes CSS de layout desktop existem em tokens.css
 * 4. O layout segue mobile-first (navegação oculta por padrão)
 */

describe('Q-440 — Layout e responsividade', () => {
  describe('Breakpoints CSS', () => {
    it('define --breakpoint-mobile (767px), --breakpoint-tablet (768px) e --breakpoint-desktop (1024px)', () => {
      expect(tokensCss).toContain('--breakpoint-mobile: 767px');
      expect(tokensCss).toContain('--breakpoint-tablet: 768px');
      expect(tokensCss).toContain('--breakpoint-desktop: 1024px');
    });

    it('tem media query @media (min-width: 1024px) para desktop', () => {
      expect(tokensCss).toContain('@media (min-width: 1024px)');
    });
  });

  describe('Header — navegação desktop', () => {
    it('renderiza links de navegação (Baralhos, Revisar) no Header', () => {
      render(
        <MemoryRouter>
          <Header title="Deck de teste" showBack backTo="/" />
        </MemoryRouter>
      );

      const navLinks = screen.getAllByRole('button', { name: /^(Baralhos|Revisar)$/ });
      expect(navLinks.length).toBe(2);
    });

    it('o elemento de navegação desktop existe no DOM', () => {
      const { container } = render(
        <MemoryRouter>
          <Header title="Deck de teste" showBack backTo="/" />
        </MemoryRouter>
      );

      const nav = container.querySelector('.header__nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Classes CSS de layout desktop', () => {
    it('contém classe deck-page-layout e deck-page-sidebar', () => {
      expect(tokensCss).toContain('.deck-page-layout');
      expect(tokensCss).toContain('.deck-page-sidebar');
      expect(tokensCss).toContain('grid-template-columns: 320px 1fr');
    });

    it('contém classe review-card-wrapper com max-width 720px', () => {
      expect(tokensCss).toContain('.review-card-wrapper');
      expect(tokensCss).toContain('max-width: 720px');
    });

    it('contém classe new-card-layout para duas colunas desktop', () => {
      expect(tokensCss).toContain('.new-card-layout');
      expect(tokensCss).toContain('grid-template-columns: 1fr 420px');
    });

    it('contém classe home-decks-grid para grade de 3 colunas', () => {
      expect(tokensCss).toContain('.home-decks-grid');
      expect(tokensCss).toContain('grid-template-columns: repeat(3, 1fr)');
    });

    it('contém review-actions desktop em linha', () => {
      expect(tokensCss).toContain('.review-actions.desktop');
      expect(tokensCss).toContain('flex-direction: row');
    });
  });

  describe('Mobile-first', () => {
    it('oculta navegação desktop por padrão (telas < 1024px)', () => {
      expect(tokensCss).toContain('.header__nav {');
      expect(tokensCss).toContain('display: none;');
    });

    it('mostra navegação desktop apenas em telas >= 1024px', () => {
      expect(tokensCss).toContain('@media (min-width: 1024px)');
      expect(tokensCss).toContain('.header__nav {\n    display: flex;');
    });
  });
});
