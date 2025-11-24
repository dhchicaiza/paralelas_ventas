export enum SaleChannel {
  WEB = 'WEB',
  STORE = 'STORE',
}

export enum SaleStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  IN_PREPARATION = 'IN_PREPARATION',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AvailabilityType {
  STOCK = 'STOCK',
  MANUFACTURING = 'MANUFACTURING',
  MADE_TO_ORDER = 'MADE_TO_ORDER',
}

export enum DeliveryMethod {
  IMMEDIATE = 'IMMEDIATE',
  DISPATCH = 'DISPATCH',
  MIXED = 'MIXED',
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  availabilityType: AvailabilityType;
  stockQuantity?: number;
  manufacturingDays?: number;
  imageUrl?: string;
}

export interface ProductAvailability {
  productId: string;
  available: boolean;
  availabilityType: AvailabilityType;
  quantity: number;
  estimatedDate?: string;
  batchId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  reservationId?: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  identificacion?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  availabilityType?: AvailabilityType;
}

export interface CreateSaleDTO {
  channel: SaleChannel;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  items: SaleItem[];
  deliveryAddress?: Address;
  billingAddress?: Address;
  deliveryMethod: DeliveryMethod;
  immediateItems?: string[];
  dispatchItems?: string[];
}

export interface Sale {
  id: string;
  saleNumber: string;
  channel: SaleChannel;
  status: SaleStatus;
  customerId: string;
  customerEmail?: string;
  customerPhone?: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  items: SaleItem[];
  createdAt: string;
  estimatedDeliveryDate?: string;
}

export interface Reservation {
  id: string;
  productId: string;
  quantity: number;
  expiresAt: string;
  status: 'ACTIVE' | 'CONFIRMED' | 'RELEASED' | 'EXPIRED';
}
