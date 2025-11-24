import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export const SaleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock data - En producción esto vendría de una API usando React Query
  const sale = {
    id: id || 'SALE-001',
    createdAt: new Date().toISOString(),
    status: 'CONFIRMED',
    channel: 'IN_STORE',
    customer: {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '+56 9 1234 5678',
      rut: '12.345.678-9',
    },
    shippingAddress: {
      street: 'Av. Principal 123',
      city: 'Santiago',
      state: 'Región Metropolitana',
      postalCode: '8320000',
      country: 'Chile',
    },
    items: [
      {
        id: '1',
        productName: 'Laptop HP ProBook 450',
        sku: 'HP-PB450-001',
        quantity: 1,
        unitPrice: 899990,
        subtotal: 899990,
        deliveryMethod: 'DISPATCH',
      },
      {
        id: '2',
        productName: 'Mouse Logitech MX Master 3',
        sku: 'LG-MX3-001',
        quantity: 2,
        unitPrice: 89990,
        subtotal: 179980,
        deliveryMethod: 'IMMEDIATE',
      },
    ],
    subtotal: 1079970,
    tax: 205294,
    shippingCost: 5000,
    total: 1290264,
    dispatchTracking: 'TRK-ABC123456',
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
      PENDING: { label: 'Pendiente', variant: 'warning' },
      CONFIRMED: { label: 'Confirmada', variant: 'success' },
      IN_TRANSIT: { label: 'En Tránsito', variant: 'default' },
      DELIVERED: { label: 'Entregada', variant: 'success' },
      CANCELLED: { label: 'Cancelada', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDeliveryMethodBadge = (method: string) => {
    const methodConfig: Record<string, { label: string; icon: any }> = {
      IMMEDIATE: { label: 'Retiro Inmediato', icon: Package },
      DISPATCH: { label: 'Despacho', icon: Truck },
    };

    const config = methodConfig[method] || { label: method, icon: Package };
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Icon className="h-4 w-4" />
        <span>{config.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Venta {sale.id}
            </h1>
            <p className="text-gray-500 mt-1">
              Creada el {formatDate(sale.createdAt)}
            </p>
          </div>
        </div>
        {getStatusBadge(sale.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sale.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <Package className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {item.productName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            SKU: {item.sku}
                          </p>
                          <div className="mt-2">
                            {getDeliveryMethodBadge(item.deliveryMethod)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(sale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (19%)</span>
                  <span>{formatCurrency(sale.tax)}</span>
                </div>
                {sale.shippingCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Costo de Envío</span>
                    <span>{formatCurrency(sale.shippingCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(sale.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {sale.dispatchTracking && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Información de Despacho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      En tránsito
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Número de seguimiento:{' '}
                    <span className="font-mono font-semibold">
                      {sale.dispatchTracking}
                    </span>
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Entrega estimada: 2-3 días hábiles
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium text-gray-900">{sale.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{sale.customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium text-gray-900">{sale.customer.phone}</p>
              </div>
              {sale.customer.rut && (
                <div>
                  <p className="text-sm text-gray-600">RUT</p>
                  <p className="font-medium text-gray-900">{sale.customer.rut}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {sale.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">{sale.shippingAddress.street}</p>
                <p className="text-gray-600 mt-1">
                  {sale.shippingAddress.city}, {sale.shippingAddress.state}
                </p>
                <p className="text-gray-600">
                  {sale.shippingAddress.postalCode}, {sale.shippingAddress.country}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sale Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Fecha de Creación</p>
                <p className="font-medium text-gray-900">
                  {formatDate(sale.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Canal de Venta</p>
                <p className="font-medium text-gray-900">
                  {sale.channel === 'IN_STORE' ? 'Tienda Física' : sale.channel}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <div className="mt-1">{getStatusBadge(sale.status)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button className="w-full" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Generar Factura
              </Button>
              <Button className="w-full" variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Entregada
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
