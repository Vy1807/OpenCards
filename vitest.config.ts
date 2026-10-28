import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Caminhos críticos da aplicação (lógica de negócio e telas centrais).
// A camada de acesso a dados (src/lib/api.ts, src/lib/supabase.ts e
// src/entities/*) é um limite de mock nos testes e fica de fora da métrica.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/lib/schedule.ts',
        'src/lib/shuffle.ts',
        'src/lib/streak.ts',
        'src/lib/importCards.ts',
        'src/lib/exportCards.ts',
        'src/features/**/*.{ts,tsx}',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
