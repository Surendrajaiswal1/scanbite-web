import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '../components/MenuItemList';

export interface CartItem extends MenuItem {
  cartQuantity: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface CartStore {
  items: CartItem[];
  shopSlug: string | null;
  customerDetails: CustomerDetails;
  addItem: (item: MenuItem, shopSlug: string) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  setCustomerDetails: (details: CustomerDetails) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      shopSlug: null,
      customerDetails: { name: '', phone: '', email: '', notes: '' },
      
      addItem: (item, shopSlug) => set((state) => {
        // If ordering from a new shop, clear previous cart
        let currentItems = state.items;
        if (state.shopSlug && state.shopSlug !== shopSlug) {
          currentItems = [];
        }

        const existingItem = currentItems.find(i => i.id === item.id);
        const maxQuantity = Number(item.quantity);
        
        if (existingItem) {
          // Check stock limit
          if (existingItem.cartQuantity >= maxQuantity) {
            return state;
          }
          
          return {
            shopSlug,
            items: currentItems.map(i => 
              i.id === item.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i
            )
          };
        }
        
        // Initial add, quantity must be > 0
        if (maxQuantity <= 0) return state;

        return {
          shopSlug,
          items: [...currentItems, { ...item, cartQuantity: 1 }]
        };
      }),

      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(i => i.id !== itemId)
      })),

      updateQuantity: (itemId, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(i => i.id !== itemId)
          };
        }
        return {
          items: state.items.map(i => {
            if (i.id === itemId) {
              // Ensure we don't exceed stock limit on update
              const maxQuantity = Number(i.quantity);
              return { ...i, cartQuantity: Math.min(quantity, maxQuantity) };
            }
            return i;
          })
        };
      }),

      setCustomerDetails: (details) => set({ customerDetails: details }),

      clearCart: () => set({ items: [], shopSlug: null, customerDetails: { name: '', phone: '', email: '', notes: '' } })
    }),
    {
      name: 'scanbite-cart',
    }
  )
);
