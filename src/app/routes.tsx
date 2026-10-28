// @ts-expect-error - react-router-dom v7 tipos não exportam esses membros no .d.ts, mas funcionam em tempo de execução.
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import Login from '../features/auth/Login';
import Home from '../features/decks/Home';
import Deck from '../features/decks/Deck';
import DeckEdit from '../features/decks/DeckEdit';
import Review from '../features/review/Review';

export function routes() {
  return (
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
  );
}
