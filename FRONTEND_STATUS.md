# Estado del Frontend - Portal de Ventas

## ✅ COMPLETADO

### 1. Configuración Base
- ✅ Vite + React + TypeScript configurado
- ✅ TailwindCSS instalado y configurado
- ✅ React Router, React Query, React Hook Form instalados
- ✅ Path aliases configurados (@/)
- ✅ PostCSS y Autoprefixer configurados

### 2. Tipos TypeScript (`src/types/index.ts`)
- ✅ Enums: SaleChannel, SaleStatus, AvailabilityType, DeliveryMethod
- ✅ Interfaces: Product, ProductAvailability, CartItem, Customer, Address
- ✅ DTOs: CreateSaleDTO, SaleItem
- ✅ Tipos de respuesta: Sale, Reservation

### 3. Servicios API

#### `src/services/api.ts` - Cliente HTTP Base
- ✅ Axios configurado con interceptors
- ✅ Manejo automático de autenticación
- ✅ Manejo de errores 401

#### `src/services/salesApi.ts` - API de Ventas
- ✅ `createSale()` - Crear venta
- ✅ `getSale()` - Obtener venta por ID
- ✅ `listSales()` - Listar ventas

#### `src/services/inventoryApi.ts` - Mock de Inventarios
- ✅ `searchProducts()` - Búsqueda de productos
- ✅ `getProduct()` - Obtener producto
- ✅ `checkAvailability()` - Consultar disponibilidad
- ✅ `createReservation()` - Crear reserva (15 min de duración)
- ✅ `confirmReservation()` - Confirmar reserva
- ✅ `releaseReservation()` - Liberar reserva
- ✅ 5 productos mock de ejemplo

#### `src/services/dispatchApi.ts` - Mock de Despachos
- ✅ `checkAvailability()` - Verificar disponibilidad de despacho
- ✅ `createDispatch()` - Crear orden de despacho

### 4. Utilidades (`src/lib/utils.ts`)
- ✅ `cn()` - Combinar clases CSS
- ✅ `formatCurrency()` - Formato CLP
- ✅ `formatDate()` - Formato español
- ✅ `calculateTax()` - Calcular IVA (19%)
- ✅ `calculateTotal()` - Calcular total

### 5. Componentes UI Base
- ✅ `Button` - Múltiples variantes y tamaños
- ✅ `Card, CardHeader, CardTitle, CardContent` - Contenedores
- ✅ `Input` - Input con label y errores
- ✅ `Badge` - Etiquetas de estado

---

## 🚧 PENDIENTE DE IMPLEMENTAR

### 1. Componentes de Layout
**Archivos a crear:**
```
src/components/layout/
├── Layout.tsx          - Layout principal con navbar y sidebar
├── Navbar.tsx          - Barra de navegación superior
└── Sidebar.tsx         - Menú lateral (opcional)
```

### 2. Páginas Principales
**Archivos a crear:**
```
src/pages/
├── Dashboard.tsx       - Vista principal con estadísticas
├── NewSale.tsx         - Flujo completo de nueva venta
└── SaleDetails.tsx     - Detalle de venta existente
```

### 3. Componentes de Ventas
**Archivos a crear:**
```
src/components/sales/
├── ProductSearch.tsx      - Búsqueda y selección de productos
├── ProductCard.tsx        - Card individual de producto
├── Cart.tsx               - Carrito con reservas
├── CartItem.tsx           - Item del carrito
├── CustomerForm.tsx       - Formulario de datos del cliente
├── DeliverySelector.tsx   - Selector de método de entrega
└── SaleConfirmation.tsx   - Confirmación y resumen final
```

### 4. Hooks Personalizados
**Archivos a crear:**
```
src/hooks/
├── useCart.tsx         - Manejo del carrito y reservas
├── useReservations.tsx - Gestión de reservas automáticas
└── useSaleFlow.tsx     - Flujo completo de venta
```

### 5. Router y App Principal
**Archivos a actualizar:**
```
src/App.tsx         - Configurar React Router
src/main.tsx        - Configurar React Query Provider
```

### 6. Docker Configuration
**Archivos a crear:**
```
frontend/
├── Dockerfile         - Dockerfile para producción
└── .dockerignore      - Archivos a excluir
```

**Actualizar:**
```
docker-compose.yml     - Agregar servicio frontend
```

---

## 🎯 FLUJO COMPLETO DE VENTA (A IMPLEMENTAR)

### Paso 1: Búsqueda de Productos
1. Usuario busca productos por nombre/SKU
2. Sistema muestra resultados con disponibilidad:
   - 🟢 **STOCK**: Disponible inmediato (cantidad)
   - 🟡 **MANUFACTURING**: En fabricación (días estimados)
   - 🔴 **MADE_TO_ORDER**: Bajo pedido (días estimados)

### Paso 2: Agregar al Carrito
1. Usuario selecciona cantidad
2. Sistema consulta disponibilidad
3. **Si es STOCK**: Crea reserva automática (15 min)
4. Producto se agrega al carrito con indicador de reserva

### Paso 3: Carrito
- Muestra productos con:
  - Precio unitario
  - Cantidad
  - Tipo de disponibilidad
  - Tiempo restante de reserva (si aplica)
  - Subtotal por producto
- Botón para liberar reserva manualmente
- Cálculos:
  - Subtotal
  - IVA (19%)
  - Envío (si aplica)
  - **TOTAL**

### Paso 4: Datos del Cliente
Formulario con:
- Nombre completo *
- Email *
- Teléfono *
- RUT/DNI (opcional)
- Dirección de entrega (si requiere despacho)
- Dirección de facturación (opcional)

