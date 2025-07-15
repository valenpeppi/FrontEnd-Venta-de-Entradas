import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Ticket } from '../App';

export interface CartItem extends Ticket {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (ticket: Ticket, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const storedItems = localStorage.getItem('ticket-cart');
      const parsedItems = storedItems ? JSON.parse(storedItems) : [];
      console.log('CartContext: Inicializando carrito desde localStorage:', parsedItems);
      return parsedItems;
    } catch (error) {
      console.error("CartContext: Error al cargar el carrito desde localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ticket-cart', JSON.stringify(cartItems));
      console.log('CartContext: Carrito guardado en localStorage:', cartItems);
    } catch (error) {
      console.error("CartContext: Error al guardar el carrito en localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = (ticket: Ticket, quantity: number) => {
    console.log(`CartContext: addToCart llamado para ticket ID: ${ticket.id}, cantidad: ${quantity}`);
    setCartItems(prevItems => {
      console.log('CartContext: Estado previo del carrito (dentro de addToCart):', prevItems);
      const existingItemIndex = prevItems.findIndex(item => item.id === ticket.id);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        console.log('CartContext: Ticket existente, cantidad actualizada a:', updatedItems[existingItemIndex].quantity);
        return updatedItems;
      } else {
        console.log('CartContext: Ticket nuevo, añadiendo al carrito.');
        return [...prevItems, { ...ticket, quantity }];
      }
    });
  };

  const removeItem = (id: string) => {
    console.log(`CartContext: removeItem llamado para ticket ID: ${id}`);
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== id);
      console.log('CartContext: Carrito después de eliminar:', newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    console.log('CartContext: Vaciando carrito.');
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  console.log('CartContext: cartCount actual:', cartCount);


  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeItem, clearCart }}>
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
