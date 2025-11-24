import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  CheckCircle,
  Package,
  User,
  MapPin,
  Truck,
  CreditCard,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { formatCurrency, calculateTax, calculateTotal } from '../../lib/utils';
import type { CartItem, Customer, DeliveryMethod } from '../../types';

interface SaleConfirmationProps {
  items: CartItem[];
  customer: Customer;
  deliveryMethod: DeliveryMethod;
  itemsForDispatch?: string[];
  shippingCost?: number;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export const SaleConfirmation = ({
  items,
  customer,
  deliveryMethod,
  itemsForDispatch = [],
  shippingCost = 0,
  onConfirm,
  onBack,
  isProcessing = false,
  disabled = false,
}: SaleConfirmationProps) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax, shippingCost);

  const getDeliveryMethodLabel = () => {
    switch (deliveryMethod) {
      case 'IMMEDIATE':
        return 'Retiro Inmediato';
      case 'DISPATCH':
        return 'Despacho Completo';
      case 'MIXED':
        return 'Mixto';
      default:
        return deliveryMethod;
    }
  };

  const isItemForDispatch = (productId: string) => {
    if (deliveryMethod === 'DISPATCH') return true;
    if (deliveryMethod === 'IMMEDIATE') return false;
    return itemsForDispatch.includes(productId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Confirmar Venta</h2>
        <p className="text-gray-600 mt-2">
          Revisa todos los detalles antes de confirmar la venta
        </p>
      </div>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Productos ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-start justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-600 mt-1">SKU: {item.productSku}</p>
                    </div>
                    <Badge variant={isItemForDispatch(item.productId) ? 'default' : 'success'}>
                      {isItemForDispatch(item.productId) ? (
                        <>
                          <Truck className="h-3 w-3 mr-1" />
                          Despacho
                        </>
                      ) : (
                        <>
                          <Package className="h-3 w-3 mr-1" />
                          Retiro
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="font-medium text-gray-900">{customer.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900 text-sm">{customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="font-medium text-gray-900 text-sm">{customer.phone}</p>
            </div>
          </div>
          {customer.rut && (
            <div>
              <p className="text-sm text-gray-600">RUT</p>
              <p className="font-medium text-gray-900">{customer.rut}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      {customer.shippingAddress && deliveryMethod !== 'IMMEDIATE' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Dirección de Envío
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{customer.shippingAddress.street}</p>
            <p className="text-gray-600 mt-1">
              {customer.shippingAddress.city}, {customer.shippingAddress.state}
            </p>
            <p className="text-gray-600">
              {customer.shippingAddress.postalCode}, {customer.shippingAddress.country}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delivery Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5" />
            Método de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-gray-900">{getDeliveryMethodLabel()}</span>
            <Badge variant="default">{formatCurrency(shippingCost)}</Badge>
          </div>
          {deliveryMethod === 'MIXED' && (
            <p className="text-sm text-gray-600 mt-2">
              {itemsForDispatch.length} producto(s) por despacho,{' '}
              {items.length - itemsForDispatch.length} para retiro inmediato
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Resumen de Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>IVA (19%)</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            {shippingCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Costo de Envío</span>
                <span className="font-medium">{formatCurrency(shippingCost)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={disabled || isProcessing}
          className="flex-1"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </Button>
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={disabled || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Confirmar Venta
            </>
          )}
        </Button>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Al confirmar la venta se reservarán definitivamente los productos,
          se creará el registro de venta y, si corresponde, se generará la orden de despacho.
        </p>
      </div>
    </div>
  );
};
