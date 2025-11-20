# Recomendaciones de Implementación - API de Ventas

## Versión: 1.0
## Fecha: 2025-11-20

---

## 1. Stack Tecnológico Recomendado

### 1.1 Backend

**Opción A: Node.js + TypeScript** ⭐ RECOMENDADO
```
✅ Ventajas:
- Ecosistema maduro para APIs REST
- TypeScript provee type-safety
- Excelente para I/O asíncrono (integraciones)
- Gran cantidad de librerías
- Facilita integración con message queues

Framework: NestJS
- Arquitectura modular
- Decoradores para rutas y validación
- Soporte built-in para TypeORM, Prisma
- Fácil testing

Librerías Clave:
- axios o node-fetch: Llamadas HTTP
- opossum: Circuit breaker
- bull: Cola de trabajos
- winston: Logging
- joi o class-validator: Validación
- jest: Testing
```

**Opción B: Python + FastAPI**
```
✅ Ventajas:
- Sintaxis clara y legible
- FastAPI es rápido y moderno
- Excelente para prototipado rápido
- Type hints nativos

⚠️ Consideraciones:
- Menor rendimiento en I/O comparado con Node.js
- Ecosistema de async más reciente

Librerías Clave:
- httpx: Cliente HTTP asíncrono
- celery: Cola de tareas
- pydantic: Validación de datos
- pytest: Testing
```

**Opción C: Java + Spring Boot**
```
✅ Ventajas:
- Muy robusto para aplicaciones empresariales
- Excelente soporte de transacciones
- Gran ecosistema

⚠️ Consideraciones:
- Mayor complejidad inicial
- Más verboso
- Requiere más recursos

Framework: Spring Boot
- Spring Cloud para microservicios
- Resilience4j para circuit breaker
- Spring Data JPA
```

**RECOMENDACIÓN FINAL**: Node.js + TypeScript + NestJS
- Balance perfecto entre productividad y rendimiento
- Ideal para integraciones con APIs externas
- Comunidad activa y librerías maduras

---

### 1.2 Base de Datos

**Base de Datos Principal: PostgreSQL** ⭐ RECOMENDADO
```
✅ Ventajas:
- ACID compliance (crucial para transacciones de ventas)
- JSON support (flexibilidad para metadata)
- Excelente rendimiento
- Extensiones útiles (pg_cron, uuid-ossp)
- Soporte de replicación

Esquema:
- Sales (ventas)
- SaleItems (items de venta)
- Reservations (snapshot local de reservas)
- Dispatches (snapshot local de despachos)
- Events (event sourcing)
- IdempotencyKeys (prevenir duplicados)
```

**Cache: Redis** ⭐ RECOMENDADO
```
✅ Usos:
- Cache de disponibilidad de productos (TTL: 5 minutos)
- Session storage
- Rate limiting
- Pub/Sub para eventos internos
- Locks distribuidos

Estructura de Keys:
- availability:{product_id} → JSON de disponibilidad
- reservation:{reservation_id} → Datos de reserva
- session:{user_id} → Sesión de usuario
```

**Message Queue: RabbitMQ o Redis Streams**
```
RabbitMQ:
✅ Routing complejo
✅ Garantías de entrega
✅ Dead letter queues
⚠️ Mayor complejidad

Redis Streams:
✅ Más simple
✅ Integración con Redis existente
⚠️ Menos features avanzados

RECOMENDACIÓN: RabbitMQ para producción, Redis para MVP
```

---

### 1.3 Infraestructura

**Contenedorización: Docker + Docker Compose** ⭐ ESENCIAL
```dockerfile
# Estructura de servicios
services:
  api:
    image: sales-api:latest
    depends_on: [db, redis, rabbitmq]

  db:
    image: postgres:15-alpine

  redis:
    image: redis:7-alpine

  rabbitmq:
    image: rabbitmq:3-management-alpine

  worker:
    image: sales-api:latest
    command: npm run worker
```

**Orquestación: Kubernetes** (Para producción)
```
✅ Auto-scaling
✅ Self-healing
✅ Service discovery
✅ Secrets management

Alternativa más simple: Docker Swarm
```

**CI/CD: GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    - run: npm test
    - run: npm run lint

  build:
    - docker build -t sales-api

  deploy:
    - deploy to staging
    - smoke tests
    - deploy to production (manual approval)
