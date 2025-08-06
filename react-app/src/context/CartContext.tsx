import React, { createContext, useReducer, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Ticket } from '../App';

export interface CartItem extends Ticket {
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { ticket: Ticket; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'LOAD_CART'; payload: { items: CartItem[] } };

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (ticket: Ticket, quantity: number) => boolean;
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
      const currentQuantity = existingItemIndex > -1 ? state.cartItems[existingItemIndex].quantity : 0;
      
      if (currentQuantity + quantity > 3) {
        // No se puede agregar más de 3 entradas en total para este evento
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
      if (quantity < 1 || quantity > 3) return state;
      
      const idx = state.cartItems.findIndex(item => item.id === id);
      if (idx === -1) return state;
      
      const updatedItems = [...state.cartItems];
      updatedItems[idx] = { ...updatedItems[idx], quantity };
      return { ...state, cartItems: updatedItems };
    }
    
    case 'LOAD_CART': {
      return { ...state, cartItems: action.payload.items };
    }
    
    default:
      return state;
  }
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { cartItems: [] });

  useEffect(() => {
    localStorage.removeItem('ticket-cart');
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ticket-cart', JSON.stringify(state.cartItems));
      console.log('CartContext: Carrito guardado en localStorage:', state.cartItems);
    } catch (error) {
      console.error("CartContext: Error al guardar el carrito en localStorage:", error);
    }
  }, [state.cartItems]);

  const addToCart = (ticket: Ticket, quantity: number): boolean => {
    console.log(`CartContext: addToCart llamado para ticket ID: ${ticket.id}, cantidad: ${quantity}`);
    const existingItem = state.cartItems.find(item => item.id === ticket.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity + quantity > 3) {
      return false;
    }
    
    dispatch({ type: 'ADD_TO_CART', payload: { ticket, quantity } });
    return true;
  };

  const removeItem = (id: string) => {
    console.log(`CartContext: removeItem llamado para ticket ID: ${id}`);
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const clearCart = () => {
    console.log('CartContext: Vaciando carrito.');
    dispatch({ type: 'CLEAR_CART' });
  };

  const updateItemQuantity = (id: string, newQuantity: number): boolean => {
    if (newQuantity < 1 || newQuantity > 3) return false;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    return true;
  };

  const cartCount = state.cartItems.reduce((total, item) => total + item.quantity, 0);
  console.log('CartContext: cartCount actual:', cartCount);

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

// Asegúrate de que esta exportación esté presente y correcta
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
