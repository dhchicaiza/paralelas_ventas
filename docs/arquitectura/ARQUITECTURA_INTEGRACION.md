# Arquitectura de Integración - API de Ventas

## Versión: 1.0

---

## 1. Visión General

El sistema de ventas actúa como orquestador entre tres dominios principales:

```
┌─────────────────────────────────────────────────────────────┐
│                    CANALES DE VENTA                          │
├──────────────────┬──────────────────────────────────────────┤
│  Portal Web      │  Tienda Física (POS)                     │
└────────┬─────────┴──────────────┬───────────────────────────┘
         │                        │
         └────────────┬───────────┘
                      │
         ┌────────────▼────────────┐
         │   API DE VENTAS         │
         │  (Orquestador)          │
         └────────────┬────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼───┐   ┌───▼────┐  ┌───▼──────┐
    │  API   │   │  API   │  │  API     │
    │ Inven  │   │ Despa  │  │ Pagos    │
    │ tarios │   │ chos   │  │ (Externa)│
    └────────┘   └────────┘  └──────────┘
```

---

## 2. Patrones de Integración

### 2.1 Patrón: Request-Response Síncrono

**Uso**: Consultas de disponibilidad en tiempo real

```
Cliente → API Ventas → API Inventarios → API Ventas → Cliente
              [GET /availability]
```

**Ventajas**:
- Datos en tiempo real
- Flujo simple
- Respuesta inmediata

**Desventajas**:
- Acoplamiento temporal
- Fallo en cascada si API externa cae
- Latencia acumulativa

**Implementación**:
```javascript
// Pseudocódigo
async function checkAvailability(productId) {
  try {
    const response = await inventoryAPI.get(
      `/products/${productId}/availability`,
      { timeout: 5000 }
    );
    return response.data;
  } catch (error) {
    if (error.timeout) {
      // Circuit breaker
      return getCachedAvailability(productId);
    }
    throw error;
  }
}
```

**Cuándo Usar**:
- ✅ Validación de disponibilidad
- ✅ Consulta de precios
- ✅ Verificación de capacidad de despacho
- ❌ Creación de órdenes de fabricación
- ❌ Procesamiento de despachos

---

### 2.2 Patrón: Event-Driven Asíncrono

**Uso**: Notificaciones de cambios de estado

```
API Inventarios → Message Queue → API Ventas
     [ProductAvailable Event]
```

**Ventajas**:
- Desacoplamiento temporal
- Resiliencia ante fallos
- Escalabilidad

**Desventajas**:
- Complejidad adicional
- Eventual consistency
- Debugging más difícil

**Implementación**:
```javascript
// Publisher (Inventarios)
eventBus.publish('product.manufactured', {
  productId: 'PROD-123',
  quantity: 50,
  batchId: 'BATCH-001',
  timestamp: '2025-11-20T10:00:00Z'
});

// Subscriber (Ventas)
eventBus.subscribe('product.manufactured', async (event) => {
  const pendingSales = await findSalesWaitingForProduct(event.productId);

  for (const sale of pendingSales) {
    await processSaleReadyForDispatch(sale);
  }
});
```

**Cuándo Usar**:
- ✅ Notificación de productos fabricados
- ✅ Actualización de estados de despacho
- ✅ Cambios en estimaciones de fabricación
- ✅ Eventos de negocio importantes
- ❌ Consultas que requieren respuesta inmediata

---

### 2.3 Patrón: Saga Orquestada

**Uso**: Transacciones distribuidas (crear venta completa)

```
API Ventas (Orquestador)
    │
    ├─→ 1. Reservar Inventario
    │   └─← OK
    │
    ├─→ 2. Crear Orden de Despacho
    │   └─← OK
    │
    ├─→ 3. Procesar Pago
    │   └─← OK
    │
    └─→ 4. Confirmar Venta
        └─← COMPLETADO
```

**Con Compensación en Caso de Fallo**:
```
API Ventas (Orquestador)
    │
    ├─→ 1. Reservar Inventario
    │   └─← OK
    │
    ├─→ 2. Crear Orden de Despacho
    │   └─← FALLO ❌
    │
    └─→ Compensar: Liberar Inventario
        └─← Rollback completado
```

