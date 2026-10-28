import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/ui';
import { AuthProvider, CardsProvider } from './providers';
import { routes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CardsProvider>
          <div className="app" style={{ display: 'flex', flexDirection: 'column' }}>
            <Header title="OpenCards" />
            {routes()}
          </div>
        </CardsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
