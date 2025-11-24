import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './useCart';
import { useReservations } from './useReservations';
import { createSale } from '../services/salesApi';
import { checkAvailability as checkDispatchAvailability, createDispatch } from '../services/dispatchApi';
import type { Customer, DeliveryMethod, SaleItem, CreateSaleDTO } from '../types';

enum SaleStep {
  PRODUCTS = 1,
  CART = 2,
  CUSTOMER = 3,
  DELIVERY = 4,
  CONFIRMATION = 5,
}

interface SaleFlowState {
  currentStep: SaleStep;
  customer: Customer | null;
  deliveryMethod: DeliveryMethod | null;
  itemsForDispatch: string[];
  shippingCost: number;
  isProcessing: boolean;
  error: string | null;
}

export const useSaleFlow = () => {
  const navigate = useNavigate();
  const cart = useCart();
  const { confirmAllReservations, releaseAllReservations } = useReservations();

  const [state, setState] = useState<SaleFlowState>({
    currentStep: SaleStep.PRODUCTS,
    customer: null,
    deliveryMethod: null,
    itemsForDispatch: [],
    shippingCost: 0,
    isProcessing: false,
    error: null,
  });

  // Navigation
  const goToNextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, SaleStep.CONFIRMATION) as SaleStep,
    }));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, SaleStep.PRODUCTS) as SaleStep,
    }));
  }, []);

  const goToStep = useCallback((step: SaleStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  // Step completion handlers
  const completeProductSelection = useCallback(() => {
    if (cart.items.length === 0) {
      setState((prev) => ({
        ...prev,
        error: 'Debes agregar al menos un producto al carrito',
      }));
      return false;
    }

    goToNextStep();
    return true;
  }, [cart.items.length, goToNextStep]);

  const completeCartReview = useCallback(() => {
    if (cart.items.length === 0) {
      setState((prev) => ({
        ...prev,
        error: 'El carrito está vacío',
      }));
      return false;
    }

    goToNextStep();
    return true;
  }, [cart.items.length, goToNextStep]);

  const completeCustomerInfo = useCallback((customer: Customer) => {
    setState((prev) => ({
      ...prev,
      customer,
      error: null,
    }));
    goToNextStep();
    return true;
  }, [goToNextStep]);

  const completeDeliverySelection = useCallback(
    (method: DeliveryMethod, itemsForDispatch: string[] = []) => {
      // Calculate shipping cost
      let shippingCost = 0;
      if (method === 'DISPATCH') {
        shippingCost = 5000;
      } else if (method === 'MIXED' && itemsForDispatch.length > 0) {
        shippingCost = 5000;
      }

      setState((prev) => ({
        ...prev,
        deliveryMethod: method,
        itemsForDispatch,
        shippingCost,
        error: null,
      }));

      goToNextStep();
      return true;
    },
    [goToNextStep]
  );

  const confirmSale = useCallback(async () => {
    if (!state.customer || !state.deliveryMethod) {
      setState((prev) => ({
        ...prev,
        error: 'Información incompleta',
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isProcessing: true, error: null }));

    try {
      // 1. Confirm all reservations
      const reservationsConfirmed = await confirmAllReservations();
      if (!reservationsConfirmed) {
        throw new Error('No se pudieron confirmar las reservas');
      }

      // 2. Prepare sale items
      const saleItems: SaleItem[] = cart.items.map((item) => {
        const isForDispatch = state.deliveryMethod === 'DISPATCH' ||
          (state.deliveryMethod === 'MIXED' && state.itemsForDispatch.includes(item.productId));

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          deliveryMethod: isForDispatch ? 'DISPATCH' : 'IMMEDIATE',
        };
      });

      // 3. Create sale
      const saleData: CreateSaleDTO = {
        channel: 'IN_STORE',
        customer: state.customer,
        items: saleItems,
        shippingCost: state.shippingCost,
      };

      const sale = await createSale(saleData);

      // 4. Create dispatch if needed
      if (state.deliveryMethod === 'DISPATCH' ||
          (state.deliveryMethod === 'MIXED' && state.itemsForDispatch.length > 0)) {

        const dispatchItems = saleItems.filter(item => item.deliveryMethod === 'DISPATCH');

        if (dispatchItems.length > 0 && state.customer.shippingAddress) {
          try {
            // Check dispatch availability
            await checkDispatchAvailability(
              state.customer.shippingAddress.city,
              state.customer.shippingAddress.postalCode
            );

            // Create dispatch order
            await createDispatch({
              saleId: sale.id,
              address: state.customer.shippingAddress,
              items: dispatchItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            });
          } catch (dispatchError) {
            console.error('Error creating dispatch:', dispatchError);
            // Sale was created but dispatch failed - log it but don't fail the whole process
          }
        }
      }

      // 5. Clear cart and reset state
      cart.clearCart();
      setState({
        currentStep: SaleStep.PRODUCTS,
        customer: null,
        deliveryMethod: null,
        itemsForDispatch: [],
        shippingCost: 0,
        isProcessing: false,
        error: null,
      });

      // 6. Navigate to sale details
      navigate(`/ventas/${sale.id}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar la venta';
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));

      // Release all reservations on error
      await releaseAllReservations();
      return false;
    }
  }, [
    state.customer,
    state.deliveryMethod,
    state.itemsForDispatch,
    state.shippingCost,
    cart,
    confirmAllReservations,
    releaseAllReservations,
    navigate,
  ]);

  const cancelSale = useCallback(async () => {
    // Release all reservations
    await releaseAllReservations();

    // Clear cart
    cart.clearCart();

    // Reset state
    setState({
      currentStep: SaleStep.PRODUCTS,
      customer: null,
      deliveryMethod: null,
      itemsForDispatch: [],
      shippingCost: 0,
      isProcessing: false,
      error: null,
    });

    // Navigate to dashboard
    navigate('/');
  }, [cart, releaseAllReservations, navigate]);

  return {
    // State
    currentStep: state.currentStep,
    customer: state.customer,
    deliveryMethod: state.deliveryMethod,
    itemsForDispatch: state.itemsForDispatch,
    shippingCost: state.shippingCost,
    isProcessing: state.isProcessing,
    error: state.error,

    // Cart
    cart,

    // Navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,

    // Step completion
    completeProductSelection,
    completeCartReview,
    completeCustomerInfo,
    completeDeliverySelection,

    // Actions
    confirmSale,
    cancelSale,

    // Constants
    SaleStep,
  };
};