**Implementación**:
```javascript
class SaleSaga {
  async execute(saleData) {
    const saga = new Saga();

    try {
      // Paso 1: Reservar inventario
      const reservation = await saga.step(
        () => inventoryAPI.createReservation(saleData.items),
        (res) => inventoryAPI.releaseReservation(res.id) // Compensación
      );

      // Paso 2: Crear despacho
      const dispatch = await saga.step(
        () => dispatchAPI.createDispatch({
          saleId: saleData.id,
          items: saleData.items
        }),
        (disp) => dispatchAPI.cancelDispatch(disp.id) // Compensación
      );

      // Paso 3: Procesar pago
      const payment = await saga.step(
        () => paymentAPI.processPayment(saleData.payment),
        (pay) => paymentAPI.refund(pay.id) // Compensación
      );

      // Paso 4: Confirmar venta
      await this.confirmSale(saleData.id);

      return { success: true, saleId: saleData.id };

    } catch (error) {
      // Ejecutar compensaciones en orden inverso
      await saga.compensate();
      throw error;
    }
  }
}
```

**Cuándo Usar**:
- ✅ Proceso completo de venta
- ✅ Operaciones que requieren múltiples APIs
- ✅ Necesidad de rollback atómico
- ❌ Operaciones simples de un solo paso

---

### 2.4 Patrón: Circuit Breaker

**Uso**: Protección contra fallos en cascada

```
┌─────────────────────────────────────┐
│     Circuit Breaker States          │
├─────────────────────────────────────┤
│                                      │
│   CLOSED → OPEN → HALF_OPEN → CLOSED│
│     ↑                           │   │
│     └───────────────────────────┘   │
└─────────────────────────────────────┘

CLOSED: Operando normalmente
  ↓ (5 fallos consecutivos)
OPEN: Bloqueando requests, devolviendo fallback
  ↓ (después de 30 segundos)
HALF_OPEN: Probando con 1 request
  ↓ (si falla)    ↓ (si funciona)
OPEN             CLOSED
```

**Implementación**:
```javascript
class CircuitBreaker {
  constructor(service, options = {}) {
    this.service = service;
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 30000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = Date.now();
  }

  async call(method, ...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        // Devolver fallback o error
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await this.service[method](...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// Uso
const inventoryService = new CircuitBreaker(inventoryAPI, {
  failureThreshold: 5,
  timeout: 30000
});

try {
  const availability = await inventoryService.call(
    'getAvailability',
    productId
  );
} catch (error) {
  // Usar cache o mostrar mensaje al usuario
  const cachedData = await cache.get(`availability:${productId}`);
  return cachedData;
}
```

---

### 2.5 Patrón: Cache-Aside

**Uso**: Reducir latencia y carga en APIs externas

```
┌─────────┐         ┌───────┐        ┌─────────────┐
│ Cliente │────────→│ Cache │        │ API Externa │
└─────────┘         └───┬───┘        └──────┬──────┘
                        │                   │
    1. GET              ├──── MISS ────────→│
                        │                   │
    2. Fetch from API   │←─── DATA ─────────┤
                        │                   │
    3. Store in cache   ├─── SET ───────┐   │
                        │               │   │
    4. Return data      │←──────────────┘   │
                        │                   │
    5. Subsequent GET   ├──── HIT ──────┐   │
                        │               │   │
    6. Return from cache│←──────────────┘   │
```

**Implementación**:
```javascript
async function getProductAvailability(productId) {
  const cacheKey = `availability:${productId}`;

  // 1. Intentar obtener de cache
  const cached = await cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. No está en cache, consultar API
  const availability = await inventoryAPI.getAvailability(productId);

  // 3. Guardar en cache (TTL: 5 minutos)
  await cache.set(
    cacheKey,
    JSON.stringify(availability),
    { ttl: 300 }
  );

  // 4. Retornar datos
  return availability;
}
```

