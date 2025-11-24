import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, DollarSign, Package, TrendingUp, Plus } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const Dashboard = () => {
  const navigate = useNavigate();

  // Datos mock para el dashboard
  const stats = [
    {
      title: 'Ventas Hoy',
      value: '12',
      change: '+3 vs ayer',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Vendido',
      value: formatCurrency(4567890),
      change: '+12% vs ayer',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pendientes',
      value: '5',
      change: 'En proceso',
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Ticket Promedio',
      value: formatCurrency(380657),
      change: '+5% vs ayer',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const recentSales = [
    {
      id: 'SALE-001',
      customer: 'Juan Pérez',
      amount: 899990,
      status: 'CONFIRMED',
      time: 'Hace 15 min',
    },
    {
      id: 'SALE-002',
      customer: 'María García',
      amount: 450000,
      status: 'IN_TRANSIT',
      time: 'Hace 1 hora',
    },
    {
      id: 'SALE-003',
      customer: 'Carlos López',
      amount: 189980,
      status: 'DELIVERED',
      time: 'Hace 2 horas',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: { label: 'Confirmada', variant: 'success' as const },
      IN_TRANSIT: { label: 'En Tránsito', variant: 'warning' as const },
      DELIVERED: { label: 'Entregada', variant: 'default' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'default' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Bienvenido al portal de ventas
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate('/nueva-venta')}
          className="flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Venta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/ventas/${sale.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-gray-900">{sale.id}</p>
                    {getStatusBadge(sale.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{sale.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(sale.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{sale.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Productos en Stock
            </h3>
            <p className="text-sm text-gray-600">
              Ver inventario disponible
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Reportes
            </h3>
            <p className="text-sm text-gray-600">
              Ver estadísticas detalladas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6 text-center">
            <ShoppingBag className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Historial
            </h3>
            <p className="text-sm text-gray-600">
              Ver todas las ventas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
