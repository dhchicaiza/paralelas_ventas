import { useState, useEffect, useCallback } from 'react';
import {
  createReservation,
  confirmReservation,
  releaseReservation,
} from '../services/inventoryApi';
import type { Reservation } from '../types';

interface ReservationState {
  reservations: Map<string, Reservation>;
  isCreating: boolean;
  error: string | null;
}

export const useReservations = () => {
  const [state, setState] = useState<ReservationState>({
    reservations: new Map(),
    isCreating: false,
    error: null,
  });

  // Auto-cleanup expired reservations
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const activeReservations = new Map(state.reservations);
      let hasChanges = false;

      activeReservations.forEach((reservation, productId) => {
        const expiresAt = new Date(reservation.expiresAt);
        if (now >= expiresAt) {
          activeReservations.delete(productId);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setState((prev) => ({
          ...prev,
          reservations: activeReservations,
        }));
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [state.reservations]);

  const createNewReservation = useCallback(
    async (productId: string, quantity: number): Promise<Reservation | null> => {
      setState((prev) => ({ ...prev, isCreating: true, error: null }));

      try {
        const reservation = await createReservation(productId, quantity);

        setState((prev) => {
          const newReservations = new Map(prev.reservations);
          newReservations.set(productId, reservation);
          return {
            ...prev,
            reservations: newReservations,
            isCreating: false,
          };
        });

        return reservation;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al crear reserva';
        setState((prev) => ({
          ...prev,
          isCreating: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    []
  );

  const confirmAllReservations = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, error: null }));

    try {
      const confirmPromises = Array.from(state.reservations.values()).map((reservation) =>
        confirmReservation(reservation.id)
      );

      await Promise.all(confirmPromises);

      // Clear all reservations after confirmation
      setState((prev) => ({
        ...prev,
        reservations: new Map(),
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al confirmar reservas';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      return false;
    }
  }, [state.reservations]);

  const releaseReservationById = useCallback(
    async (productId: string): Promise<boolean> => {
      const reservation = state.reservations.get(productId);
      if (!reservation) return false;

      setState((prev) => ({ ...prev, error: null }));

      try {
        await releaseReservation(reservation.id);

        setState((prev) => {
          const newReservations = new Map(prev.reservations);
          newReservations.delete(productId);
          return {
            ...prev,
            reservations: newReservations,
          };
        });

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al liberar reserva';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        return false;
      }
    },
    [state.reservations]
  );

  const releaseAllReservations = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, error: null }));

    try {
      const releasePromises = Array.from(state.reservations.values()).map((reservation) =>
        releaseReservation(reservation.id)
      );

      await Promise.all(releasePromises);

      setState((prev) => ({
        ...prev,
        reservations: new Map(),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al liberar reservas';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [state.reservations]);

  const getReservation = useCallback(
    (productId: string): Reservation | undefined => {
      return state.reservations.get(productId);
    },
    [state.reservations]
  );

  const hasActiveReservation = useCallback(
    (productId: string): boolean => {
      const reservation = state.reservations.get(productId);
      if (!reservation) return false;

      const now = new Date();
      const expiresAt = new Date(reservation.expiresAt);
      return now < expiresAt;
    },
    [state.reservations]
  );

  const getTimeRemaining = useCallback(
    (productId: string): number => {
      const reservation = state.reservations.get(productId);
      if (!reservation) return 0;

      const now = new Date();
      const expiresAt = new Date(reservation.expiresAt);
      const diff = expiresAt.getTime() - now.getTime();

      return Math.max(0, diff);
    },
    [state.reservations]
  );

  return {
    reservations: state.reservations,
    isCreating: state.isCreating,
    error: state.error,
    createReservation: createNewReservation,
    confirmAllReservations,
    releaseReservation: releaseReservationById,
    releaseAllReservations,
    getReservation,
    hasActiveReservation,
    getTimeRemaining,
  };
};