**Estrategias de Invalidación**:
```javascript
// Invalidación basada en eventos
eventBus.subscribe('inventory.updated', async (event) => {
  await cache.delete(`availability:${event.productId}`);
});

// Invalidación basada en TTL
// Cache expira automáticamente después de 5 minutos

// Invalidación proactiva
async function updateInventory(productId, newStock) {
  await inventoryAPI.updateStock(productId, newStock);
  await cache.delete(`availability:${productId}`);
}
```

---

## 3. Contratos de API

### 3.1 API de Inventarios (Externa)

#### Endpoint: Consultar Disponibilidad

**Request**:
```http
GET /api/v1/inventory/products/{productId}/availability
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
```

**Response 200 OK**:
```json
{
  "product_id": "PROD-123",
  "available_stock": 45,
  "reserved_stock": 10,
  "in_manufacturing": 30,
  "manufacturing_batches": [
    {
      "batch_id": "BATCH-001",
      "quantity": 30,
      "status": "IN_PROGRESS",
      "estimated_completion": "2025-12-01T00:00:00Z",
      "confidence_level": "HIGH"
    }
  ],
  "can_manufacture": true,
  "minimum_order_quantity": 1,
  "manufacturing_lead_time_days": 15,
  "last_updated": "2025-11-20T10:30:00Z"
}
```

#### Endpoint: Crear Reserva

**Request**:
```http
POST /api/v1/inventory/reservations
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
  Content-Type: application/json

Body:
{
  "external_reference_id": "SALE-12345",
  "external_reference_type": "SALE",
  "items": [
    {
      "product_id": "PROD-123",
      "quantity": 5,
      "warehouse_id": "WH-001"
    }
  ],
  "expiration_time": "2025-11-20T18:00:00Z",
  "notes": "Reserva para venta web"
}
```

**Response 201 Created**:
```json
{
  "reservation_id": "RES-789",
  "status": "ACTIVE",
  "items": [
    {
      "product_id": "PROD-123",
      "quantity": 5,
      "warehouse_id": "WH-001",
      "reserved_at": "2025-11-20T10:35:00Z"
    }
  ],
  "expires_at": "2025-11-20T18:00:00Z",
  "created_at": "2025-11-20T10:35:00Z"
}
```

**Response 409 Conflict** (Stock insuficiente):
```json
{
  "error": "INSUFFICIENT_STOCK",
  "message": "No hay stock suficiente para completar la reserva",
  "details": {
    "product_id": "PROD-123",
    "requested": 5,
    "available": 2
  }
}
```

#### Endpoint: Liberar Reserva

**Request**:
```http
PUT /api/v1/inventory/reservations/{reservationId}/release
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
```

**Response 200 OK**:
```json
{
  "reservation_id": "RES-789",
  "status": "RELEASED",
  "released_at": "2025-11-20T11:00:00Z"
}
```

#### Endpoint: Confirmar Reserva (Descontar Stock)

**Request**:
```http
PUT /api/v1/inventory/reservations/{reservationId}/confirm
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
```

**Response 200 OK**:
```json
{
  "reservation_id": "RES-789",
  "status": "CONFIRMED",
  "stock_updated": true,
  "confirmed_at": "2025-11-20T11:00:00Z"
}
```

#### Endpoint: Solicitar Fabricación

**Request**:
```http
POST /api/v1/inventory/manufacturing-orders
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
  Content-Type: application/json

Body:
{
  "external_reference_id": "SALE-12345",
  "product_id": "PROD-456",
  "quantity": 20,
  "priority": "NORMAL",
  "required_by": "2025-12-15T00:00:00Z",
  "notes": "Pedido cliente VIP"
}
```

**Response 201 Created**:
```json
{
  "manufacturing_order_id": "MFG-001",
  "product_id": "PROD-456",
  "quantity": 20,
  "status": "PENDING_START",
  "estimated_start_date": "2025-11-22T00:00:00Z",
  "estimated_completion_date": "2025-12-07T00:00:00Z",
  "created_at": "2025-11-20T10:40:00Z"
}
```

#### Webhook: Notificación de Estado de Fabricación

