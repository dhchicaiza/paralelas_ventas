import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { CartItem } from './CartItem';
import { ShoppingCart, AlertCircle, ArrowRight } from 'lucide-react';
import { formatCurrency, calculateTax, calculateTotal } from '../../lib/utils';
import type { CartItem as CartItemType } from '../../types';

interface CartProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  disabled?: boolean;
}

export const Cart = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  disabled = false,
}: CartProps) => {
  const isEmpty = items.length === 0;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);

  // Check if there are any expiring reservations
  const hasExpiringReservations = items.some((item) => {
    if (!item.reservation) return false;
    const now = new Date();
    const expiresAt = new Date(item.reservation.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();
    return diff > 0 && diff < 5 * 60 * 1000; // Less than 5 minutes
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Carrito de Compras
            {!isEmpty && (
              <span className="text-sm font-normal text-gray-600">
                ({items.length} {items.length === 1 ? 'producto' : 'productos'})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEmpty ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600">
                Busca productos y agrégalos al carrito para comenzar una venta
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveItem}
                  disabled={disabled}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!isEmpty && (
        <>
          {/* Expiring Reservations Warning */}
          {hasExpiringReservations && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900">
                  ¡Reservas por expirar!
                </p>
                <p className="text-sm text-orange-800 mt-1">
                  Algunas reservas expirarán en menos de 5 minutos. Completa la venta
                  pronto para mantener los productos reservados.
                </p>
              </div>
            </div>
          )}

          {/* Totals Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (19%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={onProceedToCheckout}
                disabled={disabled}
                size="lg"
                className="w-full mt-6"
              >
                Continuar con la Venta
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Las reservas se confirmarán al completar la venta
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
