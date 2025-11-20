// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  inManufacturing?: number;
  estimatedDeliveryDate?: string;
  availability: 'STOCK' | 'MANUFACTURING' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK';
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
}

// Customer types
export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Order types
export interface Order {
  id?: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  deliveryType: 'IMMEDIATE' | 'SCHEDULED' | 'SEPARATE';
  scheduledDate?: string;
  paymentMethod: string;
  status?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
