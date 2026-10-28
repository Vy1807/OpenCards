import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import Login from '../features/auth/Login';
import Home from '../features/decks/Home';
import { NewCardPage } from '../features/decks/NewCard';
import Import from '../features/decks/Import';
import Cadastro from '../features/auth/Cadastro';
import { Suspense, lazy } from 'react';
import { Spinner } from '../components/ui';

// Lazy-load heavy routes for code-splitting
const Deck = lazy(() => import('../features/decks/Deck'));
const DeckEdit = lazy(() => import('../features/decks/DeckEdit'));
const Review = lazy(() => import('../features/review/Review'));
const KanbanPage = lazy(() => import('../features/kanban/KanbanPage'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <Spinner size="lg" ariaLabel="Carregando…" />
  </div>
);

export function routes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/" element={<Home />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/decks/:id"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Deck />
            </Suspense>
          }
        />
        <Route
          path="/decks/:id/edit"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DeckEdit />
            </Suspense>
          }
        />
        <Route
          path="/decks/:id/review"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Review />
            </Suspense>
          }
        />
        <Route
          path="/novo-card"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <NewCardPage />
            </Suspense>
          }
        />
        <Route path="/importar" element={<Import />} />
        <Route
          path="/kanban"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <KanbanPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}