```

---

## 2. Diseño de Base de Datos

### 2.1 Esquema Principal

```sql
-- Tabla: sales
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number VARCHAR(50) UNIQUE NOT NULL,
  channel VARCHAR(20) NOT NULL, -- 'WEB', 'STORE'
  status VARCHAR(50) NOT NULL,
  customer_id VARCHAR(100) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),

  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,

  -- Referencias externas
  inventory_reservation_id VARCHAR(100),
  dispatch_id VARCHAR(100),
  manufacturing_order_id VARCHAR(100),
  payment_id VARCHAR(100),

  -- Direcciones (JSON para flexibilidad)
  delivery_address JSONB,
  billing_address JSONB,

  -- Fechas
  estimated_delivery_date TIMESTAMP,
  scheduled_delivery_date TIMESTAMP,

  -- Metadata
  metadata JSONB,
  notes TEXT,

  -- Auditoría
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(100),
  updated_by VARCHAR(100),

  CONSTRAINT chk_channel CHECK (channel IN ('WEB', 'STORE')),
  CONSTRAINT chk_status CHECK (status IN (
    'PENDING_PAYMENT',
    'CONFIRMED',
    'IN_PREPARATION',
    'IN_TRANSIT',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'PENDING_MANUFACTURING',
    'MANUFACTURING_IN_PROGRESS',
    'READY_FOR_DISPATCH'
  ))
);

CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);

-- Tabla: sale_items
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,

  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),

  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,

  -- Disponibilidad
  availability_type VARCHAR(50), -- 'STOCK', 'MANUFACTURING', 'MADE_TO_ORDER'
  batch_id VARCHAR(100), -- Si viene de un batch específico

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_quantity CHECK (quantity > 0),
  CONSTRAINT chk_availability CHECK (availability_type IN (
    'STOCK', 'MANUFACTURING', 'MADE_TO_ORDER'
  ))
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- Tabla: sale_events (Event Sourcing)
CREATE TABLE sale_events (
  id BIGSERIAL PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES sales(id),

  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,

  -- Contexto
  triggered_by VARCHAR(100), -- 'SYSTEM', 'USER:{id}', 'API:{name}'
  correlation_id VARCHAR(100),

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CHECK (event_type IN (
    'SALE_CREATED',
    'PAYMENT_RECEIVED',
    'PAYMENT_FAILED',
    'INVENTORY_RESERVED',
    'INVENTORY_RESERVATION_FAILED',
    'DISPATCH_CREATED',
    'DISPATCH_FAILED',
    'STATUS_CHANGED',
    'MANUFACTURING_STARTED',
    'MANUFACTURING_COMPLETED',
    'SALE_CANCELLED',
    'REFUND_PROCESSED'
  ))
);

CREATE INDEX idx_sale_events_sale_id ON sale_events(sale_id);
CREATE INDEX idx_sale_events_created_at ON sale_events(created_at DESC);

-- Tabla: reservations_snapshot
CREATE TABLE reservations_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id),

  external_reservation_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,

  items JSONB NOT NULL,

  reserved_at TIMESTAMP,
  expires_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  released_at TIMESTAMP,

  last_synced_at TIMESTAMP,

  CHECK (status IN ('ACTIVE', 'CONFIRMED', 'RELEASED', 'EXPIRED'))
);

CREATE INDEX idx_reservations_sale_id ON reservations_snapshot(sale_id);
CREATE INDEX idx_reservations_external_id ON reservations_snapshot(external_reservation_id);

-- Tabla: dispatches_snapshot
CREATE TABLE dispatches_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id),

  external_dispatch_id VARCHAR(100) NOT NULL,
  tracking_number VARCHAR(100),
  status VARCHAR(50) NOT NULL,

  scheduled_date TIMESTAMP,
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,

  delivery_address JSONB,
  status_history JSONB,

  last_synced_at TIMESTAMP,

  CHECK (status IN (
    'PENDING_PICKUP',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'FAILED_DELIVERY',
    'CANCELLED'
  ))
);

CREATE INDEX idx_dispatches_sale_id ON dispatches_snapshot(sale_id);
CREATE INDEX idx_dispatches_external_id ON dispatches_snapshot(external_dispatch_id);

