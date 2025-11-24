# Requerimientos de APIs Externas - Portal de Ventas

## Resumen Ejecutivo

Este documento especifica los contratos de API requeridos para integrar el Portal de Ventas con los módulos de **Inventarios** y **Despachos**. Ambos equipos deben implementar endpoints REST que cumplan con estas especificaciones.

**Fecha:** 2025-11-24
**Versión:** 1.0
**Contacto:** Equipo de Ventas

---

## 📦 API DE INVENTARIOS

### Información General

**Base URL:** `http://inventarios-api:3001/api/v1`
**Protocolo:** HTTP/HTTPS
**Formato:** JSON
**Autenticación:** Bearer Token (JWT)
**Timeout:** 30 segundos
**Rate Limit:** 100 req/min por IP

---

### 1. Búsqueda de Productos

**Descripción:** Permite buscar productos por nombre o SKU para agregarlos al carrito de ventas.

**Endpoint:** `GET /products/search`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Query Parameters:**
```typescript
{
  query: string;     // Término de búsqueda (min 2 caracteres)
  limit?: number;    // Límite de resultados (default: 50, max: 100)
  offset?: number;   // Paginación (default: 0)
}
```

**Ejemplo de Request:**
```http
GET /products/search?query=laptop&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "prod-uuid-123",
      "sku": "HP-PB450-001",
      "name": "Laptop HP ProBook 450",
      "description": "Laptop corporativa 15.6\" Intel i5",
      "price": 899990,
      "category": "Computadores",
      "availabilityType": "STOCK",
      "stockQuantity": 15,
      "estimatedDays": null,
      "images": ["https://cdn.example.com/products/hp-pb450.jpg"],
      "active": true
    },
    {
      "id": "prod-uuid-456",
      "sku": "DELL-XPS13-002",
      "name": "Dell XPS 13",
      "description": "Ultrabook premium 13.3\"",
      "price": 1299990,
      "category": "Computadores",
      "availabilityType": "MANUFACTURING",
      "stockQuantity": 0,
      "estimatedDays": 7,
      "images": ["https://cdn.example.com/products/dell-xps13.jpg"],
      "active": true
    }
  ],
  "total": 2,
  "limit": 10,
  "offset": 0
}
```

**Campos Requeridos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador único del producto |
| `sku` | string | Código SKU del producto |
| `name` | string | Nombre del producto |
| `price` | number | Precio en CLP (sin decimales) |
| `availabilityType` | enum | Tipo de disponibilidad: `STOCK`, `MANUFACTURING`, `MADE_TO_ORDER` |
| `stockQuantity` | number | Cantidad disponible (requerido si `availabilityType = STOCK`) |
| `estimatedDays` | number\|null | Días estimados de fabricación (requerido si no es STOCK) |
| `active` | boolean | Si el producto está activo para venta |

**Errores:**
- `400`: Query inválido (menos de 2 caracteres)
- `401`: Token inválido o expirado
- `500`: Error interno del servidor

---

### 2. Obtener Producto por ID

**Descripción:** Obtiene detalles completos de un producto específico.

**Endpoint:** `GET /products/{productId}`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
```typescript
{
  productId: string; // UUID del producto
}
```

