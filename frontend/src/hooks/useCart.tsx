import { useState, useCallback, useEffect } from 'react';
import { useReservations } from './useReservations';
import { checkAvailability } from '../services/inventoryApi';
import type { CartItem, Product, ProductAvailability } from '../types';

interface UseCartReturn {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItem: (productId: string) => CartItem | undefined;
}

export const useCart = (): UseCartReturn => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    createReservation,
    releaseReservation,
    getReservation,
    hasActiveReservation,
  } = useReservations();

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  // Auto-remove items with expired reservations
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((currentItems) => {
        const now = new Date();
        return currentItems.filter((item) => {
          if (!item.reservation) return true;
          const expiresAt = new Date(item.reservation.expiresAt);
          return now < expiresAt;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addToCart = useCallback(
    async (product: Product, quantity: number): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if product already exists in cart
        const existingItem = items.find((item) => item.productId === product.id);
        if (existingItem) {
          setError('Este producto ya está en el carrito. Actualiza la cantidad en el carrito.');
          setIsLoading(false);
          return false;
        }

        // Check availability
        const availability = await checkAvailability(product.id);

        // Validate quantity based on availability type
        if (product.availabilityType === 'STOCK') {
          if (availability.quantity < quantity) {
            setError(`Solo hay ${availability.quantity} unidades disponibles`);
            setIsLoading(false);
            return false;
          }

          // Create reservation for STOCK items
          const reservation = await createReservation(product.id, quantity);
          if (!reservation) {
            setError('No se pudo crear la reserva. Intenta nuevamente.');
            setIsLoading(false);
            return false;
          }

          // Add to cart with reservation
          const cartItem: CartItem = {
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity,
            unitPrice: product.price,
            subtotal: product.price * quantity,
            availabilityType: product.availabilityType,
            availability,
            reservation,
          };

          setItems((prev) => [...prev, cartItem]);
        } else {
          // For MANUFACTURING and MADE_TO_ORDER, no reservation needed
          const cartItem: CartItem = {
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity,
            unitPrice: product.price,
            subtotal: product.price * quantity,
            availabilityType: product.availabilityType,
            availability,
          };

          setItems((prev) => [...prev, cartItem]);
        }

        setIsLoading(false);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al agregar al carrito';
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }
    },
    [items, createReservation]
  );

  const updateQuantity = useCallback(
    async (productId: string, newQuantity: number): Promise<boolean> => {
      if (newQuantity < 1) return false;

      setIsLoading(true);
      setError(null);

      try {
        const item = items.find((i) => i.productId === productId);
        if (!item) {
          setError('Producto no encontrado en el carrito');
          setIsLoading(false);
          return false;
        }

        // Check availability for STOCK items
        if (item.availabilityType === 'STOCK') {
          if (newQuantity > item.availability.quantity) {
            setError(`Solo hay ${item.availability.quantity} unidades disponibles`);
            setIsLoading(false);
            return false;
          }

          // Release old reservation
          if (item.reservation) {
            await releaseReservation(productId);
          }

          // Create new reservation with updated quantity
          const newReservation = await createReservation(productId, newQuantity);
          if (!newReservation) {
            setError('No se pudo actualizar la reserva');
            setIsLoading(false);
            return false;
          }

          // Update item
          setItems((prev) =>
            prev.map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantity: newQuantity,
                    subtotal: i.unitPrice * newQuantity,
                    reservation: newReservation,
                  }
                : i
            )
          );
        } else {
          // For non-STOCK items, just update quantity
          setItems((prev) =>
            prev.map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantity: newQuantity,
                    subtotal: i.unitPrice * newQuantity,
                  }
                : i
            )
          );
        }

        setIsLoading(false);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cantidad';
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }
    },
    [items, createReservation, releaseReservation]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const item = items.find((i) => i.productId === productId);

        // Release reservation if exists
        if (item?.reservation) {
          await releaseReservation(productId);
        }

        // Remove from cart
        setItems((prev) => prev.filter((i) => i.productId !== productId));
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto';
        setError(errorMessage);
        setIsLoading(false);
      }
    },
    [items, releaseReservation]
  );

  const clearCart = useCallback(() => {
    // Release all reservations
    items.forEach((item) => {
      if (item.reservation) {
        releaseReservation(item.productId);
      }
    });

    setItems([]);
    setError(null);
  }, [items, releaseReservation]);

  const getItem = useCallback(
    (productId: string): CartItem | undefined => {
      return items.find((item) => item.productId === productId);
    },
    [items]
  );

  return {
    items,
    itemCount,
    subtotal,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getItem,
  };
};