-- Tabla: idempotency_keys
CREATE TABLE idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,

  request_hash VARCHAR(255) NOT NULL,
  response_data JSONB,
  status_code INTEGER,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_idempotency_keys_key ON idempotency_keys(key);
CREATE INDEX idx_idempotency_keys_expires_at ON idempotency_keys(expires_at);

-- Cleanup automático de keys expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM idempotency_keys WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Job programado (requiere pg_cron extension)
-- SELECT cron.schedule('cleanup-idempotency', '0 * * * *', 'SELECT cleanup_expired_idempotency_keys()');

-- Tabla: api_logs (Para debugging)
CREATE TABLE api_logs (
  id BIGSERIAL PRIMARY KEY,
  sale_id UUID REFERENCES sales(id),

  api_name VARCHAR(50) NOT NULL, -- 'INVENTORY', 'DISPATCH', 'PAYMENT'
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,

  request_data JSONB,
  response_data JSONB,
  response_status INTEGER,
  response_time_ms INTEGER,

  error_message TEXT,

  correlation_id VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_logs_sale_id ON api_logs(sale_id);
CREATE INDEX idx_api_logs_api_name ON api_logs(api_name);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at DESC);
```

---

## 3. Arquitectura de Microservicios

### 3.1 Estructura de Proyecto

```
sales-api/
├── src/
│   ├── modules/
│   │   ├── sales/
│   │   │   ├── sales.controller.ts
│   │   │   ├── sales.service.ts
│   │   │   ├── sales.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-sale.dto.ts
│   │   │   │   └── update-sale.dto.ts
│   │   │   └── entities/
│   │   │       └── sale.entity.ts
│   │   ├── integrations/
│   │   │   ├── inventory/
│   │   │   │   ├── inventory.service.ts
│   │   │   │   ├── inventory.client.ts
│   │   │   │   └── dto/
│   │   │   ├── dispatch/
│   │   │   │   ├── dispatch.service.ts
│   │   │   │   ├── dispatch.client.ts
│   │   │   │   └── dto/
│   │   │   └── payment/
│   │   │       └── payment.service.ts
│   │   ├── saga/
│   │   │   ├── saga.orchestrator.ts
│   │   │   └── steps/
│   │   │       ├── reserve-inventory.step.ts
│   │   │       ├── create-dispatch.step.ts
│   │   │       └── process-payment.step.ts
│   │   ├── webhooks/
│   │   │   ├── webhooks.controller.ts
│   │   │   └── handlers/
│   │   │       ├── inventory-webhook.handler.ts
│   │   │       └── dispatch-webhook.handler.ts
│   │   └── workers/
│   │       ├── reservation-expiry.worker.ts
│   │       └── status-sync.worker.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── middleware/
│   │   │   ├── correlation-id.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   └── utils/
│   │       ├── circuit-breaker.util.ts
│   │       ├── retry.util.ts
│   │       └── idempotency.util.ts
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── rabbitmq.config.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 4. Implementación de Patrones Clave

### 4.1 Saga Orchestrator