**Ejemplo de Request:**
```http
GET /products/prod-uuid-123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**
```json
{
  "id": "prod-uuid-123",
  "sku": "HP-PB450-001",
  "name": "Laptop HP ProBook 450",
  "description": "Laptop corporativa 15.6\" Intel i5, 8GB RAM, 256GB SSD",
  "price": 899990,
  "category": "Computadores",
  "brand": "HP",
  "availabilityType": "STOCK",
  "stockQuantity": 15,
  "estimatedDays": null,
  "images": [
    "https://cdn.example.com/products/hp-pb450-1.jpg",
    "https://cdn.example.com/products/hp-pb450-2.jpg"
  ],
  "specifications": {
    "processor": "Intel Core i5-1135G7",
    "ram": "8GB DDR4",
    "storage": "256GB SSD",
    "screen": "15.6\" FHD"
  },
  "weight": 1.8,
  "dimensions": "36 x 24 x 2 cm",
  "active": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-11-20T15:45:00Z"
}
```

**Errores:**
- `404`: Producto no encontrado
- `401`: Token inválido
- `500`: Error interno

---

### 3. Consultar Disponibilidad

**Descripción:** Verifica disponibilidad actual de un producto antes de reservar.

**Endpoint:** `GET /products/{productId}/availability`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
```typescript
{
  productId: string; // UUID del producto
}
```

**Ejemplo de Request:**
```http
GET /products/prod-uuid-123/availability
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**
```json
{
  "productId": "prod-uuid-123",
  "availabilityType": "STOCK",
  "quantity": 15,
  "estimatedDays": null,
  "available": true,
  "lastUpdated": "2024-11-24T10:30:00Z"
}
```

**Tipos de Disponibilidad:**

| Tipo | Descripción | Campos Requeridos |
|------|-------------|-------------------|
| `STOCK` | Producto físicamente disponible | `quantity` (número de unidades) |
| `MANUFACTURING` | En proceso de fabricación | `estimatedDays` (días hasta disponible) |
| `MADE_TO_ORDER` | Se fabrica al pedido | `estimatedDays` (días de fabricación) |

**Errores:**
- `404`: Producto no encontrado
- `401`: Token inválido
- `500`: Error interno

---

### 4. Crear Reserva

**Descripción:** Crea una reserva temporal de producto (15 minutos) durante el proceso de venta.

**⚠️ IMPORTANTE:** Solo aplica para productos con `availabilityType = STOCK`

**Endpoint:** `POST /reservations`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "prod-uuid-123",
  "quantity": 2,
  "salesChannel": "IN_STORE",
  "metadata": {
    "sellerId": "user-uuid-789",
    "sessionId": "sess-abc123"
  }
}
```

**Campos del Request:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `productId` | string | ✅ | UUID del producto |
| `quantity` | number | ✅ | Cantidad a reservar (min: 1) |
| `salesChannel` | enum | ✅ | `IN_STORE`, `ONLINE`, `PHONE` |
| `metadata` | object | ❌ | Datos adicionales de contexto |

**Response 201 Created:**
```json
{
  "id": "res-uuid-456",
  "productId": "prod-uuid-123",
  "quantity": 2,
  "status": "ACTIVE",
  "expiresAt": "2024-11-24T10:45:00Z",
  "createdAt": "2024-11-24T10:30:00Z"
}
```

**Reglas de Negocio:**
1. La reserva dura **15 minutos** desde `createdAt`
2. Si expira sin confirmar, las unidades se liberan automáticamente
3. Solo se puede reservar stock disponible (`quantity <= stockQuantity`)
4. Un mismo producto puede tener múltiples reservas activas (sistema maneja la concurrencia)
5. Si no hay stock suficiente, retornar error 409

**Errores:**
- `400`: Datos inválidos (quantity <= 0, productId inválido)
- `404`: Producto no encontrado
- `409`: Stock insuficiente
- `422`: Producto no es tipo STOCK (no se puede reservar)
- `401`: Token inválido
- `500`: Error interno

---

### 5. Confirmar Reserva

**Descripción:** Confirma una reserva, convirtiendo la reserva temporal en compromiso definitivo. El stock se descuenta permanentemente.

**Endpoint:** `POST /reservations/{reservationId}/confirm`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
```typescript
{
  reservationId: string; // UUID de la reserva
}
```

**Request Body:**
```json
{
  "saleId": "sale-uuid-999",
  "confirmedBy": "user-uuid-789"
}
```

**Ejemplo de Request:**
```http
POST /reservations/res-uuid-456/confirm
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "saleId": "sale-uuid-999",
  "confirmedBy": "user-uuid-789"
}
```

**Response 200 OK:**
```json
{
  "id": "res-uuid-456",
  "productId": "prod-uuid-123",
  "quantity": 2,
  "status": "CONFIRMED",
  "saleId": "sale-uuid-999",
  "confirmedAt": "2024-11-24T10:35:00Z",
  "confirmedBy": "user-uuid-789"
}
```

**Reglas de Negocio:**
1. Solo se pueden confirmar reservas con `status = ACTIVE`
2. No se pueden confirmar reservas expiradas
3. Después de confirmar, el stock se descuenta permanentemente
4. La confirmación es irreversible

**Errores:**
- `404`: Reserva no encontrada
- `409`: Reserva ya confirmada o expirada
- `422`: Datos de confirmación inválidos
- `401`: Token inválido
- `500`: Error interno

---

### 6. Liberar Reserva

**Descripción:** Libera una reserva activa, devolviendo las unidades al stock disponible. Se usa cuando el usuario cancela la venta o remueve el producto del carrito.

**Endpoint:** `DELETE /reservations/{reservationId}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Path Parameters:**
```typescript
{
  reservationId: string; // UUID de la reserva
}
```

