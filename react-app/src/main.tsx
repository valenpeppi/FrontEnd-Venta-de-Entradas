import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext.tsx';
import { SearchProvider } from './context/SearchContext.tsx';
import { EventsProvider } from './context/EventsContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <SearchProvider>
          <EventsProvider>
            <App />
          </EventsProvider>
        </SearchProvider>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)
console.log('main.tsx: Aplicación renderizada dentro de CartProvider, SearchProvider y EventsProvider.');
