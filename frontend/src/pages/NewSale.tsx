import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  User,
  Truck,
  CheckCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

enum SaleStep {
  PRODUCTS = 1,
  CART = 2,
  CUSTOMER = 3,
  DELIVERY = 4,
  CONFIRMATION = 5,
}

export const NewSale = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SaleStep>(SaleStep.PRODUCTS);

  const steps = [
    { id: SaleStep.PRODUCTS, label: 'Productos', icon: Package },
    { id: SaleStep.CART, label: 'Carrito', icon: ShoppingCart },
    { id: SaleStep.CUSTOMER, label: 'Cliente', icon: User },
    { id: SaleStep.DELIVERY, label: 'Entrega', icon: Truck },
    { id: SaleStep.CONFIRMATION, label: 'Confirmación', icon: CheckCircle },
  ];

  const handleNext = () => {
    if (currentStep < SaleStep.CONFIRMATION) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > SaleStep.PRODUCTS) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case SaleStep.PRODUCTS:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Búsqueda de Productos
            </h3>
            <p className="text-gray-600">
              Busca y selecciona los productos para agregar al carrito.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                🚧 Componente ProductSearch en desarrollo...
              </p>
            </div>
          </div>
        );

      case SaleStep.CART:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Carrito de Compras
            </h3>
            <p className="text-gray-600">
              Revisa los productos seleccionados y las reservas activas.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                🚧 Componente Cart con sistema de reservas en desarrollo...
              </p>
            </div>
          </div>
        );

      case SaleStep.CUSTOMER:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Datos del Cliente
            </h3>
            <p className="text-gray-600">
              Ingresa la información del cliente para la venta.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                🚧 Componente CustomerForm en desarrollo...
              </p>
            </div>
          </div>
        );

      case SaleStep.DELIVERY:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Método de Entrega
            </h3>
            <p className="text-gray-600">
              Selecciona cómo se entregará la compra: retiro inmediato, despacho o mixto.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                🚧 Componente DeliverySelector en desarrollo...
              </p>
            </div>
          </div>
        );

      case SaleStep.CONFIRMATION:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirmación de Venta
            </h3>
            <p className="text-gray-600">
              Revisa el resumen completo antes de confirmar la venta.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                🚧 Componente SaleConfirmation en desarrollo...
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Venta</h1>
        <p className="text-gray-500 mt-1">
          Completa el proceso de venta paso a paso
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${isActive ? 'bg-blue-600 text-white' : ''}
                        ${isCompleted ? 'bg-green-600 text-white' : ''}
                        ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-600' : ''}
                      `}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p
                      className={`
                        text-xs mt-2 font-medium
                        ${isActive ? 'text-blue-600' : ''}
                        ${isCompleted ? 'text-green-600' : ''}
                        ${!isActive && !isCompleted ? 'text-gray-600' : ''}
                      `}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        h-1 flex-1 mx-2 mt-[-20px]
                        ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Paso {currentStep} de {steps.length}
            </CardTitle>
            <Badge variant="default">
              {steps.find(s => s.id === currentStep)?.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          {currentStep > SaleStep.PRODUCTS && (
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}
        </div>
        <div>
          {currentStep < SaleStep.CONFIRMATION ? (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => console.log('Confirmar venta')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Venta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
