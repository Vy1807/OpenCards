// @ts-expect-error - react-router-dom v7 tipos não exportam esses membros no .d.ts, mas funcionam em tempo de execução.
import { BrowserRouter } from 'react-router-dom';
import { ThemeSwitcher } from '../shared/ui';
import { AuthProvider, CardsProvider } from './providers';
import { routes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CardsProvider>
          <div className="app">
            <ThemeSwitcher />
            {routes()}
          </div>
        </CardsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
