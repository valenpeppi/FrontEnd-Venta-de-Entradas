import React, { createContext, useReducer, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';


export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  date: string; 
  time: string;
  location: string;
  placeName: string;
  sectorName?: string;
  price: number;
  availableTickets: number;
  imageUrl: string;
  type: string;
  featured: boolean;
  agotado?: boolean;
  description?: string;
  quantity: number;
  idTicket?: number; 
}


export interface CartItem extends Ticket {
  quantity: number;
  seats?: (string | number)[];
  ticketIds?: number[]; 
}


interface CartState {
  cartItems: CartItem[];
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { ticket: Omit<CartItem, 'quantity'>; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'LOAD_CART'; payload: { items: CartItem[] } };

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (ticket: Omit<CartItem, 'quantity'>, quantity: number) => boolean;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateItemQuantity: (id: string, newQuantity: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { ticket, quantity } = action.payload;
      const existingItemIndex = state.cartItems.findIndex(item => item.id === ticket.id);
      
      let totalInCartForEvent = state.cartItems
        .filter(item => item.eventId === ticket.eventId)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (existingItemIndex > -1) {
        totalInCartForEvent -= state.cartItems[existingItemIndex].quantity;
      }

      if (totalInCartForEvent + quantity > 6) {
        return state;
      }
      
      if (existingItemIndex > -1) {
        const updatedItems = [...state.cartItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return { ...state, cartItems: updatedItems };
      } else {
        return { ...state, cartItems: [...state.cartItems, { ...ticket, quantity }] };
      }
    }
    
    case 'REMOVE_ITEM': {
      const { id } = action.payload;
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.id !== id)
      };
    }
    
    case 'CLEAR_CART': {
      return { ...state, cartItems: [] };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      const itemToUpdate = state.cartItems.find(item => item.id === id);
      if (!itemToUpdate) return state;

      const totalInCartForEvent = state.cartItems
        .filter(item => item.eventId === itemToUpdate.eventId && item.id !== id)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      if (totalInCartForEvent + quantity > 6) {
          return state; 
      }

      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }
    
    case 'LOAD_CART': {
      return { ...state, cartItems: action.payload.items };
    }
    
    default:
      return state;
  }
};

function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, { cartItems: [] });

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('ticket-cart');
      if (storedCart) {
        dispatch({ type: 'LOAD_CART', payload: { items: JSON.parse(storedCart) } });
      }
    } catch (error) {
      console.error("CartContext: Error al cargar el carrito de localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ticket-cart', JSON.stringify(state.cartItems));
    } catch (error) {
      console.error("CartContext: Error al guardar el carrito en localStorage:", error);
    }
  }, [state.cartItems]);

  const addToCart = (ticket: Omit<CartItem, 'quantity'>, quantity: number): boolean => {
    const totalInCartForEvent = state.cartItems
      .filter(item => item.eventId === ticket.eventId)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (totalInCartForEvent + quantity > 6) {
      return false;
    }
    
    dispatch({ type: 'ADD_TO_CART', payload: { ticket, quantity } });
    return true;
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const updateItemQuantity = (id: string, newQuantity: number): boolean => {
     const itemToUpdate = state.cartItems.find(item => item.id === id);
    if (!itemToUpdate) return false;

    const totalInCartForEvent = state.cartItems
      .filter(item => item.eventId === itemToUpdate.eventId && item.id !== id)
      .reduce((sum, item) => sum + item.quantity, 0);
      
    if (totalInCartForEvent + newQuantity > 6) {
      return false;
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    return true;
  };

  const cartCount = state.cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems: state.cartItems, 
      cartCount, 
      addToCart, 
      removeItem, 
      clearCart, 
      updateItemQuantity 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider };


export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

