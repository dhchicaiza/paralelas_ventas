import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Package, Plus, Clock, Wrench, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import type { Product, AvailabilityType } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  disabled?: boolean;
}

export const ProductCard = ({ product, onAddToCart, disabled = false }: ProductCardProps) => {
  const getAvailabilityInfo = () => {
    switch (product.availabilityType) {
      case 'STOCK':
        return {
          icon: Package,
          label: 'En Stock',
          variant: 'success' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          detail: `${product.stockQuantity} unidades disponibles`,
        };
      case 'MANUFACTURING':
        return {
          icon: Wrench,
          label: 'En Fabricación',
          variant: 'warning' as const,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          detail: `Disponible en ${product.estimatedDays || 0} días`,
        };
      case 'MADE_TO_ORDER':
        return {
          icon: Clock,
          label: 'Bajo Pedido',
          variant: 'default' as const,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          detail: `Fabricación en ${product.estimatedDays || 0} días`,
        };
      default:
        return {
          icon: Package,
          label: 'Disponible',
          variant: 'default' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          detail: '',
        };
    }
  };

  const availability = getAvailabilityInfo();
  const Icon = availability.icon;
  const isOutOfStock = product.availabilityType === 'STOCK' && (product.stockQuantity || 0) === 0;

  const handleAddToCart = () => {
    if (!disabled && !isOutOfStock) {
      onAddToCart(product, 1);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Product Image Placeholder */}
          <div className={`${availability.bgColor} p-4 rounded-lg flex-shrink-0`}>
            <Package className={`h-12 w-12 ${availability.color}`} />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">SKU: {product.sku}</p>
              </div>
              <Badge variant={availability.variant}>{availability.label}</Badge>
            </div>

            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {product.description}
              </p>
            )}

            {/* Availability Detail */}
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-4 w-4 ${availability.color}`} />
              <span className={`text-sm font-medium ${availability.color}`}>
                {availability.detail}
              </span>
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </p>
                {product.availabilityType === 'MADE_TO_ORDER' && (
                  <p className="text-xs text-gray-500 mt-1">Pago anticipado requerido</p>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={disabled || isOutOfStock}
                size="sm"
                className="flex-shrink-0"
              >
                {isOutOfStock ? (
                  'Sin Stock'
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Agregar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
