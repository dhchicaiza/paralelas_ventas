import { Product, ProductAvailability, Reservation } from '../types';

// Mock de la API de Inventarios
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Laptop HP ProBook 450',
    sku: 'HP-PB450-001',
    price: 899990,
    availabilityType: 'STOCK',
    stockQuantity: 15,
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 'prod-2',
    name: 'Monitor Dell 27" 4K',
    sku: 'DELL-MON27-4K',
    price: 450000,
    availabilityType: 'STOCK',
    stockQuantity: 8,
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 'prod-3',
    name: 'Teclado Mecánico RGB',
    sku: 'KBD-RGB-PRO',
    price: 89990,
    availabilityType: 'MANUFACTURING',
    manufacturingDays: 5,
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 'prod-4',
    name: 'Mouse Inalámbrico Logitech',
    sku: 'LOG-MX-MASTER',
    price: 75000,
    availabilityType: 'STOCK',
    stockQuantity: 25,
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 'prod-5',
    name: 'Webcam 4K Pro',
    sku: 'CAM-4K-PRO',
    price: 120000,
    availabilityType: 'MADE_TO_ORDER',
    manufacturingDays: 15,
    imageUrl: 'https://via.placeholder.com/150',
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const inventoryApi = {
  searchProducts: async (query: string): Promise<Product[]> => {
    await delay(300);
    return MOCK_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase())
    );
  },

  getProduct: async (id: string): Promise<Product | null> => {
    await delay(200);
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  },

  checkAvailability: async (productId: string, quantity: number): Promise<ProductAvailability> => {
    await delay(300);
    const product = MOCK_PRODUCTS.find(p => p.id === productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const available = product.availabilityType === 'STOCK'
      ? (product.stockQuantity || 0) >= quantity
      : true;

    let estimatedDate: string | undefined;
    if (product.availabilityType !== 'STOCK' && product.manufacturingDays) {
      const date = new Date();
      date.setDate(date.getDate() + product.manufacturingDays);
      estimatedDate = date.toISOString();
    }

    return {
      productId,
      available,
      availabilityType: product.availabilityType,
      quantity: product.stockQuantity || 0,
      estimatedDate,
    };
  },

  createReservation: async (productId: string, quantity: number): Promise<Reservation> => {
    await delay(400);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutos

    return {
      id: `res-${Date.now()}`,
      productId,
      quantity,
      expiresAt: expiresAt.toISOString(),
      status: 'ACTIVE',
    };
  },

  confirmReservation: async (reservationId: string): Promise<void> => {
    await delay(200);
    console.log('Reservation confirmed:', reservationId);
  },

  releaseReservation: async (reservationId: string): Promise<void> => {
    await delay(200);
    console.log('Reservation released:', reservationId);
  },
};