**Ejemplo de Request:**
```http
DELETE /reservations/res-uuid-456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**
```json
{
  "id": "res-uuid-456",
  "status": "RELEASED",
  "releasedAt": "2024-11-24T10:40:00Z",
  "message": "Reservation released successfully, stock returned"
}
```

**Reglas de Negocio:**
1. Solo se pueden liberar reservas con `status = ACTIVE`
2. Las unidades reservadas se devuelven inmediatamente al stock
3. No se pueden liberar reservas ya confirmadas
4. Si la reserva ya expiró, retornar 200 igual (operación idempotente)

**Errores:**
- `404`: Reserva no encontrada
- `409`: Reserva ya confirmada (no se puede liberar)
- `401`: Token inválido
- `500`: Error interno

---

### Flujo de Integración - Inventarios

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend Ventas
    participant API as API Ventas
    participant INV as API Inventarios

    Note over U,INV: 1. BÚSQUEDA Y SELECCIÓN
    U->>FE: Busca "laptop"
    FE->>INV: GET /products/search?query=laptop
    INV-->>FE: Lista de productos
    FE-->>U: Muestra resultados

    Note over U,INV: 2. AGREGAR AL CARRITO
    U->>FE: Agrega producto (qty: 2)
    FE->>INV: GET /products/{id}/availability
    INV-->>FE: { available: true, quantity: 15 }

    alt Es tipo STOCK
        FE->>INV: POST /reservations
        INV-->>FE: { id: res-123, expiresAt: +15min }
        FE-->>U: Producto agregado (Reserva activa: 15:00 min)
    else Es MANUFACTURING/MADE_TO_ORDER
        FE-->>U: Producto agregado (Sin reserva)
    end

    Note over U,INV: 3. MODIFICAR CANTIDAD
    U->>FE: Cambia cantidad a 3
    FE->>INV: DELETE /reservations/res-123
    INV-->>FE: { status: RELEASED }
    FE->>INV: POST /reservations (qty: 3)
    INV-->>FE: { id: res-124, expiresAt: +15min }

    Note over U,INV: 4. CONFIRMAR VENTA
    U->>FE: Confirma venta
    FE->>API: POST /sales
    API->>INV: POST /reservations/res-124/confirm
    INV-->>API: { status: CONFIRMED }
    API-->>FE: { saleId: sale-999 }
    FE-->>U: Venta exitosa

    Note over U,INV: 5. CANCELAR VENTA (Alternativa)
    U->>FE: Cancela venta
    FE->>INV: DELETE /reservations/res-124
    INV-->>FE: { status: RELEASED }
    FE-->>U: Carrito vaciado
```

---

### Consideraciones Técnicas - Inventarios

#### 1. Manejo de Concurrencia
- Usar **locks optimistas** o **pessimistas** para evitar overselling
- Implementar **idempotencia** en reservas (mismo productId + sessionId)
- Usar **transacciones ACID** para operaciones de stock

#### 2. Caducidad de Reservas
- Timer automático de 15 minutos
- Job cada 1 minuto que libera reservas expiradas
- Webhook opcional para notificar expiraciones

