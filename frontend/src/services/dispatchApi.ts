import { Address } from '../types';

export interface DispatchRequest {
  saleId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: Address;
  scheduledDate?: string;
}

export interface DispatchResponse {
  id: string;
  trackingNumber: string;
  estimatedDelivery: string;
  status: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dispatchApi = {
  checkAvailability: async (address: Address, scheduledDate?: string): Promise<boolean> => {
    await delay(300);
    // Mock: siempre disponible
    return true;
  },

  createDispatch: async (request: DispatchRequest): Promise<DispatchResponse> => {
    await delay(500);

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3); // 3 días

    return {
      id: `disp-${Date.now()}`,
      trackingNumber: `TRK${Date.now()}`,
      estimatedDelivery: estimatedDelivery.toISOString(),
      status: 'PENDING_PICKUP',
    };
  },
};