```typescript
// saga.orchestrator.ts
import { Injectable, Logger } from '@nestjs/common';

interface SagaStep<T, R> {
  name: string;
  execute: (context: T) => Promise<R>;
  compensate: (context: T, result: R) => Promise<void>;
}

@Injectable()
export class SagaOrchestrator {
  private logger = new Logger(SagaOrchestrator.name);

  async execute<T>(
    steps: SagaStep<T, any>[],
    context: T
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    const executedSteps: Array<{ step: SagaStep<T, any>; result: any }> = [];

    try {
      for (const step of steps) {
        this.logger.log(`Executing step: ${step.name}`);

        const result = await step.execute(context);
        executedSteps.push({ step, result });

        this.logger.log(`Step ${step.name} completed successfully`);
      }

      return { success: true, result: executedSteps };

    } catch (error) {
      this.logger.error(`Saga failed at step: ${error.message}`);

      // Ejecutar compensaciones en orden inverso
      for (let i = executedSteps.length - 1; i >= 0; i--) {
        const { step, result } = executedSteps[i];

        try {
          this.logger.log(`Compensating step: ${step.name}`);
          await step.compensate(context, result);
        } catch (compensationError) {
          this.logger.error(
            `Compensation failed for ${step.name}: ${compensationError.message}`
          );
          // Continuar con otras compensaciones
        }
      }

      return { success: false, error };
    }
  }
}

// Uso en sales.service.ts
@Injectable()
export class SalesService {
  constructor(
    private sagaOrchestrator: SagaOrchestrator,
    private inventoryService: InventoryService,
    private dispatchService: DispatchService,
    private paymentService: PaymentService
  ) {}

  async createSale(createSaleDto: CreateSaleDto) {
    const steps = [
      {
        name: 'ReserveInventory',
        execute: async (ctx) => {
          return await this.inventoryService.createReservation(ctx.items);
        },
        compensate: async (ctx, result) => {
          await this.inventoryService.releaseReservation(result.id);
        }
      },
      {
        name: 'CreateDispatch',
        execute: async (ctx) => {
          return await this.dispatchService.createDispatch({
            saleId: ctx.saleId,
            items: ctx.items,
            address: ctx.deliveryAddress
          });
        },
        compensate: async (ctx, result) => {
          await this.dispatchService.cancelDispatch(result.id);
        }
      },
      {
        name: 'ProcessPayment',
        execute: async (ctx) => {
          return await this.paymentService.processPayment({
            amount: ctx.totalAmount,
            method: ctx.paymentMethod
          });
        },
        compensate: async (ctx, result) => {
          await this.paymentService.refund(result.id);
        }
      }
    ];

    const result = await this.sagaOrchestrator.execute(steps, createSaleDto);

    if (!result.success) {
      throw new Error('Failed to create sale: ' + result.error.message);
    }

    return result;
  }
}
```

### 4.2 Circuit Breaker

```typescript
// circuit-breaker.util.ts
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private nextAttempt: number = Date.now();

  constructor(
    private failureThreshold: number = 5,
    private timeout: number = 30000, // 30 segundos
    private monitoringPeriod: number = 60000 // 1 minuto
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failures++;

    if (this.failures >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Uso
const inventoryCircuitBreaker = new CircuitBreaker(5, 30000);

async function getProductAvailability(productId: string) {
  return await inventoryCircuitBreaker.execute(async () => {
    return await axios.get(`/inventory/products/${productId}/availability`);
  });
}
```

---

## 5. Testing Strategy

### 5.1 Estructura de Tests

```typescript
// sales.service.spec.ts (Unit Test)
describe('SalesService', () => {
  let service: SalesService;
  let inventoryService: jest.Mocked<InventoryService>;
  let dispatchService: jest.Mocked<DispatchService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: InventoryService,
          useValue: {
            createReservation: jest.fn(),
            releaseReservation: jest.fn()
          }
        },
        {
          provide: DispatchService,
          useValue: {
            createDispatch: jest.fn(),
            cancelDispatch: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<SalesService>(SalesService);
    inventoryService = module.get(InventoryService);
    dispatchService = module.get(DispatchService);
  });

  describe('createSale', () => {
    it('should create sale successfully with available stock', async () => {
      // Arrange
      inventoryService.createReservation.mockResolvedValue({
        id: 'RES-001',
        status: 'ACTIVE'
      });
      dispatchService.createDispatch.mockResolvedValue({
        id: 'DISP-001',
        trackingNumber: 'TRK-123'
      });

      // Act
      const result = await service.createSale({
        items: [{ productId: 'PROD-123', quantity: 2 }],
        customerId: 'CUST-001'
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('CONFIRMED');
      expect(inventoryService.createReservation).toHaveBeenCalledTimes(1);
      expect(dispatchService.createDispatch).toHaveBeenCalledTimes(1);
    });

    it('should rollback on dispatch failure', async () => {
      // Arrange
      inventoryService.createReservation.mockResolvedValue({
        id: 'RES-001'
      });
      dispatchService.createDispatch.mockRejectedValue(
        new Error('Dispatch service unavailable')
      );

      // Act & Assert
      await expect(service.createSale({
        items: [{ productId: 'PROD-123', quantity: 2 }]
      })).rejects.toThrow();

      expect(inventoryService.releaseReservation).toHaveBeenCalledWith('RES-001');
    });
  });
});

// sales.controller.e2e-spec.ts (E2E Test)
describe('Sales E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST sales - should create sale with stock available', async () => {
    // Mock external APIs
    nock('https://inventory-api.example.com')
      .get('/api/v1/inventory/products/PROD-123/availability')
      .reply(200, {
        available_stock: 50
      })
      .post('/api/v1/inventory/reservations')
      .reply(201, {
        reservation_id: 'RES-001'
      });

    nock('https://dispatch-api.example.com')
      .post('/api/v1/dispatches')
      .reply(201, {
        dispatch_id: 'DISP-001',
        tracking_number: 'TRK-123'
      });

    const response = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .send({
        channel: 'WEB',
        customer: {
          id: 'CUST-001',
          email: 'test@example.com'
        },
        items: [
          {
            product_id: 'PROD-123',
            quantity: 2,
            unit_price: 50.00
          }
        ]
      })
      .expect(201);

    expect(response.body).toMatchObject({
      status: 'CONFIRMED',
      total_amount: 100.00
    });
  });
});
```