#### 3. Monitoreo
- Log de todas las operaciones de reserva
- Métricas: reservas creadas, confirmadas, expiradas, liberadas
- Alertas: stock bajo, alta tasa de expiraciones

#### 4. Performance
- Cache de disponibilidad (TTL: 30 segundos)
- Índices en `productId`, `sku`, `status`
- Rate limiting: 100 req/min

---

## 🚚 API DE DESPACHOS

### Información General

**Base URL:** `http://despachos-api:3002/api/v1`
**Protocolo:** HTTP/HTTPS
**Formato:** JSON
**Autenticación:** Bearer Token (JWT)
**Timeout:** 30 segundos
**Rate Limit:** 50 req/min por IP

---

### 1. Verificar Disponibilidad de Despacho

**Descripción:** Valida si se puede realizar despacho a una dirección específica.

**Endpoint:** `POST /dispatch/availability`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "address": {
    "street": "Av. Principal 123",
    "city": "Santiago",
    "state": "Región Metropolitana",
    "postalCode": "8320000",
    "country": "Chile"
  },
  "items": [
    {
      "productId": "prod-uuid-123",
      "quantity": 2,
      "weight": 1.8,
      "dimensions": {
        "length": 36,
        "width": 24,
        "height": 2
      }
    }
  ]
}
```

**Campos del Request:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `address.street` | string | ✅ | Calle y número |
| `address.city` | string | ✅ | Ciudad o comuna |
| `address.state` | string | ✅ | Región |
| `address.postalCode` | string | ✅ | Código postal |
| `address.country` | string | ✅ | País (default: Chile) |
| `items` | array | ✅ | Lista de productos a despachar |
| `items[].productId` | string | ✅ | UUID del producto |
| `items[].quantity` | number | ✅ | Cantidad de unidades |
| `items[].weight` | number | ❌ | Peso en kg |
| `items[].dimensions` | object | ❌ | Dimensiones en cm |

**Response 200 OK:**
```json
{
  "available": true,
  "estimatedDays": 2,
  "cost": 5000,
  "carrier": "Chilexpress",
  "service": "Express",
  "restrictions": [],
  "estimatedDeliveryDate": "2024-11-26T18:00:00Z"
}
```

**Response 200 OK (No Disponible):**
```json
{
  "available": false,
  "estimatedDays": null,
  "cost": null,
  "carrier": null,
  "service": null,
  "restrictions": [
    "Zona no cubierta por courier",
    "Código postal inválido"
  ],
  "estimatedDeliveryDate": null
}
```

**Reglas de Negocio:**
1. Validar que el código postal exista en la base de datos de cobertura
2. Calcular costo según peso, dimensiones y distancia
3. Validar restricciones (peso máximo, dimensiones, zonas excluidas)
4. Estimar días hábiles de entrega

**Errores:**
- `400`: Datos de dirección inválidos
- `401`: Token inválido
- `500`: Error interno

---

### 2. Crear Orden de Despacho

**Descripción:** Crea una orden de despacho asociada a una venta confirmada.

**Endpoint:** `POST /dispatch`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "saleId": "sale-uuid-999",
  "address": {
    "street": "Av. Principal 123",
    "city": "Santiago",
    "state": "Región Metropolitana",
    "postalCode": "8320000",
    "country": "Chile"
  },
  "recipient": {
    "name": "Juan Pérez",
    "phone": "+56912345678",
    "email": "juan.perez@example.com",
    "rut": "12.345.678-9"
  },
  "items": [
    {
      "productId": "prod-uuid-123",
      "productName": "Laptop HP ProBook 450",
      "sku": "HP-PB450-001",
      "quantity": 2,
      "weight": 1.8,
      "dimensions": {
        "length": 36,
        "width": 24,
        "height": 2
      }
    }
  ],
  "deliveryPreferences": {
    "priority": "STANDARD",
    "contactBeforeDelivery": true,
    "leaveAtDoor": false,
    "deliveryInstructions": "Tocar timbre depto 45"
  }
}
```

