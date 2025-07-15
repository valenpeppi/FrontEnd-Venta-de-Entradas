import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext.tsx';
import { SearchProvider } from './context/SearchContext.tsx';
import { EventsProvider } from './context/EventsContext.tsx'; // Importa el EventsProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* Envuelve la aplicación con todos los proveedores de contexto */}
      <CartProvider>
        <SearchProvider>
          <EventsProvider> {/* Nuevo: Envuelve con EventsProvider */}
            <App />
          </EventsProvider>
        </SearchProvider>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)
console.log('main.tsx: Aplicación renderizada dentro de CartProvider, SearchProvider y EventsProvider.');