### 5.2 Cobertura de Tests

```
Objetivo de Cobertura:
- Unit Tests: > 80%
- Integration Tests: > 60%
- E2E Tests: Flujos críticos (CU-001 al CU-010)

Prioridad de Testing:
1. Saga orchestration (crítico)
2. Circuit breaker
3. Idempotency
4. Validaciones de negocio
5. Integraciones con APIs externas
```

---

## 6. Seguridad

### 6.1 Autenticación y Autorización

```typescript
// auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Uso
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  @Post()
  @Roles(Role.CUSTOMER, Role.SALES_AGENT)
  async createSale(@Body() createSaleDto: CreateSaleDto) {
    // ...
  }

  @Get(':id')
  @Roles(Role.CUSTOMER, Role.SALES_AGENT, Role.ADMIN)
  async getSale(@Param('id') id: string) {
    // ...
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async cancelSale(@Param('id') id: string) {
    // ...
  }
}
```

### 6.2 Rate Limiting

```typescript
// rate-limit.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private redis: Redis) {}

  async use(req: Request, res: Response, next: Function) {
    const key = `rate_limit:${req.ip}`;
    const limit = 100; // requests
    const window = 60; // seconds

    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, window);
    }

    if (current > limit) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded'
      });
    }

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - current);

    next();
  }
}
```

---

## 7. Monitoreo y Observabilidad

### 7.1 Logging

```typescript
// logger.service.ts
import * as winston from 'winston';

export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'sales-api',
        environment: process.env.NODE_ENV
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'logs/combined.log'
        })
      ]
    });
  }

  log(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, trace?: string, meta?: any) {
    this.logger.error(message, { trace, ...meta });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }
}
```

### 7.2 Métricas (Prometheus)

```typescript
// metrics.service.ts
import { Counter, Histogram, Gauge } from 'prom-client';

export class MetricsService {
  public apiRequestDuration = new Histogram({
    name: 'api_request_duration_ms',
    help: 'Duration of API requests in ms',
    labelNames: ['method', 'route', 'status']
  });

  public externalApiCalls = new Counter({
    name: 'external_api_calls_total',
    help: 'Total number of external API calls',
    labelNames: ['api', 'endpoint', 'status']
  });

  public salesByStatus = new Gauge({
    name: 'sales_by_status',
    help: 'Number of sales by status',
    labelNames: ['status']
  });

  public circuitBreakerState = new Gauge({
    name: 'circuit_breaker_state',
    help: 'State of circuit breaker (0=closed, 1=open, 2=half-open)',
    labelNames: ['service']
  });
}
```

---

## 8. Plan de Implementación por Fases

### Fase 1: MVP (4-6 semanas)
**Objetivo**: Sistema básico funcionando

Semana 1-2: Setup y Fundamentos
- [ ] Setup de proyecto (NestJS + TypeScript)
- [ ] Configuración de base de datos
- [ ] Implementación de modelos básicos
- [ ] Setup de Docker y Docker Compose
- [ ] CI/CD básico

Semana 3-4: Funcionalidad Core
- [ ] CU-001: Venta con stock disponible
- [ ] CU-002: Venta en tienda física
- [ ] Integración básica con API de Inventarios
- [ ] Integración básica con API de Despachos
- [ ] Sistema de reservas

Semana 5-6: Testing y Refinamiento
- [ ] Tests unitarios
- [ ] Tests E2E de flujos críticos
- [ ] Documentación de API (Swagger)
- [ ] Deploy a ambiente de staging