**POST a URL configurada por nosotros**:
```json
{
  "event_type": "manufacturing.status_changed",
  "event_id": "EVT-001",
  "timestamp": "2025-11-22T08:00:00Z",
  "data": {
    "manufacturing_order_id": "MFG-001",
    "external_reference_id": "SALE-12345",
    "previous_status": "PENDING_START",
    "current_status": "IN_PROGRESS",
    "estimated_completion_date": "2025-12-07T00:00:00Z",
    "progress_percentage": 10
  }
}
```

---

### 3.2 API de Despachos (Externa)

#### Endpoint: Consultar Disponibilidad de Despacho

**Request**:
```http
GET /api/v1/dispatches/availability?date=2025-11-21&postal_code=12345
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
```

**Response 200 OK**:
```json
{
  "date": "2025-11-21",
  "postal_code": "12345",
  "available": true,
  "delivery_windows": [
    {
      "window_id": "WIN-AM",
      "start_time": "09:00",
      "end_time": "12:00",
      "available_slots": 15,
      "cost": 5.00
    },
    {
      "window_id": "WIN-PM",
      "start_time": "14:00",
      "end_time": "18:00",
      "available_slots": 8,
      "cost": 5.00
    }
  ],
  "express_available": true,
  "express_cost": 15.00
}
```

#### Endpoint: Crear Orden de Despacho

**Request**:
```http
POST /api/v1/dispatches
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
  Content-Type: application/json

Body:
{
  "external_reference_id": "SALE-12345",
  "type": "SCHEDULED",
  "scheduled_date": "2025-11-21",
  "delivery_window_id": "WIN-AM",
  "items": [
    {
      "product_id": "PROD-123",
      "product_name": "Producto X",
      "quantity": 2,
      "weight_kg": 1.5,
      "dimensions_cm": {
        "length": 30,
        "width": 20,
        "height": 10
      }
    }
  ],
  "delivery_address": {
    "recipient_name": "Juan Pérez",
    "street": "Av. Principal 123",
    "city": "Quito",
    "postal_code": "12345",
    "phone": "+593999999999"
  },
  "special_instructions": "Llamar antes de llegar"
}
```

**Response 201 Created**:
```json
{
  "dispatch_id": "DISP-456",
  "tracking_number": "TRK-ABC123XYZ",
  "status": "PENDING_PICKUP",
  "scheduled_delivery_date": "2025-11-21",
  "delivery_window": {
    "start_time": "09:00",
    "end_time": "12:00"
  },
  "estimated_delivery": "2025-11-21T11:00:00Z",
  "created_at": "2025-11-20T10:45:00Z"
}
```

#### Endpoint: Consultar Estado de Despacho

**Request**:
```http
GET /api/v1/dispatches/{dispatchId}
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
```

**Response 200 OK**:
```json
{
  "dispatch_id": "DISP-456",
  "tracking_number": "TRK-ABC123XYZ",
  "external_reference_id": "SALE-12345",
  "status": "IN_TRANSIT",
  "status_history": [
    {
      "status": "PENDING_PICKUP",
      "timestamp": "2025-11-20T10:45:00Z"
    },
    {
      "status": "PICKED_UP",
      "timestamp": "2025-11-20T14:00:00Z"
    },
    {
      "status": "IN_TRANSIT",
      "timestamp": "2025-11-21T08:00:00Z",
      "location": "Centro de Distribución Norte"
    }
  ],
  "estimated_delivery": "2025-11-21T11:00:00Z",
  "driver": {
    "name": "Carlos López",
    "phone": "+593988888888"
  }
}
```

#### Endpoint: Cancelar Despacho

**Request**:
```http
PUT /api/v1/dispatches/{dispatchId}/cancel
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
  Content-Type: application/json

Body:
{
  "reason": "CUSTOMER_REQUEST",
  "notes": "Cliente canceló la compra"
}
```

**Response 200 OK**:
```json
{
  "dispatch_id": "DISP-456",
  "status": "CANCELLED",
  "cancelled_at": "2025-11-20T12:00:00Z",
  "cancellation_reason": "CUSTOMER_REQUEST"
}
```

**Response 409 Conflict** (No se puede cancelar):
```json
{
  "error": "CANNOT_CANCEL",
  "message": "No se puede cancelar un despacho que ya está en tránsito",
  "current_status": "IN_TRANSIT"
}
```

