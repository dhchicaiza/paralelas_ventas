#!/bin/bash
# Script completo para crear el frontend del Portal de Ventas
set -e

FRONTEND_DIR="/home/dhcu/Desarrollo/paralelas_ventas/frontend"
cd $FRONTEND_DIR

echo "🚀 Creando frontend completo del Portal de Ventas..."

# ===========================================
# TIPOS TYPESCRIPT
# ===========================================
echo "📝 Creando tipos TypeScript..."

cat > src/types/index.ts << 'EOF'
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
EOF

# ===========================================
# UTILIDADES
# ===========================================
echo "🛠️  Creando utilidades..."

cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function calculateTax(subtotal: number, taxRate: number = 0.19): number {
  return subtotal * taxRate;
}

export function calculateTotal(subtotal: number, tax: number, shipping: number = 0): number {
  return subtotal + tax + shipping;
}
EOF

# ===========================================
# SERVICIOS API
# ===========================================
echo "🌐 Creando servicios API..."

cat > src/services/api.ts << 'EOF'
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejar error de autenticación
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
EOF

cat > src/services/salesApi.ts << 'EOF'
import { api } from './api';
import { CreateSaleDTO, Sale } from '../types';

export const salesApi = {
  createSale: async (data: CreateSaleDTO): Promise<Sale> => {
    const response = await api.post<Sale>('/sales', data);
    return response.data;
  },

  getSale: async (id: string): Promise<Sale> => {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  listSales: async (): Promise<Sale[]> => {
    const response = await api.get<Sale[]>('/sales');
    return response.data;
  },
};
EOF

cat > src/services/inventoryApi.ts << 'EOF'
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
EOF

cat > src/services/dispatchApi.ts << 'EOF'
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
EOF

# ===========================================
# COMPONENTES UI BASE
# ===========================================
echo "🎨 Creando componentes UI..."

cat > src/components/ui/Button.tsx << 'EOF'
import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-secondary/80',
    ghost: 'hover:bg-secondary/80',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
EOF

cat > src/components/ui/Card.tsx << 'EOF'
import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('rounded-lg border bg-white p-6 shadow-sm', className)}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-1.5 mb-4', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
    {children}
  </div>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('', className)}>
    {children}
  </div>
);
EOF

cat > src/components/ui/Input.tsx << 'EOF'
import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <input
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
EOF

cat > src/components/ui/Badge.tsx << 'EOF'
import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
EOF

echo "✅ Frontend base creado exitosamente!"
echo ""
echo "📁 Estructura creada:"
echo "  - Tipos TypeScript completos"
echo "  - Servicios API (Sales, Inventory Mock, Dispatch Mock)"
echo "  - Componentes UI base (Button, Card, Input, Badge)"
echo "  - Utilidades y helpers"
echo ""
echo "⏭️  Próximos pasos:"
echo "  1. Ejecutar: cd frontend && npm run dev"
echo "  2. El frontend estará disponible en http://localhost:5173"
echo ""
echo "🎯 Funcionalidades implementadas:"
echo "  ✅ Sistema de tipos completo"
echo "  ✅ Mock de API de Inventarios con productos"
echo "  ✅ Mock de API de Despachos"
echo "  ✅ Servicio real de Sales API"
echo "  ✅ Componentes UI base reutilizables"
EOF

chmod +x /home/dhcu/Desarrollo/paralelas_ventas/create-frontend-complete.sh
