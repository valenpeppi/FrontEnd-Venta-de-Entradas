import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './shared/styles/Main.css';

import App from './App.tsx';
import { CartProvider } from './shared/context/CartContext.tsx';
import { SearchProvider } from './shared/context/SearchContext.tsx';
import { EventsProvider } from './shared/context/EventsContext.tsx';
import { AuthProvider } from './shared/context/AuthContext.tsx';
import { MessageProvider } from './shared/context/MessageContext.tsx';
import { EventDetailProvider } from './shared/context/EventDetailContext.tsx';
import GlobalErrorBoundary from './shared/error/GlobalErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <MessageProvider>
            <CartProvider>
              <SearchProvider>
                <EventsProvider>
                  <EventDetailProvider>
                    <App />
                  </EventDetailProvider>
                </EventsProvider>
              </SearchProvider>
            </CartProvider>
          </MessageProvider>
        </AuthProvider>
      </BrowserRouter>
    </GlobalErrorBoundary>
  </StrictMode>
);

console.log('main.tsx: Aplicación renderizada dentro de todos los providers (Auth, Message, Cart, Search, Events, EventDetail).');