**Campos del Request:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `saleId` | string | ✅ | UUID de la venta en sistema de Ventas |
| `address` | object | ✅ | Dirección de entrega completa |
| `recipient` | object | ✅ | Datos del destinatario |
| `recipient.name` | string | ✅ | Nombre completo |
| `recipient.phone` | string | ✅ | Teléfono con código de país |
| `recipient.email` | string | ✅ | Email de contacto |
| `recipient.rut` | string | ❌ | RUT/DNI del destinatario |
| `items` | array | ✅ | Productos a despachar |
| `deliveryPreferences` | object | ❌ | Preferencias de entrega |
| `deliveryPreferences.priority` | enum | ❌ | `STANDARD`, `EXPRESS`, `ECONOMY` |

**Response 201 Created:**
```json
{
  "id": "dispatch-uuid-111",
  "saleId": "sale-uuid-999",
  "trackingNumber": "TRK-ABC123456",
  "status": "PENDING",
  "carrier": "Chilexpress",
  "service": "Express",
  "estimatedDeliveryDate": "2024-11-26T18:00:00Z",
  "cost": 5000,
  "createdAt": "2024-11-24T10:35:00Z",
  "trackingUrl": "https://tracking.chilexpress.cl/TRK-ABC123456"
}
```

**Estados del Despacho:**

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Orden creada, esperando procesamiento |
| `PREPARING` | Preparando paquete en bodega |
| `IN_TRANSIT` | En camino al destinatario |
| `OUT_FOR_DELIVERY` | En reparto el día de hoy |
| `DELIVERED` | Entregado exitosamente |
| `FAILED` | Intento fallido de entrega |
| `RETURNED` | Devuelto a origen |
| `CANCELLED` | Cancelado |

**Reglas de Negocio:**
1. Solo se pueden crear despachos para ventas confirmadas
2. Se debe validar disponibilidad antes de crear
3. Se genera `trackingNumber` único automáticamente
4. Se calcula costo según tarifa actual del carrier
5. Se envía email al destinatario con tracking

**Errores:**
- `400`: Datos inválidos o incompletos
- `404`: Venta no encontrada
- `409`: Ya existe despacho para esta venta
- `422`: Dirección no tiene cobertura
- `401`: Token inválido
- `500`: Error interno

---

### 3. Consultar Estado de Despacho

**Descripción:** Obtiene el estado actual de una orden de despacho.

**Endpoint:** `GET /dispatch/{dispatchId}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Path Parameters:**
```typescript
{
  dispatchId: string; // UUID del despacho
}
```

**Ejemplo de Request:**
```http
GET /dispatch/dispatch-uuid-111
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**
```json
{
  "id": "dispatch-uuid-111",
  "saleId": "sale-uuid-999",
  "trackingNumber": "TRK-ABC123456",
  "status": "IN_TRANSIT",
  "carrier": "Chilexpress",
  "service": "Express",
  "estimatedDeliveryDate": "2024-11-26T18:00:00Z",
  "cost": 5000,
  "address": {
    "street": "Av. Principal 123",
    "city": "Santiago",
    "state": "Región Metropolitana",
    "postalCode": "8320000",
    "country": "Chile"
  },
  "recipient": {
    "name": "Juan Pérez",
    "phone": "+56912345678",
    "email": "juan.perez@example.com"
  },
  "timeline": [
    {
      "status": "PENDING",
      "timestamp": "2024-11-24T10:35:00Z",
      "location": "Centro de Distribución Santiago",
      "description": "Orden creada"
    },
    {
      "status": "PREPARING",
      "timestamp": "2024-11-24T14:20:00Z",
      "location": "Centro de Distribución Santiago",
      "description": "Paquete preparado"
    },
    {
      "status": "IN_TRANSIT",
      "timestamp": "2024-11-25T08:00:00Z",
      "location": "En ruta",
      "description": "En camino al destino"
    }
  ],
  "createdAt": "2024-11-24T10:35:00Z",
  "updatedAt": "2024-11-25T08:00:00Z",
  "trackingUrl": "https://tracking.chilexpress.cl/TRK-ABC123456"
}
```

