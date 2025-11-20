# Glosario - Portal de Ventas

## A

**API (Application Programming Interface)**
Interfaz de programación de aplicaciones que permite la comunicación entre diferentes sistemas de software.

**Autenticación**
Proceso de verificar la identidad de un usuario o sistema.

**Autorización**
Proceso de determinar qué acciones puede realizar un usuario o sistema autenticado.

**Availability (Disponibilidad)**
Estado que indica si un producto está disponible para venta inmediata.

## B

**Backoff Exponencial**
Estrategia de reintento que aumenta el tiempo de espera exponencialmente entre intentos (2s, 4s, 8s, 16s).

**Batch (Lote)**
Conjunto de productos fabricados juntos en un proceso de producción.

**Business Logic (Lógica de Negocio)**
Reglas y procesos que definen cómo se deben realizar las operaciones del negocio.

## C

**Cache**
Almacenamiento temporal de datos para mejorar el rendimiento al reducir consultas repetidas.

**Cache-Aside Pattern**
Patrón donde la aplicación primero verifica el cache, y si no encuentra el dato, consulta la fuente original y luego lo almacena en cache.

**Canal de Venta**
Medio a través del cual se realiza una venta (web, tienda física, móvil, etc.).

**Circuit Breaker**
Patrón de diseño que previene fallos en cascada al detener temporalmente llamadas a servicios que están fallando.

**Compensación**
Acción que revierte o corrige una operación previamente ejecutada en caso de fallo.

**Consistency (Consistencia)**
Propiedad que garantiza que los datos sean coherentes entre diferentes sistemas.

**CQRS (Command Query Responsibility Segregation)**
Patrón que separa las operaciones de lectura de las de escritura.

## D

**Dead Letter Queue**
Cola especial donde se envían mensajes que no pudieron ser procesados después de múltiples intentos.

**Despacho**
Proceso de envío y entrega de productos al cliente.

**Disponibilidad**
Cantidad de un producto que está disponible para venta inmediata.

**Distributed Transaction**
Transacción que involucra múltiples sistemas o bases de datos.

**DTO (Data Transfer Object)**
Objeto que encapsula datos para transferencia entre capas o sistemas.

## E

**Entrega Inmediata**
Despacho que se realiza el mismo día o día siguiente a la compra.

**Entrega Parcial**
Despacho de solo parte de los productos de una venta, con el resto entregado posteriormente.

**Entrega Programada**
Despacho planificado para una fecha futura específica.

**Event-Driven Architecture**
Arquitectura donde los sistemas se comunican mediante eventos.

**Event Sourcing**
Patrón donde todos los cambios de estado se almacenan como secuencia de eventos.

**Eventual Consistency**
Modelo de consistencia donde los datos eventualmente se sincronizan entre sistemas, pero pueden estar temporalmente desactualizados.

## F

**Fabricación**
Proceso de producción de productos.

**Fabricación Bajo Pedido (Made-to-Order)**
Proceso donde un producto se fabrica específicamente para un pedido de cliente.

**Fallback**
Alternativa o plan de respaldo cuando una operación principal falla.

**Feature Flag**
Mecanismo que permite activar/desactivar funcionalidades sin cambiar código.

## G

**Graceful Degradation**
Capacidad del sistema de continuar operando con funcionalidad reducida cuando hay fallos.

## H

**Health Check**
Endpoint o mecanismo que verifica si un servicio está funcionando correctamente.

**HEREDOC**
Formato para definir strings multi-línea en código.

## I

**Idempotencia**
Propiedad donde ejecutar una operación múltiples veces produce el mismo resultado que ejecutarla una vez.

**Idempotency Key**
Identificador único usado para garantizar idempotencia en operaciones.

**In-Memory Cache**
Cache almacenado en memoria RAM para acceso ultra-rápido.

**Inventario**
Stock o existencias de productos disponibles.

## J

**JSON (JavaScript Object Notation)**
Formato ligero de intercambio de datos.

**JWT (JSON Web Token)**
Estándar para tokens de autenticación basados en JSON.

## K

**Kubernetes (K8s)**
Plataforma de orquestación de contenedores.

## L

**Latencia**
Tiempo que toma completar una operación o recibir una respuesta.

**Lead Time**
Tiempo requerido desde que se inicia un proceso hasta que se completa.

**Load Balancing**
Distribución de carga de trabajo entre múltiples servidores.

**Logging**
Registro de eventos y actividades del sistema.

## M

**Manufacturing (Fabricación)**
Ver Fabricación.

**Message Queue**
Sistema que permite comunicación asíncrona entre servicios mediante colas de mensajes.

**Microservices**
Arquitectura donde la aplicación se divide en servicios pequeños e independientes.

**Monitoreo**
Observación continua del estado y rendimiento del sistema.

## N

**NPS (Net Promoter Score)**
Métrica de satisfacción del cliente.

## O

**Observabilidad**
Capacidad de entender el estado interno de un sistema basándose en sus salidas externas.

**Orchestration (Orquestación)**
Coordinación centralizada de múltiples servicios o procesos.

## P

**P95 (Percentil 95)**
Métrica que indica que el 95% de las operaciones se completan en ese tiempo o menos.

**Payment Gateway**
Servicio que procesa pagos electrónicos.