#### Webhook: Actualización de Estado de Despacho

**POST a URL configurada por nosotros**:
```json
{
  "event_type": "dispatch.status_changed",
  "event_id": "EVT-002",
  "timestamp": "2025-11-21T11:30:00Z",
  "data": {
    "dispatch_id": "DISP-456",
    "tracking_number": "TRK-ABC123XYZ",
    "external_reference_id": "SALE-12345",
    "previous_status": "IN_TRANSIT",
    "current_status": "DELIVERED",
    "delivered_at": "2025-11-21T11:30:00Z",
    "recipient_name": "Juan Pérez",
    "signature_url": "https://..."
  }
}
```

---

### 3.3 API de Ventas (Nuestra API)

#### Endpoint: Crear Venta

**Request**:
```http
POST /api/v1/sales
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
  Content-Type: application/json

Body:
{
  "channel": "WEB",
  "customer": {
    "id": "CUST-123",
    "email": "cliente@example.com",
    "phone": "+593999999999"
  },
  "items": [
    {
      "product_id": "PROD-123",
      "quantity": 2,
      "unit_price": 50.00
    }
  ],
  "delivery": {
    "type": "HOME_DELIVERY",
    "address": {
      "street": "Av. Principal 123",
      "city": "Quito",
      "postal_code": "12345"
    },
    "preferred_date": "2025-11-21",
    "window_preference": "AM"
  },
  "payment": {
    "method": "CREDIT_CARD",
    "amount": 100.00
  }
}
```

**Response 201 Created**:
```json
{
  "sale_id": "SALE-12345",
  "status": "PENDING_PAYMENT",
  "reservation_id": "RES-789",
  "reservation_expires_at": "2025-11-20T18:00:00Z",
  "total_amount": 100.00,
  "estimated_delivery_date": "2025-11-21",
  "created_at": "2025-11-20T10:50:00Z",
  "payment_link": "https://payment.example.com/..."
}
```

#### Endpoint: Confirmar Pago

**Request**:
```http
PUT /api/v1/sales/{saleId}/confirm-payment
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
  Content-Type: application/json

Body:
{
  "payment_id": "PAY-123",
  "payment_status": "COMPLETED",
  "transaction_id": "TXN-XYZ"
}
```

**Response 200 OK**:
```json
{
  "sale_id": "SALE-12345",
  "status": "CONFIRMED",
  "dispatch_id": "DISP-456",
  "tracking_number": "TRK-ABC123XYZ",
  "confirmed_at": "2025-11-20T11:00:00Z"
}
```

#### Endpoint: Consultar Estado de Venta

**Request**:
```http
GET /api/v1/sales/{saleId}
Headers:
  Authorization: Bearer {token}
  X-Request-ID: {uuid}
```

**Response 200 OK**:
```json
{
  "sale_id": "SALE-12345",
  "status": "IN_TRANSIT",
  "channel": "WEB",
  "items": [...],
  "total_amount": 100.00,
  "reservation": {
    "reservation_id": "RES-789",
    "status": "CONFIRMED"
  },
  "dispatch": {
    "dispatch_id": "DISP-456",
    "tracking_number": "TRK-ABC123XYZ",
    "status": "IN_TRANSIT",
    "estimated_delivery": "2025-11-21T11:00:00Z"
  },
  "timeline": [
    {
      "event": "SALE_CREATED",
      "timestamp": "2025-11-20T10:50:00Z"
    },
    {
      "event": "PAYMENT_CONFIRMED",
      "timestamp": "2025-11-20T11:00:00Z"
    },
    {
      "event": "DISPATCH_CREATED",
      "timestamp": "2025-11-20T11:01:00Z"
    },
    {
      "event": "IN_TRANSIT",
      "timestamp": "2025-11-21T08:00:00Z"
    }
  ],
  "created_at": "2025-11-20T10:50:00Z",
  "updated_at": "2025-11-21T08:00:00Z"
}
```

---

## 4. Manejo de Errores y Resiliencia