**Errores:**
- `404`: Despacho no encontrado
- `401`: Token inválido
- `500`: Error interno

---

### 4. Buscar Despachos por Venta

**Descripción:** Obtiene todos los despachos asociados a una venta.

**Endpoint:** `GET /dispatch/by-sale/{saleId}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Path Parameters:**
```typescript
{
  saleId: string; // UUID de la venta
}
```

**Ejemplo de Request:**
```http
GET /dispatch/by-sale/sale-uuid-999
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**
```json
{
  "saleId": "sale-uuid-999",
  "dispatches": [
    {
      "id": "dispatch-uuid-111",
      "trackingNumber": "TRK-ABC123456",
      "status": "IN_TRANSIT",
      "carrier": "Chilexpress",
      "estimatedDeliveryDate": "2024-11-26T18:00:00Z",
      "createdAt": "2024-11-24T10:35:00Z"
    }
  ],
  "total": 1
}
```

**Errores:**
- `404`: Venta no encontrada
- `401`: Token inválido
- `500`: Error interno

---

### 5. Cancelar Despacho

**Descripción:** Cancela una orden de despacho si aún no está en tránsito.

**Endpoint:** `POST /dispatch/{dispatchId}/cancel`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
```typescript
{
  dispatchId: string; // UUID del despacho
}
```

**Request Body:**
```json
{
  "reason": "Cliente solicitó cancelación",
  "cancelledBy": "user-uuid-789"
}
```

**Response 200 OK:**
```json
{
  "id": "dispatch-uuid-111",
  "status": "CANCELLED",
  "cancelledAt": "2024-11-24T11:00:00Z",
  "cancelledBy": "user-uuid-789",
  "reason": "Cliente solicitó cancelación"
}
```

**Reglas de Negocio:**
1. Solo se pueden cancelar despachos en estado `PENDING` o `PREPARING`
2. No se pueden cancelar si ya están en `IN_TRANSIT`, `OUT_FOR_DELIVERY` o `DELIVERED`
3. Se debe notificar al cliente de la cancelación
4. Se puede generar devolución de cargo si aplica

**Errores:**
- `404`: Despacho no encontrado
- `409`: No se puede cancelar en este estado
- `401`: Token inválido
- `500`: Error interno

---

### Flujo de Integración - Despachos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend Ventas
    participant API as API Ventas
    participant DSP as API Despachos

    Note over U,DSP: 1. SELECCIÓN DE MÉTODO DE ENTREGA
    U->>FE: Ingresa dirección
    FE->>DSP: POST /dispatch/availability
    DSP-->>FE: { available: true, cost: 5000, estimatedDays: 2 }
    FE-->>U: Muestra opciones (Despacho: $5.000, 2-3 días)

    Note over U,DSP: 2. CONFIRMAR VENTA CON DESPACHO
    U->>FE: Confirma venta (método: DISPATCH)
    FE->>API: POST /sales
    API->>API: Crea venta en BD
    API->>DSP: POST /dispatch
    DSP-->>API: { id: dispatch-111, trackingNumber: TRK-ABC123 }
    API->>API: Asocia tracking a venta
    API-->>FE: { saleId: sale-999, dispatchId: dispatch-111 }
    FE-->>U: Venta exitosa + Tracking: TRK-ABC123

    Note over U,DSP: 3. CONSULTAR ESTADO
    U->>FE: Ver detalle de venta
    FE->>API: GET /sales/sale-999
    API->>DSP: GET /dispatch/dispatch-111
    DSP-->>API: { status: IN_TRANSIT, timeline: [...] }
    API-->>FE: Venta + Estado de despacho
    FE-->>U: Muestra tracking timeline

    Note over U,DSP: 4. VENTA MIXTA (Parte despacho, parte retiro)
    U->>FE: Confirma venta (método: MIXED)
    FE->>API: POST /sales (items con deliveryMethod)
    API->>API: Filtra items para despacho
    API->>DSP: POST /dispatch (solo items con deliveryMethod=DISPATCH)
    DSP-->>API: { id: dispatch-222, trackingNumber: TRK-XYZ789 }
    API-->>FE: Venta con tracking parcial
    FE-->>U: Venta exitosa (2 items despacho, 1 item retiro)
