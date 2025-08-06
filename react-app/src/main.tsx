import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext.tsx';
import { SearchProvider } from './context/SearchContext.tsx';
import { EventsProvider } from './context/EventsContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { MessageProvider } from './context/MessageContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MessageProvider>
          <CartProvider>
            <SearchProvider>
              <EventsProvider>
                <App />
              </EventsProvider>
            </SearchProvider>
          </CartProvider>
        </MessageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
console.log('main.tsx: Aplicación renderizada dentro de todos los providers (Auth, Message, Cart, Search, Events).');