### 4.1 Estrategias de Retry

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Backoff exponencial: 2^attempt * 100ms
      const delay = Math.pow(2, attempt) * 100;
      await sleep(delay);

      logger.warn(`Retry attempt ${attempt} after ${delay}ms`, {
        error: error.message
      });
    }
  }
}

// Uso
const availability = await retryWithBackoff(() =>
  inventoryAPI.getAvailability(productId)
);
```

### 4.2 Timeout Configuration

```javascript
const API_TIMEOUTS = {
  inventory: {
    availability: 5000,    // 5 segundos
    reservation: 10000,    // 10 segundos
    manufacturing: 15000   // 15 segundos
  },
  dispatch: {
    availability: 3000,    // 3 segundos
    createOrder: 10000,    // 10 segundos
    status: 5000          // 5 segundos
  }
};
```

### 4.3 Fallback Strategies

```javascript
async function getProductAvailabilityWithFallback(productId) {
  try {
    // Intento 1: API en tiempo real
    return await inventoryAPI.getAvailability(productId);
  } catch (error) {
    logger.error('Error getting availability from API', { error });

    try {
      // Intento 2: Cache (puede estar desactualizado pero funcional)
      const cached = await cache.get(`availability:${productId}`);
      if (cached) {
        logger.info('Using cached availability data');
        return JSON.parse(cached);
      }
    } catch (cacheError) {
      logger.error('Cache also failed', { cacheError });
    }

    // Intento 3: Base de datos local (última sincronización)
    try {
      const dbData = await db.query(
        'SELECT * FROM availability_snapshot WHERE product_id = ?',
        [productId]
      );
      if (dbData) {
        logger.info('Using database snapshot');
        return dbData;
      }
    } catch (dbError) {
      logger.error('Database also failed', { dbError });
    }

    // Último recurso: Mostrar "No disponible"
    return {
      product_id: productId,
      available_stock: 0,
      status: 'UNAVAILABLE',
      error: 'Unable to fetch availability'
    };
  }
}
```

### 4.4 Idempotency

```javascript
// Generación de clave de idempotencia
function generateIdempotencyKey(operation, data) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify({
    operation,
    data,
    timestamp: Date.now()
  }));
  return hash.digest('hex');
}

// Uso en requests
async function createReservation(items) {
  const idempotencyKey = generateIdempotencyKey('create_reservation', items);

  // Verificar si ya se procesó
  const existing = await db.query(
    'SELECT * FROM idempotency_keys WHERE key = ?',
    [idempotencyKey]
  );

  if (existing) {
    logger.info('Request already processed', { idempotencyKey });
    return existing.result;
  }

  // Procesar request
  const result = await inventoryAPI.createReservation(items, {
    headers: { 'Idempotency-Key': idempotencyKey }
  });

  // Guardar resultado
  await db.query(
    'INSERT INTO idempotency_keys (key, result, created_at) VALUES (?, ?, ?)',
    [idempotencyKey, JSON.stringify(result), new Date()]
  );

  return result;
}
```

---

## 5. Monitoreo y Observabilidad

### 5.1 Métricas Clave

```javascript
// Definición de métricas
const metrics = {
  // Latencia de APIs externas
  apiLatency: new Histogram({
    name: 'external_api_latency_ms',
    help: 'Latency of external API calls',
    labelNames: ['api', 'endpoint', 'status']
  }),

  // Tasa de errores
  apiErrors: new Counter({
    name: 'external_api_errors_total',
    help: 'Total number of external API errors',
    labelNames: ['api', 'endpoint', 'error_type']
  }),

  // Circuit breaker state
  circuitBreakerState: new Gauge({
    name: 'circuit_breaker_state',
    help: 'State of circuit breaker (0=closed, 1=open, 2=half-open)',
    labelNames: ['service']
  }),

  // Ventas por estado
  salesByStatus: new Gauge({
    name: 'sales_by_status',
    help: 'Number of sales by status',
    labelNames: ['status']
  })
};

