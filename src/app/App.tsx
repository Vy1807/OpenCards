import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/ui';
import BottomNavigation from '../components/ui/BottomNavigation';
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
            <BottomNavigation />
          </div>
        </CardsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
