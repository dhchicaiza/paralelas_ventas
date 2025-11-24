import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Truck, Package, Split, ArrowRight, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import type { CartItem, DeliveryMethod } from '../../types';

interface DeliverySelectorProps {
  items: CartItem[];
  onSubmit: (method: DeliveryMethod, itemsForDispatch?: string[]) => void;
  disabled?: boolean;
}

export const DeliverySelector = ({ items, onSubmit, disabled = false }: DeliverySelectorProps) => {
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod | null>(null);
  const [selectedItemsForDispatch, setSelectedItemsForDispatch] = useState<Set<string>>(
    new Set()
  );

  // Calculate estimated shipping cost (mock calculation)
  const calculateShippingCost = (): number => {
    if (selectedMethod === 'IMMEDIATE') return 0;
    if (selectedMethod === 'DISPATCH') return 5000;
    if (selectedMethod === 'MIXED') {
      // Calculate based on items selected for dispatch
      return selectedItemsForDispatch.size > 0 ? 5000 : 0;
    }
    return 0;
  };

  const handleMethodSelect = (method: DeliveryMethod) => {
    setSelectedMethod(method);
    if (method === 'DISPATCH') {
      // All items will be dispatched
      setSelectedItemsForDispatch(new Set(items.map((item) => item.productId)));
    } else if (method === 'IMMEDIATE') {
      // No items will be dispatched
      setSelectedItemsForDispatch(new Set());
    }
    // For MIXED, user will select items manually
  };

  const toggleItemForDispatch = (productId: string) => {
    const newSet = new Set(selectedItemsForDispatch);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    setSelectedItemsForDispatch(newSet);
  };

  const handleSubmit = () => {
    if (!selectedMethod) return;

    if (selectedMethod === 'MIXED') {
      if (selectedItemsForDispatch.size === 0 || selectedItemsForDispatch.size === items.length) {
        // Invalid mixed selection
        return;
      }
      onSubmit(selectedMethod, Array.from(selectedItemsForDispatch));
    } else if (selectedMethod === 'DISPATCH') {
      onSubmit(selectedMethod, items.map((item) => item.productId));
    } else {
      onSubmit(selectedMethod);
    }
  };

  const isValidSelection =
    selectedMethod &&
    (selectedMethod !== 'MIXED' ||
      (selectedItemsForDispatch.size > 0 && selectedItemsForDispatch.size < items.length));

  return (
    <div className="space-y-6">
      {/* Delivery Method Options */}
      <Card>
        <CardHeader>
          <CardTitle>Selecciona el Método de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Immediate Pickup */}
          <button
            type="button"
            onClick={() => handleMethodSelect('IMMEDIATE')}
            disabled={disabled}
            className={`
              w-full p-4 rounded-lg border-2 transition-all text-left
              ${
                selectedMethod === 'IMMEDIATE'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Retiro Inmediato</h3>
                  <Badge variant="success">Gratis</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  El cliente retira todos los productos en la tienda
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ Sin costo adicional
                  <br />
                  ✓ Disponible de inmediato
                </p>
              </div>
            </div>
          </button>

          {/* Complete Dispatch */}
          <button
            type="button"
            onClick={() => handleMethodSelect('DISPATCH')}
            disabled={disabled}
            className={`
              w-full p-4 rounded-lg border-2 transition-all text-left
              ${
                selectedMethod === 'DISPATCH'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Despacho Completo</h3>
                  <Badge variant="default">{formatCurrency(5000)}</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Todos los productos se envían por despacho
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ Entrega a domicilio
                  <br />
                  ✓ 2-3 días hábiles
                </p>
              </div>
            </div>
          </button>

          {/* Mixed */}
          <button
            type="button"
            onClick={() => handleMethodSelect('MIXED')}
            disabled={disabled}
            className={`
              w-full p-4 rounded-lg border-2 transition-all text-left
              ${
                selectedMethod === 'MIXED'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Split className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Mixto</h3>
                  <Badge variant="default">Variable</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Algunos productos se retiran y otros se despachan
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ Flexibilidad total
                  <br />
                  ✓ Costo según productos despachados
                </p>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Item Selection for Mixed Method */}
      {selectedMethod === 'MIXED' && (
        <Card>
          <CardHeader>
            <CardTitle>Selecciona Productos para Despacho</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Marca los productos que se enviarán por despacho. Los demás serán para retiro
              inmediato.
            </p>

            <div className="space-y-2">
              {items.map((item) => (
                <label
                  key={item.productId}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${
                      selectedItemsForDispatch.has(item.productId)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedItemsForDispatch.has(item.productId)}
                    onChange={() => toggleItemForDispatch(item.productId)}
                    disabled={disabled}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  {selectedItemsForDispatch.has(item.productId) && (
                    <Badge variant="default">
                      <Truck className="h-3 w-3 mr-1" />
                      Despacho
                    </Badge>
                  )}
                </label>
              ))}
            </div>

            {/* Mixed validation message */}
            {selectedMethod === 'MIXED' &&
              (selectedItemsForDispatch.size === 0 ||
                selectedItemsForDispatch.size === items.length) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2 mt-4">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800">
                    Debes seleccionar al menos un producto para despacho y dejar al menos uno para
                    retiro inmediato.
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {selectedMethod && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-900">
                <span className="font-medium">Método seleccionado:</span>
                <span className="font-semibold">
                  {selectedMethod === 'IMMEDIATE' && 'Retiro Inmediato'}
                  {selectedMethod === 'DISPATCH' && 'Despacho Completo'}
                  {selectedMethod === 'MIXED' && 'Mixto'}
                </span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span className="font-medium">Costo de envío:</span>
                <span className="font-semibold">{formatCurrency(calculateShippingCost())}</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={disabled || !isValidSelection}
              size="lg"
              className="w-full mt-6"
            >
              Continuar
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
