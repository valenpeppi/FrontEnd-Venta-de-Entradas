import { createContext, useReducer, useEffect, useContext } from 'react';

import { SystemService } from '../../services/SystemService';
import { SalesService } from '../../services/SalesService';
import type { CartItem } from '../../types/cart';



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
  canAddTicketsToEvent: (eventId: string | number, quantity: number) => Promise<boolean>;
}

import type { CartProviderProps } from '../../types/cart';

const CartContext = createContext<CartContextType | undefined>(undefined);


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
        return {
          ...state,
          cartItems: [
            ...state.cartItems,
            {
              ...ticket,
              quantity,
              idPlace: ticket.idPlace ?? 0,
              idSector: ticket.idSector ?? 0,
              ticketIds: Array.isArray(ticket.ticketIds)
                ? ticket.ticketIds.map(id => Number(id))
                : [],
            },
          ],
        };
      }
    }

    case 'REMOVE_ITEM': {
      const { id } = action.payload;
      return { ...state, cartItems: state.cartItems.filter(item => item.id !== id) };
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
    const checkBoot = async () => {
      try {
        const data = await SystemService.getBoot();
        const serverBoot = data?.bootId;
        const localBoot = localStorage.getItem('bootId');

        if (!serverBoot) return;

        if (!localBoot) {
          localStorage.setItem('bootId', serverBoot);
          return;
        }

        if (localBoot !== serverBoot) {
          console.log("Reiniciando carrito por cambio de versión del servidor");
          localStorage.setItem('bootId', serverBoot);
          // Do not clear token here, AuthContext handles token validation.
          // localStorage.removeItem('token'); 
          localStorage.removeItem('ticket-cart');
          localStorage.removeItem('ticketGroups');
          // Maybe keep dniClient/saleConfirmed or clear them if they are cart-related?
          // Assuming saleConfirmed is relevant to current session.
          localStorage.removeItem('saleConfirmed');

          dispatch({ type: 'CLEAR_CART' });
        }
      } catch (e) {
        console.warn('No se pudo obtener /api/system/boot', e);
      }
    };
    checkBoot();
  }, []);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('ticket-cart');
      if (storedCart) {
        dispatch({ type: 'LOAD_CART', payload: { items: JSON.parse(storedCart) } });
      }
    } catch (error) {
      console.error('CartContext: Error al cargar el carrito de localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (state.cartItems.length > 0) {
        localStorage.setItem('ticket-cart', JSON.stringify(state.cartItems));
      } else {
        localStorage.removeItem('ticket-cart');
      }
    } catch (error) {
      console.error('CartContext: Error al guardar el carrito en localStorage:', error);
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

  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const updateItemQuantity = (id: string, newQuantity: number): boolean => {
    const itemToUpdate = state.cartItems.find(item => item.id === id);
    if (!itemToUpdate) return false;

    const totalInCartForEvent = state.cartItems
      .filter(item => item.eventId === itemToUpdate.eventId && item.id !== id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (totalInCartForEvent + newQuantity > 6) return false;

    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    return true;
  };


  const canAddTicketsToEvent = async (eventId: string | number, quantity: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const eventIdStr = String(eventId);
      const currentInCart = state.cartItems
        .filter(item => String(item.eventId) === eventIdStr)
        .reduce((sum, item) => sum + item.quantity, 0);

      const res = await SalesService.getMyTickets();

      const alreadyBought = (res.data?.data || []).filter((t: any) => String(t.eventId) === eventIdStr).length;
      const total = alreadyBought + currentInCart + quantity;
      return total <= 6;
    } catch (err) {
      console.error("🛑 Error verificando cantidad total de entradas:", err);
      return false;
    }
  };

  const cartCount = state.cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems: state.cartItems,
        cartCount,
        addToCart,
        removeItem,
        clearCart,
        updateItemQuantity,
        canAddTicketsToEvent,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export { CartProvider };

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