```

---

### Consideraciones Técnicas - Despachos

#### 1. Integración con Couriers
- Integrar APIs de carriers (Chilexpress, Correos, Blue Express)
- Sincronizar estados automáticamente cada hora
- Fallback si un carrier no está disponible

#### 2. Notificaciones
- Email al crear despacho con tracking
- SMS cuando está "Out for Delivery"
- Webhook a API Ventas cuando cambia estado

#### 3. Cálculo de Costos
- Tabla de tarifas por zona geográfica
- Recargos por peso/volumen
- Descuentos por volumen de envíos

#### 4. Tracking en Tiempo Real
- Webhook desde carriers para updates
- Cache de estados (TTL: 5 minutos)
- Polling cada hora si no hay webhook

---

## 🔗 Integración Global

### Secuencia Completa de Venta

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant API as API Ventas
    participant INV as API Inventarios
    participant DSP as API Despachos

    Note over U,DSP: FASE 1: BÚSQUEDA Y CARRITO
    U->>FE: Busca productos
    FE->>INV: GET /products/search
    INV-->>FE: Lista productos
    U->>FE: Agrega 2x Laptop
    FE->>INV: POST /reservations (qty: 2)
    INV-->>FE: { reservationId: res-123, expiresAt: +15min }

    Note over U,DSP: FASE 2: DATOS CLIENTE Y ENTREGA
    U->>FE: Ingresa datos cliente
    U->>FE: Selecciona método: DISPATCH
    FE->>DSP: POST /dispatch/availability
    DSP-->>FE: { available: true, cost: 5000 }

    Note over U,DSP: FASE 3: CONFIRMACIÓN
    U->>FE: Confirma venta
    FE->>API: POST /sales
    API->>INV: POST /reservations/res-123/confirm
    INV-->>API: { status: CONFIRMED }
    API->>DSP: POST /dispatch
    DSP-->>API: { dispatchId: dsp-111, tracking: TRK-ABC }
    API->>API: Guarda venta en BD
    API-->>FE: { saleId: sale-999, tracking: TRK-ABC }
    FE-->>U: ✅ Venta exitosa

    Note over U,DSP: FASE 4: SEGUIMIENTO
    U->>FE: Ver detalle venta
    FE->>API: GET /sales/sale-999
    API->>DSP: GET /dispatch/dsp-111
    DSP-->>API: { status: IN_TRANSIT }
    API-->>FE: Venta + Estado despacho
    FE-->>U: Muestra timeline
```

---

## 📋 Resumen de Responsabilidades

### Equipo de Inventarios

**Endpoints a Implementar:**
1. ✅ `GET /products/search` - Búsqueda de productos
2. ✅ `GET /products/{id}` - Detalle de producto
3. ✅ `GET /products/{id}/availability` - Consultar disponibilidad
4. ✅ `POST /reservations` - Crear reserva (15 min)
5. ✅ `POST /reservations/{id}/confirm` - Confirmar reserva
6. ✅ `DELETE /reservations/{id}` - Liberar reserva

**Funcionalidades Requeridas:**
- Sistema de reservas temporales (15 minutos)
- Auto-liberación de reservas expiradas
- Manejo de concurrencia (locks)
- 3 tipos de disponibilidad: STOCK, MANUFACTURING, MADE_TO_ORDER
- Descuento de stock al confirmar reserva

**Datos a Exponer:**
- Productos con precios, SKU, disponibilidad
- Stock en tiempo real
- Días estimados de fabricación
- Imágenes y especificaciones

---

### Equipo de Despachos