### Fase 2: Fabricación (3-4 semanas)
**Objetivo**: Soporte para productos en fabricación

- [ ] CU-004: Venta con productos en fabricación
- [ ] CU-006: Solicitar fabricación bajo pedido
- [ ] Webhooks de inventario
- [ ] Sistema de notificaciones a clientes
- [ ] Monitoreo de órdenes de fabricación

### Fase 3: Complejidad (4-6 semanas)
**Objetivo**: Escenarios complejos

- [ ] CU-005: Venta mixta
- [ ] CU-008: Entregas parciales
- [ ] CU-010: Manejo de stock insuficiente
- [ ] Saga orchestration completa
- [ ] Circuit breaker para todas las integraciones

### Fase 4: Resiliencia y Escala (3-4 semanas)
**Objetivo**: Sistema production-ready

- [ ] Event sourcing completo
- [ ] Message queue (RabbitMQ)
- [ ] Retry policies avanzadas
- [ ] Idempotency keys
- [ ] Cache distribuido (Redis Cluster)
- [ ] Monitoreo y alertas (Prometheus + Grafana)
- [ ] Load testing

### Fase 5: Optimización (2-3 semanas)
**Objetivo**: Performance y experiencia

- [ ] Optimización de queries
- [ ] Cache warming
- [ ] API rate limiting
- [ ] CDN para assets estáticos
- [ ] Compresión de respuestas
- [ ] Database tuning

---

## 9. Checklist de Production Readiness

### Funcionalidad
- [ ] Todos los casos de uso implementados
- [ ] Integración completa con APIs externas
- [ ] Validaciones de negocio implementadas
- [ ] Webhooks funcionando correctamente

### Calidad
- [ ] Cobertura de tests > 80%
- [ ] Tests E2E de flujos críticos
- [ ] Code review completado
- [ ] Linting y formatting automático

### Seguridad
- [ ] Autenticación y autorización
- [ ] Validación de inputs
- [ ] Rate limiting
- [ ] Secrets en variables de entorno
- [ ] HTTPS en producción
- [ ] Validación de webhooks

### Resiliencia
- [ ] Circuit breakers implementados
- [ ] Retry policies configuradas
- [ ] Timeouts apropiados
- [ ] Graceful shutdown
- [ ] Health checks

### Observabilidad
- [ ] Logging estructurado
- [ ] Métricas de negocio
- [ ] Distributed tracing
- [ ] Alertas configuradas
- [ ] Dashboards de monitoreo

### Infraestructura
- [ ] Docker images optimizadas
- [ ] CI/CD pipeline completo
- [ ] Backup de base de datos
- [ ] Disaster recovery plan
- [ ] Auto-scaling configurado

### Documentación
- [ ] API documentation (Swagger)
- [ ] README actualizado
- [ ] Runbooks para operaciones
- [ ] Arquitectura documentada
- [ ] Casos de uso documentados

---

## 10. Próximos Pasos Inmediatos

1. **Validar con Stakeholders**
   - Revisar casos de uso con equipo de negocio
   - Confirmar prioridades de implementación
   - Definir métricas de éxito

2. **Coordinar con Equipos Externos**
   - Reunión con equipo de Inventarios
   - Reunión con equipo de Despachos
   - Definir SLAs y contratos de API
   - Establecer ambiente de testing compartido

3. **Setup Inicial**
   - Crear repositorio
   - Setup de ambiente de desarrollo
   - Configurar CI/CD básico
   - Crear primer sprint backlog

4. **Proof of Concept**
   - Implementar integración básica con Inventarios
   - Implementar integración básica con Despachos
   - Validar tiempos de respuesta
   - Validar manejo de errores

---

## Conclusión

Este documento proporciona una guía completa para la implementación del sistema de ventas. La clave del éxito estará en:

1. **Iteración Incremental**: Comenzar con MVP y agregar complejidad gradualmente
2. **Resiliencia desde el Inicio**: Implementar circuit breakers y retry desde el principio
3. **Testing Riguroso**: No comprometer en calidad de tests
4. **Monitoreo Proactivo**: Instrumentar desde el día 1
5. **Documentación Continua**: Mantener documentación actualizada

¡Éxito en la implementación!
