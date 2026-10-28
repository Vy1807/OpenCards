import React from 'react'
// @ts-ignore - react-router-dom v7 exports changed but runtime works
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Home from './pages/Home'
import Deck from './pages/Deck'
import DeckEdit from './pages/DeckEdit'
import Review from './pages/Review'
import ThemeSwitcher from './components/ThemeSwitcher'

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const [session, setSession] = React.useState<{ user: { id: string } | null } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [initialized, setInitialized] = React.useState(false)
  const location = useLocation()

  React.useEffect(() => {
    let mounted = true

    // Carrega a sessão inicial UMA VEZ
    // @ts-ignore - getSession exists at runtime but types may be outdated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession({ user: session?.user ?? null })
      setLoading(false)
      setInitialized(true)
    }).catch(() => {
      // Falha ao verificar a sessão (rede indisponível ou credenciais inválidas):
      // não deixa o app travado em loading para sempre nem dispara
      // rejection não tratada no console. Com sessão nula, as rotas protegidas
      // ainda redirecionam para /login.
      if (!mounted) return
      setSession({ user: null })
      setLoading(false)
      setInitialized(true)
    })

    // Escuta mudanças de autenticação (login/logout explícito)
    // @ts-ignore - onAuthStateChange exists at runtime but types may be outdated
    const { data: authChannel } = supabase.auth.onAuthStateChange((_event: string, session: { user: { id: string } } | null) => {
      if (!mounted) return
      // Só atualiza se for um evento real de login/logout, não refresh de token
      // SIGNED_IN / SIGNED_OUT / USER_UPDATED são eventos reais
      if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
        setSession({ user: session?.user ?? null })
      }
      // Não muda loading após inicialização - evita redirect durante navegação
    })

    return () => {
      mounted = false
      authChannel?.subscription?.unsubscribe()
    }
  }, [])

  if (loading) return null

  // Só redireciona se NÃO inicializou OU se inicializou sem usuário
  if (!initialized || !session?.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <ThemeSwitcher />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/decks/:id" element={<Deck />} />
            <Route path="/decks/:id/edit" element={<DeckEdit />} />
            <Route path="/decks/:id/review" element={<Review />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