// Instrumentación
async function callInventoryAPI(endpoint, data) {
  const timer = metrics.apiLatency.startTimer();

  try {
    const result = await inventoryAPI.call(endpoint, data);
    timer({ api: 'inventory', endpoint, status: 'success' });
    return result;
  } catch (error) {
    timer({ api: 'inventory', endpoint, status: 'error' });
    metrics.apiErrors.inc({
      api: 'inventory',
      endpoint,
      error_type: error.name
    });
    throw error;
  }
}
```

### 5.2 Logging Estructurado

```javascript
// Configuración de logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'sales-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Uso con contexto
logger.info('Creating sale', {
  sale_id: 'SALE-12345',
  customer_id: 'CUST-123',
  total_amount: 100.00,
  items_count: 2,
  correlation_id: req.headers['x-correlation-id']
});

logger.error('Failed to create reservation', {
  sale_id: 'SALE-12345',
  error: error.message,
  stack: error.stack,
  inventory_response: response,
  correlation_id: req.headers['x-correlation-id']
});
```

### 5.3 Distributed Tracing

```javascript
// OpenTelemetry
const tracer = opentelemetry.trace.getTracer('sales-api');

async function createSale(saleData) {
  const span = tracer.startSpan('create_sale');

  try {
    // Crear reserva
    const reservationSpan = tracer.startSpan('create_reservation', {
      parent: span
    });
    const reservation = await inventoryAPI.createReservation(saleData.items);
    reservationSpan.end();

    // Crear despacho
    const dispatchSpan = tracer.startSpan('create_dispatch', {
      parent: span
    });
    const dispatch = await dispatchAPI.createDispatch(saleData);
    dispatchSpan.end();

    span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
    return { reservation, dispatch };
  } catch (error) {
    span.setStatus({
      code: opentelemetry.SpanStatusCode.ERROR,
      message: error.message
    });
    throw error;
  } finally {
    span.end();
  }
}
```

---

## 6. Seguridad

### 6.1 Autenticación entre Servicios

```javascript
// JWT para comunicación entre servicios
async function getServiceToken() {
  const payload = {
    iss: 'sales-api',
    aud: 'inventory-api',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300 // 5 minutos
  };

  return jwt.sign(payload, process.env.SERVICE_SECRET);
}

// Uso en requests
async function callInventoryAPI(endpoint, data) {
  const token = await getServiceToken();

  return axios.post(`${INVENTORY_API_URL}${endpoint}`, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}
```

### 6.2 Validación de Webhooks

```javascript
// Verificar firma de webhook
function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Endpoint de webhook
app.post('/webhooks/inventory', (req, res) => {
  const signature = req.headers['x-signature'];

  if (!verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Procesar evento
  handleInventoryEvent(req.body);
  res.status(200).json({ received: true });
});
```

---

## 7. Plan de Migración y Rollback

### 7.1 Feature Flags

```javascript
const featureFlags = {
  USE_NEW_INVENTORY_API: process.env.USE_NEW_INVENTORY_API === 'true',
  ENABLE_ASYNC_DISPATCH: process.env.ENABLE_ASYNC_DISPATCH === 'true',
  USE_SAGA_PATTERN: process.env.USE_SAGA_PATTERN === 'true'
};

async function createSale(saleData) {
  if (featureFlags.USE_SAGA_PATTERN) {
    return await createSaleWithSaga(saleData);
  } else {
    return await createSaleLegacy(saleData);
  }
}
```

### 7.2 Estrategia de Rollback

```
Fase 1: Deploy con feature flags desactivados
   ↓
Fase 2: Activar para 10% de tráfico
   ↓
Monitorear métricas (errores, latencia)
   ↓
¿Todo OK? → SÍ → Aumentar a 50%
   ↓         ↓ NO → Desactivar feature flag
Fase 3: 100% de tráfico
```

---

## 8. Conclusiones

### Decisiones de Arquitectura

1. **Patrón Saga Orquestada**: Para transacciones distribuidas
2. **Circuit Breaker**: Protección contra fallos en cascada
3. **Event-Driven**: Para notificaciones asíncronas
4. **Cache-Aside**: Para optimización de performance
5. **Retry con Backoff**: Para resiliencia

### Próximos Pasos

1. Definir SLAs con equipos de Inventarios y Despachos
2. Implementar POC de integración
3. Establecer ambiente de testing end-to-end
4. Definir estrategia de rollout gradual