**Pending (Pendiente)**
Estado que indica que una operación aún no se ha completado.

**POS (Point of Sale)**
Sistema de punto de venta usado en tiendas físicas.

## R

**Rate Limiting**
Restricción del número de requests permitidos en un período de tiempo.

**Redis**
Base de datos en memoria usada típicamente para cache y mensajería.

**Refund (Reembolso)**
Devolución de dinero a un cliente.

**Reserva**
Bloqueo temporal de inventario para una venta específica.

**Resiliencia**
Capacidad del sistema de recuperarse de fallos y continuar operando.

**REST (Representational State Transfer)**
Estilo arquitectónico para APIs web.

**Retry Policy**
Reglas que definen cómo y cuándo reintentar operaciones fallidas.

**Rollback**
Reversión de cambios o transacciones.

## S

**Saga Pattern**
Patrón para manejar transacciones distribuidas mediante secuencia de transacciones locales.

**Scheduled Delivery**
Ver Entrega Programada.

**SLA (Service Level Agreement)**
Acuerdo que define niveles esperados de servicio.

**Snapshot**
Copia del estado de datos en un momento específico.

**Stock**
Cantidad de productos disponibles en inventario.

**Synchronous (Síncrono)**
Operación donde el solicitante espera la respuesta antes de continuar.

## T

**Timeout**
Límite de tiempo para completar una operación.

**Tracing (Rastreo)**
Seguimiento de una request a través de múltiples servicios.

**Transaction**
Conjunto de operaciones que se ejecutan como una unidad atómica.

**TTL (Time To Live)**
Tiempo que un dato permanece válido en cache.

## U

**Uptime**
Porcentaje de tiempo que un sistema está disponible y funcionando.

## V

**Venta**
Transacción comercial donde un cliente compra productos.

**Venta Mixta**
Venta que incluye productos de diferentes disponibilidades (stock, fabricación, etc.).

## W

**Webhook**
Mecanismo donde un sistema notifica a otro sobre eventos mediante HTTP callbacks.

**Worker**
Proceso background que ejecuta tareas asíncronas.

## Acrónimos Comunes

- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **DB**: Database
- **DTO**: Data Transfer Object
- **E2E**: End-to-End
- **HTTP**: Hypertext Transfer Protocol
- **HTTPS**: HTTP Secure
- **JSON**: JavaScript Object Notation
- **JWT**: JSON Web Token
- **MVP**: Minimum Viable Product
- **ORM**: Object-Relational Mapping
- **REST**: Representational State Transfer
- **SLA**: Service Level Agreement
- **SQL**: Structured Query Language
- **TTL**: Time To Live
- **UUID**: Universally Unique Identifier

## Estados de Venta

| Estado | Descripción |
|--------|-------------|
| `PENDING_PAYMENT` | Esperando pago del cliente |
| `CONFIRMED` | Pago confirmado, pendiente preparación |
| `IN_PREPARATION` | Preparando productos para despacho |
| `IN_TRANSIT` | En camino al cliente |
| `DELIVERED` | Entregado al cliente |
| `COMPLETED` | Venta completada exitosamente |
| `CANCELLED` | Venta cancelada |
| `PENDING_MANUFACTURING` | Esperando fabricación |
| `MANUFACTURING_IN_PROGRESS` | Productos en fabricación |
| `READY_FOR_DISPATCH` | Listo para crear despacho |
| `PARTIALLY_SHIPPED` | Algunos productos ya enviados |
| `SCHEDULED` | Programada para fecha futura |

## Tipos de Disponibilidad

| Tipo | Descripción |
|------|-------------|
| `STOCK` | Producto disponible en inventario |
| `MANUFACTURING` | Producto en proceso de fabricación |
| `MADE_TO_ORDER` | Producto se fabricará bajo pedido |
| `OUT_OF_STOCK` | Sin stock ni en fabricación |
| `DISCONTINUED` | Producto descontinuado |

## Canales de Venta

| Canal | Descripción |
|-------|-------------|
| `WEB` | Portal web / e-commerce |
| `STORE` | Tienda física / POS |
| `MOBILE` | Aplicación móvil |
| `PHONE` | Venta telefónica |
| `B2B` | Business to Business |

## Prioridades de Fabricación

| Prioridad | Descripción |
|-----------|-------------|
| `URGENT` | Máxima prioridad, pedidos VIP |
| `HIGH` | Alta prioridad |
| `NORMAL` | Prioridad normal |
| `LOW` | Baja prioridad |
| `SCHEDULED` | Fabricación programada |

## Códigos de Error Comunes

| Código | Significado |
|--------|-------------|
| `INSUFFICIENT_STOCK` | Stock insuficiente |
| `RESERVATION_EXPIRED` | Reserva expirada |
| `RESERVATION_FAILED` | Fallo al crear reserva |
| `DISPATCH_FAILED` | Fallo al crear despacho |
| `PAYMENT_FAILED` | Pago rechazado |
| `INVALID_ADDRESS` | Dirección de entrega inválida |
| `SERVICE_UNAVAILABLE` | Servicio no disponible |
| `CIRCUIT_BREAKER_OPEN` | Circuit breaker abierto |
| `TIMEOUT` | Operación expiró |
| `CANNOT_CANCEL` | Venta no puede cancelarse |
