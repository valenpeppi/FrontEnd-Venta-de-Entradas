import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './shared/styles/Main.css';
import './shared/styles/Tailwind.css';                     
//import '@fortawesome/fontawesome-free/css/all.min.css'; 
import App from './App.tsx';
import { CartProvider } from './shared/context/CartContext.tsx';
import { SearchProvider } from './shared/context/SearchContext.tsx';
import { EventsProvider } from './shared/context/EventsContext.tsx';
import { AuthProvider } from './shared/context/AuthContext.tsx';
import { MessageProvider } from './shared/context/MessageContext.tsx';
import { EventDetailProvider } from './shared/context/EventDetailContext.tsx'; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>
);

console.log('main.tsx: Aplicación renderizada dentro de todos los providers (Auth, Message, Cart, Search, Events, EventDetail).');
