import { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Package, Trash2, Clock, Lock } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import type { CartItem as CartItemType } from '../../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  disabled?: boolean;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove, disabled = false }: CartItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;

    // For STOCK items, check against available quantity
    if (item.availabilityType === 'STOCK' && item.availability) {
      if (newQuantity > item.availability.quantity) {
        return;
      }
    }

    setQuantity(newQuantity);
    onUpdateQuantity(item.productId, newQuantity);
  };

  const calculateTimeRemaining = () => {
    if (!item.reservation) return null;

    const now = new Date();
    const expiresAt = new Date(item.reservation.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return 'Expirada';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const timeRemaining = calculateTimeRemaining();
  const isReserved = item.reservation && timeRemaining !== 'Expirada';

  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      {/* Product Image Placeholder */}
      <div className="bg-gray-100 p-3 rounded-lg flex-shrink-0">
        <Package className="h-10 w-10 text-gray-600" />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{item.productName}</h4>
            <p className="text-sm text-gray-600 mt-1">SKU: {item.productSku}</p>
          </div>

          {/* Reservation Badge */}
          {isReserved && (
            <Badge variant="success" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Reservado
            </Badge>
          )}
        </div>

        {/* Reservation Timer */}
        {isReserved && timeRemaining && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-orange-600 font-medium">
              Expira en: {timeRemaining}
            </span>
          </div>
        )}

        {/* Availability Info */}
        <div className="mt-2">
          {item.availabilityType === 'STOCK' && (
            <p className="text-xs text-gray-600">
              Stock disponible: {item.availability?.quantity || 0} unidades
            </p>
          )}
          {item.availabilityType === 'MANUFACTURING' && (
            <p className="text-xs text-gray-600">
              En fabricación - Disponible en {item.availability?.estimatedDays || 0} días
            </p>
          )}
          {item.availabilityType === 'MADE_TO_ORDER' && (
            <p className="text-xs text-gray-600">
              Bajo pedido - Fabricación en {item.availability?.estimatedDays || 0} días
            </p>
          )}
        </div>

        {/* Quantity Controls and Price */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={disabled || quantity <= 1}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <span className="font-medium text-gray-900 w-12 text-center">
              {quantity}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={
                disabled ||
                (item.availabilityType === 'STOCK' &&
                  item.availability &&
                  quantity >= item.availability.quantity)
              }
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {formatCurrency(item.unitPrice)} c/u
              </p>
              <p className="font-bold text-gray-900">
                {formatCurrency(item.subtotal)}
              </p>
            </div>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRemove(item.productId)}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