### Paso 5: Método de Entrega
Selector con opciones:
- **🚶 Retiro Inmediato**: Cliente retira todo en tienda
- **🚚 Despacho Completo**: Todo se envía por despacho
- **📦 Mixto**:
  - Seleccionar qué productos retira inmediato
  - Seleccionar qué productos van por despacho

### Paso 6: Confirmación
Resumen de la venta:
- Lista de productos
- Datos del cliente
- Método de entrega por producto
- Totales
- Botones:
  - ← Volver a editar
  - ✅ Confirmar Venta

### Paso 7: Procesamiento
1. Confirmar todas las reservas
2. Crear venta en API de Ventas
3. Si hay despacho: Crear orden de despacho
4. Mostrar confirmación con:
   - Número de venta
   - Tracking (si aplica)
   - Fecha estimada de entrega
   - Botón para imprimir/descargar

---

## 📊 COMPONENTES A CREAR - DETALLES

### ProductSearch Component
```typescript
interface ProductSearchProps {
  onSelectProduct: (product: Product) => void;
}

Features:
- Input de búsqueda con debounce
- Lista de resultados
- Indicador de carga
- Badge de disponibilidad por producto
- Click para seleccionar
```

### Cart Component
```typescript
interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

Features:
- Lista de items con cantidad editable
- Botón para eliminar item
- Countdown timer para reservas
- Cálculos de subtotal, tax, total
- Validación de stock al modificar cantidad
```

### CustomerForm Component
```typescript
interface CustomerFormProps {
  onSubmit: (data: Customer) => void;
  needsShipping: boolean;
}

Features:
- React Hook Form + Zod validation
- Campos condicionales (dirección si needsShipping)
- Validación en tiempo real
- Autocompletado de direcciones
```

### DeliverySelector Component
```typescript
interface DeliverySelectorProps {
  items: CartItem[];
  onSelectMethod: (method: DeliveryMethod) => void;
  onSelectItemsForDispatch: (itemIds: string[]) => void;
}

Features:
- Radio buttons para método
- Si es mixto: Checkboxes por producto
- Validación: Al menos un producto en cada método
- Preview de costo de envío
```

---

## 🔧 CONFIGURACIÓN ADICIONAL NECESARIA

### 1. Variables de Entorno
Crear `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_INVENTORY_API_URL=http://localhost:3001/api/v1
VITE_DISPATCH_API_URL=http://localhost:3002/api/v1
```

### 2. Dockerfile Frontend
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Actualizar docker-compose.yml
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  container_name: sales_frontend
  ports:
    - "5173:80"
  depends_on:
    - api
  networks:
    - sales-network
  environment:
    - VITE_API_URL=http://sales_api:3000/api/v1
```

---

## 🚀 COMANDOS PARA DESARROLLO

### Iniciar Frontend (Desarrollo)
```bash
cd frontend
npm run dev
```
Disponible en: http://localhost:5173

### Build para Producción
```bash
npm run build
npm run preview  # Preview del build
```

### Con Docker
```bash
# Desarrollo (con hot reload)
docker-compose up frontend

# Producción
docker-compose -f docker-compose.prod.yml up frontend
```

---

## 📝 PRÓXIMOS PASOS RECOMENDADOS

1. **Implementar Layout y Router** ⭐ PRIORITARIO
   - Crear Layout.tsx con navbar
   - Configurar React Router en App.tsx
   - Crear páginas básicas (Dashboard, NewSale)

2. **Implementar Flujo de Nueva Venta** ⭐ PRIORITARIO
   - ProductSearch component
   - Cart component con reservas
   - CustomerForm
   - DeliverySelector
   - Confirmación

3. **Integrar React Query**
   - Configurar QueryClient
   - Crear queries para productos
   - Crear mutations para ventas
   - Cache y refetch automático

4. **Mejorar UI/UX**
   - Loading states
   - Error handling
   - Toasts/Notifications
   - Validaciones mejoradas

5. **Testing**
   - Unit tests para servicios
   - Component tests
   - E2E tests para flujo completo

---

## 📚 RECURSOS Y DEPENDENCIAS INSTALADAS

### Dependencias Principales
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool y dev server
- **TailwindCSS** - Utility-first CSS
- **React Router Dom** - Routing
- **React Query** - Server state management
- **React Hook Form** - Formularios
- **Zod** - Validación de esquemas
- **Axios** - HTTP client
- **Lucide React** - Iconos

### Dev Dependencies
- **@types/node** - Types para Node.js
- **ESLint** - Linting
- **PostCSS & Autoprefixer** - CSS processing

---

## 💡 NOTAS TÉCNICAS

### Reservas Automáticas
- Duración: 15 minutos
- Se crean al agregar producto STOCK al carrito
- Timer visible en el carrito
- Auto-liberación al expirar
- Confirmación al completar venta

### Cálculos de Precios
- Subtotal = Suma de (precio × cantidad)
- IVA = Subtotal × 0.19
- Envío = Cálculo según método y ubicación
- Total = Subtotal + IVA + Envío

### Estados de Disponibilidad
1. **STOCK**: Producto físicamente disponible
   - Muestra cantidad exacta
   - Reserva inmediata
   - Entrega inmediata o despacho rápido

2. **MANUFACTURING**: En proceso de fabricación
   - Muestra días estimados
   - No requiere reserva
   - Solo disponible para despacho

3. **MADE_TO_ORDER**: Se fabrica al pedido
   - Muestra días de fabricación
   - No requiere reserva
   - Pago anticipado requerido

---

**Fecha**: 2025-11-24
**Versión**: 0.1.0 (Base implementada)
**Estado**: 🟡 En Desarrollo