**Endpoints a Implementar:**
1. ✅ `POST /dispatch/availability` - Verificar cobertura y costo
2. ✅ `POST /dispatch` - Crear orden de despacho
3. ✅ `GET /dispatch/{id}` - Estado de despacho
4. ✅ `GET /dispatch/by-sale/{saleId}` - Despachos por venta
5. ✅ `POST /dispatch/{id}/cancel` - Cancelar despacho

**Funcionalidades Requeridas:**
- Validación de cobertura geográfica
- Cálculo de costos de envío
- Generación de tracking numbers
- Integración con couriers (Chilexpress, etc.)
- Timeline de eventos del despacho
- Notificaciones por email/SMS

**Datos a Exponer:**
- Estado del despacho en tiempo real
- Tracking number y URL
- Fecha estimada de entrega
- Timeline de eventos
- Costos de envío

---

## 🔒 Autenticación y Seguridad

### JWT Token

**Header:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXV1aWQiLCJyb2xlIjoic2FsZXMiLCJpYXQiOjE3MDA4MjAwMDB9.signature
```

**Payload Esperado:**
```json
{
  "sub": "user-uuid-789",
  "role": "sales",
  "permissions": ["read:products", "write:reservations", "write:dispatch"],
  "iat": 1700820000,
  "exp": 1700823600
}
```

### Permisos Requeridos

**API Inventarios:**
- `read:products` - Buscar y consultar productos
- `write:reservations` - Crear, confirmar y liberar reservas

**API Despachos:**
- `read:dispatch` - Consultar estados de despacho
- `write:dispatch` - Crear y cancelar órdenes

---

## 📊 SLA y Tiempos de Respuesta

| Endpoint | Tiempo Máximo | Percentil 95 |
|----------|---------------|--------------|
| GET /products/search | 2 segundos | 500ms |
| GET /products/{id} | 1 segundo | 200ms |
| POST /reservations | 3 segundos | 1s |
| POST /reservations/{id}/confirm | 5 segundos | 2s |
| POST /dispatch/availability | 2 segundos | 800ms |
| POST /dispatch | 10 segundos | 5s |
| GET /dispatch/{id} | 1 segundo | 300ms |

---

## 🧪 Ambientes y URLs

### Desarrollo
```
Inventarios: http://localhost:3001/api/v1
Despachos:   http://localhost:3002/api/v1
```

### Testing/QA
```
Inventarios: https://inventarios-qa.company.com/api/v1
Despachos:   https://despachos-qa.company.com/api/v1
```

### Producción
```
Inventarios: https://inventarios.company.com/api/v1
Despachos:   https://despachos.company.com/api/v1
```

---

## 📞 Contacto y Soporte

**Equipo de Ventas:**
- Email: ventas-dev@company.com
- Slack: #equipo-ventas
- PO: María González
- Tech Lead: Carlos Rodríguez

**Reuniones de Integración:**
- Semanal: Miércoles 10:00 AM
- Planificación: Cada 2 semanas

**Documentación:**
- Swagger: http://localhost:3000/api/docs
- Postman Collection: `/docs/postman/`
- Diagramas: `/docs/diagrams/`

---

## ✅ Checklist de Entrega

### Equipo Inventarios
- [ ] Endpoints implementados y testeados
- [ ] Sistema de reservas funcionando
- [ ] Auto-liberación de reservas expiradas
- [ ] Documentación Swagger actualizada
- [ ] Tests de integración pasando
- [ ] Deploy en ambiente QA
- [ ] Postman Collection compartida

### Equipo Despachos
- [ ] Endpoints implementados y testeados
- [ ] Validación de cobertura funcionando
- [ ] Integración con al menos 1 courier
- [ ] Sistema de tracking operativo
- [ ] Notificaciones por email
- [ ] Documentación Swagger actualizada
- [ ] Tests de integración pasando
- [ ] Deploy en ambiente QA
- [ ] Postman Collection compartida

---

**Versión:** 1.0
**Última Actualización:** 2025-11-24
**Próxima Revisión:** 2025-12-01
