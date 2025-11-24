import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { User, Mail, Phone, CreditCard, MapPin, ArrowRight } from 'lucide-react';
import type { Customer } from '../../types';

const customerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono inválido'),
  rut: z.string().optional(),
  shippingAddress: z.object({
    street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
    city: z.string().min(2, 'La ciudad es requerida'),
    state: z.string().min(2, 'La región es requerida'),
    postalCode: z.string().min(4, 'El código postal es requerido'),
    country: z.string().default('Chile'),
  }).optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: Customer) => void;
  needsShipping: boolean;
  initialData?: Partial<Customer>;
  disabled?: boolean;
}

export const CustomerForm = ({
  onSubmit,
  needsShipping,
  initialData,
  disabled = false,
}: CustomerFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = (data: CustomerFormData) => {
    const customer: Customer = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      rut: data.rut,
      shippingAddress: needsShipping ? data.shippingAddress : undefined,
    };
    onSubmit(customer);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  {...register('name')}
                  placeholder="Ej: Juan Pérez"
                  className="pl-10"
                  disabled={disabled}
                  error={errors.name?.message}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="pl-10"
                  disabled={disabled}
                  error={errors.email?.message}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  {...register('phone')}
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  className="pl-10"
                  disabled={disabled}
                  error={errors.phone?.message}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* RUT (Optional) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RUT / DNI (Opcional)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  {...register('rut')}
                  placeholder="12.345.678-9"
                  className="pl-10"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address - Only if needed */}
      {needsShipping && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección de Envío
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Street */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calle y Número *
                </label>
                <Input
                  {...register('shippingAddress.street')}
                  placeholder="Ej: Av. Principal 123, Depto 45"
                  disabled={disabled}
                  error={errors.shippingAddress?.street?.message}
                />
                {errors.shippingAddress?.street && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.shippingAddress.street.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad / Comuna *
                </label>
                <Input
                  {...register('shippingAddress.city')}
                  placeholder="Ej: Santiago"
                  disabled={disabled}
                  error={errors.shippingAddress?.city?.message}
                />
                {errors.shippingAddress?.city && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.shippingAddress.city.message}
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Región *
                </label>
                <Input
                  {...register('shippingAddress.state')}
                  placeholder="Ej: Región Metropolitana"
                  disabled={disabled}
                  error={errors.shippingAddress?.state?.message}
                />
                {errors.shippingAddress?.state && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.shippingAddress.state.message}
                  </p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal *
                </label>
                <Input
                  {...register('shippingAddress.postalCode')}
                  placeholder="Ej: 8320000"
                  disabled={disabled}
                  error={errors.shippingAddress?.postalCode?.message}
                />
                {errors.shippingAddress?.postalCode && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.shippingAddress.postalCode.message}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País *
                </label>
                <Input
                  {...register('shippingAddress.country')}
                  defaultValue="Chile"
                  disabled={disabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={disabled}>
          Continuar
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </form>
  );
};
