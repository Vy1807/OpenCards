import React from 'react'
// @ts-ignore - react-router-dom v7 exports changed but runtime works
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, MemoryRouter } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Home from './pages/Home'
import Deck from './pages/Deck'
import DeckEdit from './pages/DeckEdit'
import Review from './pages/Review'

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const [session, setSession] = React.useState<{ user: { id: string } | null } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true

    // Carrega a sessão inicial
    // @ts-ignore - getSession exists at runtime but types may be outdated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession({ user: session?.user ?? null })
      setLoading(false)
    })

    // Escuta mudanças de autenticação
    // @ts-ignore - onAuthStateChange exists at runtime but types may be outdated
    const { data: authChannel } = supabase.auth.onAuthStateChange((_event: string, session: { user: { id: string } } | null) => {
      if (!mounted) return
      setSession({ user: session?.user ?? null })
      setLoading(false)
    })

    return () => {
      mounted = false
      authChannel?.subscription?.unsubscribe()
    }
  }, [])

  if (loading) return null

  if (!session?.user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/decks/:id" element={<Deck />} />
                <Route path="/decks/:id/edit" element={<DeckEdit />} />
                <Route path="/decks/:id/review" element={<Review />} />
              </Routes>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
