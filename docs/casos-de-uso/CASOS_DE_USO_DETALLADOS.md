# Casos de Uso Detallados - Portal de Ventas

## Versión: 1.0

---

## Índice de Casos de Uso

1. [CU-001: Venta Web con Stock Disponible - Entrega Inmediata](#cu-001)
2. [CU-002: Venta Tienda Física con Stock Disponible](#cu-002)
3. [CU-003: Venta con Despacho Programado](#cu-003)
4. [CU-004: Venta con Productos en Fabricación](#cu-004)
5. [CU-005: Venta Mixta (Stock + Fabricación)](#cu-005)
6. [CU-006: Venta sin Stock - Pendiente Fabricación](#cu-006)
7. [CU-007: Cancelación de Venta](#cu-007)
8. [CU-008: Entrega Parcial](#cu-008)
9. [CU-009: Reserva de Productos](#cu-009)
10. [CU-010: Venta con Stock Insuficiente](#cu-010)

---

## <a name="cu-001"></a>CU-001: Venta Web con Stock Disponible - Entrega Inmediata

### Descripción
Cliente compra productos disponibles en stock desde el portal web y solicita entrega inmediata.

### Actores
- Cliente (web)
- Sistema de Ventas
- API de Inventarios
- API de Despachos

### Precondiciones
- Cliente ha seleccionado productos
- Productos están en el carrito
- Cliente ha iniciado proceso de checkout

### Flujo Principal

1. Cliente confirma la compra en el portal web
2. Sistema de Ventas recibe la solicitud de venta
3. Sistema valida datos de la venta (productos, cantidades, dirección)
4. Sistema consulta disponibilidad a API de Inventarios
   - `GET /api/inventory/products/{id}/availability`
5. API de Inventarios responde con stock disponible
6. Sistema verifica que hay stock suficiente para todos los productos
7. Sistema consulta disponibilidad de despacho inmediato
   - `GET /api/dispatches/availability`
8. Sistema crea reserva de inventario
   - `POST /api/inventory/reservations`
   ```json
   {
     "sale_id": "SALE-001",
     "items": [
       {"product_id": "PROD-123", "quantity": 2}
     ],
     "expiration_time": "2025-11-20T15:30:00Z"
   }
   ```
9. Sistema crea la venta con estado `PENDING_PAYMENT`
10. Cliente completa el pago (sistema externo)
11. Sistema recibe confirmación de pago
12. Sistema actualiza venta a estado `CONFIRMED`
13. Sistema crea orden de despacho
    - `POST /api/dispatches`
    ```json
    {
      "sale_id": "SALE-001",
      "type": "IMMEDIATE",
      "items": [...],
      "delivery_address": {...}
    }
    ```
14. API de Despachos confirma creación de orden
15. Sistema actualiza venta a estado `IN_PREPARATION`
16. Sistema envía notificación al cliente con número de seguimiento
17. Fin del caso de uso

### Flujos Alternativos

**FA-001: Stock Insuficiente en Paso 6**
- Sistema informa al cliente sobre stock insuficiente
- Ofrece opciones: reducir cantidad, esperar restock, cancelar
- Ver CU-010

**FA-002: Fallo en Reserva en Paso 8**
- Sistema reintenta la reserva (máximo 3 intentos)
- Si falla, informa al cliente y cancela la operación
- Libera recursos

**FA-003: Pago Fallido en Paso 10**
- Sistema espera timeout (15 minutos)
- Si no hay pago, libera la reserva
- Venta pasa a estado `CANCELLED`

**FA-004: Fallo en Creación de Despacho en Paso 13**
- Sistema reintenta con patrón de backoff exponencial
- Si falla después de 3 intentos, marca venta como `PENDING_DISPATCH`
- Envía alerta a equipo de operaciones
- Cola el despacho para procesamiento asíncrono

### Postcondiciones Exitosas
- Venta creada con estado `IN_PREPARATION`
- Inventario reservado y posteriormente descontado
- Orden de despacho creada
- Cliente notificado

### Postcondiciones de Fallo
- Reservas liberadas
- Venta cancelada o en estado de error
- Cliente notificado del problema

---

## <a name="cu-002"></a>CU-002: Venta Tienda Física con Stock Disponible

### Descripción
Vendedor procesa una venta en tienda física con productos disponibles para entrega inmediata en el local.

### Actores
- Vendedor (tienda física)
- Cliente (presencial)
- Sistema de Ventas
- API de Inventarios

### Precondiciones
- Vendedor autenticado en el sistema POS
- Cliente presente en tienda

### Flujo Principal

1. Vendedor escanea o ingresa productos
2. Sistema consulta disponibilidad en tiempo real
   - `GET /api/inventory/products/{id}/availability?location=STORE-001`
3. API de Inventarios confirma stock en tienda
4. Sistema muestra precio y disponibilidad
5. Vendedor confirma los productos y cantidades
6. Cliente selecciona método de entrega: "Retiro en tienda"
7. Sistema crea reserva temporal de inventario
8. Cliente realiza el pago
9. Sistema confirma pago
10. Sistema crea la venta con estado `COMPLETED`
11. Sistema actualiza inventario (descuenta stock)
    - `PUT /api/inventory/products/{id}/stock`
12. Sistema imprime recibo/factura
13. Vendedor entrega productos al cliente
14. Fin del caso de uso

### Flujos Alternativos

**FA-001: Producto sin Stock en Tienda en Paso 3**
- Sistema consulta stock en otras tiendas cercanas
- Ofrece opciones:
  - Transferencia desde otra tienda
  - Pedido con despacho a domicilio
  - Esperar restock con reserva
- Ver CU-003 o CU-006

**FA-002: Cliente Solicita Despacho a Domicilio**
- Sistema consulta API de Despachos
- Calcula costo y fecha de entrega
- Procede como CU-001 (desde paso 13)

### Postcondiciones Exitosas
- Venta completada
- Inventario actualizado
- Productos entregados al cliente
- Recibo generado

---

## <a name="cu-003"></a>CU-003: Venta con Despacho Programado

### Descripción
Cliente compra productos disponibles pero solicita entrega en una fecha futura específica.

### Actores
- Cliente
- Sistema de Ventas
- API de Inventarios
- API de Despachos

### Precondiciones
- Productos disponibles en stock
- Cliente ha seleccionado fecha de entrega futura

### Flujo Principal

1. Cliente selecciona productos y fecha de entrega deseada
2. Sistema consulta disponibilidad
   - `GET /api/inventory/products/{id}/availability?date=2025-12-15`
3. Sistema verifica que los productos estarán disponibles en la fecha
4. Sistema consulta disponibilidad de despacho para la fecha
   - `GET /api/dispatches/availability?date=2025-12-15&location={postal_code}`
5. API de Despachos confirma disponibilidad
6. Sistema crea reserva de inventario con fecha específica
   ```json
   {
     "sale_id": "SALE-002",
     "items": [...],
     "reservation_date": "2025-12-15",
     "delivery_date": "2025-12-15"
   }
   ```
7. Cliente completa el pago
8. Sistema crea la venta con estado `SCHEDULED`
9. Sistema programa despacho
   - `POST /api/dispatches/schedule`
   ```json
   {
     "sale_id": "SALE-002",
     "scheduled_date": "2025-12-15",
     "items": [...],
     "delivery_address": {...}
   }
   ```
10. Sistema envía confirmación al cliente con fecha programada
11. Sistema agenda recordatorio para preparación (1-2 días antes)
12. En fecha programada - 1 día:
    - Sistema verifica disponibilidad de productos
    - Actualiza estado a `IN_PREPARATION`
    - Notifica al equipo de despachos
13. En fecha programada:
    - Despacho se ejecuta
    - Estado cambia a `IN_TRANSIT`
14. Fin del caso de uso

### Flujos Alternativos

**FA-001: Productos No Disponibles en Fecha Programada**
- Sistema consulta nueva fecha estimada
- Notifica al cliente automáticamente
- Ofrece opciones: aceptar nueva fecha, cancelar, cambiar productos
- Espera confirmación del cliente

**FA-002: Cliente Adelanta Fecha de Entrega**
- Sistema verifica nueva disponibilidad
- Si es posible, actualiza reserva y despacho programado
- Confirma con cliente

**FA-003: Cliente Retrasa Fecha de Entrega**
- Sistema actualiza reserva y despacho
- Confirma nueva fecha

### Postcondiciones Exitosas
- Venta programada correctamente
- Reserva de inventario creada
- Despacho programado
- Cliente notificado

---

## <a name="cu-004"></a>CU-004: Venta con Productos en Fabricación

### Descripción
Cliente compra productos que actualmente están en proceso de fabricación.

### Actores
- Cliente
- Sistema de Ventas
- API de Inventarios
- API de Despachos

### Precondiciones
- Productos están en fabricación
- Sistema de Inventarios puede proporcionar fecha estimada

### Flujo Principal

1. Cliente selecciona productos
2. Sistema consulta disponibilidad
   - `GET /api/inventory/products/{id}/availability`
3. API de Inventarios responde:
   ```json
   {
     "product_id": "PROD-456",
     "available_stock": 0,
     "in_manufacturing": 50,
     "manufacturing_status": "IN_PROGRESS",
     "estimated_completion_date": "2025-12-01",
     "confidence_level": "HIGH"
   }
   ```
4. Sistema muestra al cliente:
   - Producto en fabricación
   - Fecha estimada de disponibilidad
   - Posibilidad de realizar pedido anticipado
5. Cliente acepta fecha estimada y confirma compra
6. Sistema consulta tiempo adicional de despacho
7. Sistema calcula fecha estimada de entrega total
   - Fecha fabricación + Tiempo despacho
8. Sistema crea la venta con estado `PENDING_MANUFACTURING`
9. Sistema crea reserva en producción
   - `POST /api/inventory/manufacturing-reservations`
   ```json
   {
     "sale_id": "SALE-003",
     "items": [
       {
         "product_id": "PROD-456",
         "quantity": 5,
         "batch_id": "BATCH-2025-12"
       }
     ]
   }
   ```
10. Cliente realiza el pago
11. Sistema actualiza venta a `CONFIRMED_PENDING_MANUFACTURING`
12. Sistema programa despacho condicional
    ```json
    {
      "sale_id": "SALE-003",
      "type": "SCHEDULED_CONDITIONAL",
      "condition": "MANUFACTURING_COMPLETE",
      "estimated_date": "2025-12-01"
    }
    ```
13. Sistema envía confirmación al cliente con:
    - Número de pedido
    - Fecha estimada
    - Compromiso de notificación ante cambios
14. Sistema se suscribe a actualizaciones de fabricación
15. Cuando fabricación completa:
    - API de Inventarios notifica
    - Sistema actualiza estado a `READY_FOR_DISPATCH`
    - Sistema confirma despacho programado
    - Sistema notifica al cliente
16. Despacho se ejecuta
17. Fin del caso de uso

### Flujos Alternativos

**FA-001: Retraso en Fabricación**
1. API de Inventarios notifica retraso
2. Sistema recibe nueva fecha estimada
3. Sistema notifica automáticamente al cliente
4. Ofrece opciones:
   - Aceptar nueva fecha
   - Cambiar por producto disponible
   - Cancelar y reembolsar
5. Actualiza fecha de despacho programado
6. Registra cambio en historial

**FA-002: Fabricación Adelantada**
1. API de Inventarios notifica disponibilidad anticipada
2. Sistema consulta si puede adelantar despacho
3. Notifica al cliente la buena noticia
4. Confirma o ajusta fecha de entrega

**FA-003: Problema en Fabricación**
1. API de Inventarios notifica problema
2. Sistema evalúa severidad:
   - **Menor**: Solo notifica retraso
   - **Mayor**: Ofrece alternativas o cancelación
3. Comunica con cliente
4. Ejecuta acción acordada

### Postcondiciones Exitosas
- Venta creada con reserva en producción
- Cliente informado de fechas estimadas
- Sistema monitoreando fabricación
- Despacho programado condicionalmente

---

## <a name="cu-005"></a>CU-005: Venta Mixta (Stock + Fabricación)

### Descripción
Cliente compra múltiples productos donde algunos están disponibles en stock y otros en fabricación.

### Actores
- Cliente
- Sistema de Ventas
- API de Inventarios
- API de Despachos

### Precondiciones
- Cliente ha agregado productos de diferentes disponibilidades

### Flujo Principal

1. Cliente finaliza carrito con productos mixtos
2. Sistema consulta disponibilidad de cada producto
3. Sistema identifica y agrupa productos:
   - Grupo A: Disponibles inmediatamente (n productos)
   - Grupo B: En fabricación (m productos)
4. Sistema presenta opciones al cliente:

   **Opción 1: Envío Único**
   - Esperar a que todos los productos estén disponibles
   - Un solo despacho
   - Fecha estimada: cuando Grupo B esté listo

   **Opción 2: Envíos Separados**
   - Despacho inmediato del Grupo A
   - Despacho programado del Grupo B cuando esté listo
   - Puede tener costo adicional de envío

   **Opción 3: Modificar Pedido**
   - Remover productos en fabricación
   - O remover productos disponibles
   - Continuar con un grupo homogéneo

5. Cliente selecciona opción
6. **Si selecciona Opción 1 (Envío Único)**:
   - Sistema reserva productos del Grupo A
   - Sistema crea reserva en producción del Grupo B
   - Sistema crea una venta con estado `PARTIALLY_AVAILABLE`
   - Sistema programa un despacho condicional para fecha estimada
   - Sistema monitorea fabricación del Grupo B

7. **Si selecciona Opción 2 (Envíos Separados)**:
   - Sistema crea DOS órdenes de venta vinculadas:
     - SALE-004-A: Productos disponibles
     - SALE-004-B: Productos en fabricación
   - Procesa SALE-004-A como CU-001 (entrega inmediata)
   - Procesa SALE-004-B como CU-004 (pending manufacturing)
   - Vincula ambas ventas con `parent_sale_id`

8. Cliente completa pago
9. Sistema confirma ambas partes de la venta
10. Sistema envía confirmación detallada:
    - Parte 1: Enviada el [fecha inmediata]
    - Parte 2: Enviada el [fecha estimada]
11. Sistema ejecuta despachos según cronograma
12. Fin del caso de uso

### Flujos Alternativos

**FA-001: Cliente Cambia de Opción Después del Pago**
- Validar si es posible el cambio
- Si productos del Grupo A aún no despachados, permitir modificación
- Ajustar despachos y notificar cambios

**FA-002: Grupo B Se Completa Antes de lo Esperado**
- Notificar al cliente
- Si eligió Opción 1, adelantar despacho completo
- Si eligió Opción 2, adelantar despacho del Grupo B

**FA-003: Retraso en Grupo B con Opción 1**
- Notificar al cliente del retraso
- Ofrecer cambiar a Opción 2 (enviar lo disponible ya)
- Cliente decide

### Postcondiciones Exitosas
- Venta(s) creada(s) según opción seleccionada
- Reservas e inventario gestionadas correctamente
- Despachos programados apropiadamente
- Cliente completamente informado

---

## <a name="cu-006"></a>CU-006: Venta sin Stock - Pendiente Fabricación

### Descripción
Cliente solicita productos que no tienen stock pero se pueden fabricar.

### Actores
- Cliente
- Sistema de Ventas
- API de Inventarios
- API de Despachos

### Precondiciones
- Producto no disponible en stock
- Producto puede fabricarse
- Capacidad de fabricación disponible

### Flujo Principal

1. Cliente selecciona producto sin stock
2. Sistema consulta disponibilidad
   - `GET /api/inventory/products/{id}/availability`
3. API de Inventarios responde:
   ```json
   {
     "product_id": "PROD-789",
     "available_stock": 0,
     "in_manufacturing": 0,
     "can_manufacture": true,
     "manufacturing_lead_time_days": 15,
     "minimum_order_quantity": 1,
     "estimated_start_date": "2025-11-22",
     "estimated_completion_date": "2025-12-07"
   }
   ```
4. Sistema presenta al cliente:
   - Producto actualmente no disponible
   - Puede fabricarse bajo pedido
   - Tiempo estimado: 15 días
   - Fecha estimada de entrega: 2025-12-07
5. Cliente decide proceder con pedido anticipado
6. Sistema verifica cantidad mínima de pedido
7. Sistema solicita inicio de fabricación
   - `POST /api/inventory/manufacturing-orders`
   ```json
   {
     "product_id": "PROD-789",
     "quantity": 10,
     "priority": "NORMAL",
     "required_by": "2025-12-07",
     "customer_order": "SALE-005"
   }
   ```
8. API de Inventarios confirma orden de fabricación
9. Sistema crea la venta con estado `PENDING_MANUFACTURING_START`
10. Cliente realiza pago (o pago parcial si aplica)
11. Sistema actualiza venta a `MANUFACTURING_IN_PROGRESS`
12. Sistema programa monitoreo de fabricación
13. Sistema envía confirmación al cliente:
    - Fabricación iniciará pronto
    - Actualizaciones periódicas del progreso
    - Fecha estimada
14. Sistema recibe actualizaciones periódicas de fabricación:
    - Inicio de producción → Notifica cliente
    - 50% completado → Notifica cliente
    - 100% completado → Procede a despacho
15. Al completar fabricación:
    - Sistema actualiza estado a `READY_FOR_DISPATCH`
    - Sistema crea orden de despacho
    - Sistema notifica al cliente
16. Despacho se ejecuta
17. Fin del caso de uso

### Flujos Alternativos

**FA-001: Capacidad de Fabricación No Disponible**
1. API de Inventarios indica que no puede iniciar producción
2. Proporciona siguiente fecha disponible
3. Sistema informa al cliente
4. Cliente decide: aceptar nueva fecha o cancelar

**FA-002: Cantidad Solicitada Menor a Mínimo**
1. Sistema informa cantidad mínima requerida
2. Ofrece opciones:
   - Aumentar cantidad y obtener descuento
   - Unirse a un "pedido grupal" con otros clientes
   - Seleccionar producto alternativo disponible
   - Cancelar

**FA-003: Problemas Durante Fabricación**
1. API de Inventarios reporta problema
2. Sistema evalúa impacto
3. Notifica al cliente con opciones según gravedad
4. Ejecuta acción acordada

**FA-004: Cliente Cancela Durante Fabricación**
1. Sistema consulta estado de fabricación
2. Si no iniciada: cancela sin penalización
3. Si iniciada: evalúa costos incurridos
4. Aplica política de cancelación
5. Procesa reembolso correspondiente

### Postcondiciones Exitosas
- Orden de fabricación creada
- Venta vinculada a orden de fabricación
- Cliente informado y comprometido
- Monitoreo activo de progreso

---

## <a name="cu-007"></a>CU-007: Cancelación de Venta

### Descripción
Cliente o sistema cancela una venta existente.

### Actores
- Cliente o Sistema
- Sistema de Ventas
- API de Inventarios
- API de Despachos

### Precondiciones
- Venta existe en el sistema
- Venta está en estado cancelable

### Flujo Principal

1. Se recibe solicitud de cancelación (cliente o automática)
2. Sistema valida si la venta puede cancelarse según su estado:
   - `PENDING_PAYMENT`: ✅ Cancelable
   - `CONFIRMED`: ✅ Cancelable con condiciones
   - `IN_PREPARATION`: ⚠️ Requiere aprobación
   - `IN_TRANSIT`: ❌ No cancelable (solo devolución)
   - `DELIVERED`: ❌ No cancelable (solo devolución)
3. Sistema evalúa impacto de la cancelación:
   - ¿Hay inventario reservado?
   - ¿Hay despacho creado?
   - ¿Hay fabricación en curso?
   - ¿Hay pago procesado?
4. Sistema inicia proceso de compensación:

   **a. Liberar Inventario**
   ```
   PUT /api/inventory/reservations/{id}/release
   ```

   **b. Cancelar Despacho**
   ```
   PUT /api/dispatches/{id}/cancel
   ```

   **c. Detener Fabricación (si aplica y es posible)**
   ```
   PUT /api/inventory/manufacturing-orders/{id}/cancel
   ```
5. API de Inventarios confirma liberación
6. API de Despachos confirma cancelación
7. Sistema actualiza venta a estado `CANCELLED`
8. Sistema procesa reembolso (si hubo pago)
9. Sistema registra razón de cancelación
10. Sistema notifica al cliente
11. Fin del caso de uso

### Flujos Alternativos

**FA-001: Despacho Ya Enviado**
- No se puede cancelar, solo generar devolución
- Sistema informa al cliente
- Ofrece proceso de devolución
- Ver CU de Devolución

**FA-002: Fabricación No Puede Detenerse**
- Evaluar costo de cancelación
- Informar al cliente
- Cliente decide: aceptar producto o pagar penalización
- Ajustar proceso según decisión

**FA-003: Fallo al Liberar Inventario**
- Sistema reintenta operación
- Si falla, registra inconsistencia
- Alerta a equipo de operaciones
- Genera ticket de soporte
- Continúa con cancelación y reembolso al cliente

### Postcondiciones Exitosas
- Venta cancelada
- Inventario liberado
- Despacho cancelado
- Reembolso procesado
- Cliente notificado

---

## <a name="cu-008"></a>CU-008: Entrega Parcial

### Descripción
Despachar productos disponibles mientras otros aún están pendientes.

### Actores
- Sistema de Ventas
- API de Inventarios
- API de Despachos
- Cliente

### Precondiciones
- Venta contiene múltiples productos
- Algunos productos disponibles, otros no
- Cliente ha autorizado entregas parciales

### Flujo Principal

1. Sistema identifica venta con productos de disponibilidad mixta
2. Sistema verifica preferencia del cliente sobre entregas parciales
3. Cliente acepta recibir productos por partes
4. Sistema divide la venta en lotes:
   - Lote 1: Productos disponibles ahora
   - Lote 2: Productos disponibles en [fecha 1]
   - Lote N: Productos disponibles en [fecha N]
5. Sistema crea múltiples órdenes de despacho vinculadas:
   ```json
   {
     "parent_sale_id": "SALE-007",
     "shipments": [
       {
         "shipment_id": "SHIP-007-1",
         "items": [...],
         "status": "READY",
         "estimated_date": "2025-11-21"
       },
       {
         "shipment_id": "SHIP-007-2",
         "items": [...],
         "status": "PENDING",
         "estimated_date": "2025-12-05"
       }
     ]
   }
   ```
6. Sistema ejecuta primer despacho
7. Sistema actualiza venta a `PARTIALLY_SHIPPED`
8. Sistema notifica al cliente:
   - Parte 1 enviada
   - Tracking de parte 1
   - Pendientes de parte 2 con fecha estimada
9. Cuando productos del Lote 2 están disponibles:
   - Sistema crea segundo despacho
   - Ejecuta envío
   - Notifica al cliente
10. Cuando todos los lotes han sido despachados:
    - Sistema actualiza venta a `COMPLETED`
    - Envía confirmación final
11. Fin del caso de uso

### Flujos Alternativos

**FA-001: Cliente No Acepta Entregas Parciales**
- Proceder como CU-005 Opción 1 (envío único)
- Esperar a que todo esté disponible

**FA-002: Cliente Cancela Lotes Pendientes**
- Mantener lotes ya enviados
- Cancelar lotes pendientes
- Procesar reembolso parcial
- Actualizar estado de la venta

**FA-003: Costo de Envíos Múltiples**
- Calcular costo adicional
- Informar al cliente
- Cliente decide: aceptar costo o esperar envío único

### Postcondiciones Exitosas
- Venta completada en múltiples entregas
- Cliente recibió todos los productos
- Todos los despachos registrados
- Cliente satisfecho con comunicación

---

## <a name="cu-009"></a>CU-009: Reserva de Productos

### Descripción
Cliente reserva productos sin completar la compra inmediatamente.

### Actores
- Cliente
- Sistema de Ventas
- API de Inventarios

### Precondiciones
- Productos disponibles
- Sistema permite reservas

### Flujo Principal

1. Cliente solicita reservar productos
2. Sistema consulta disponibilidad
3. Sistema verifica política de reservas:
   - Tiempo máximo de reserva: 24 horas
   - Cantidad máxima por cliente
   - Requiere anticipo o no
4. Sistema crea reserva temporal:
   ```json
   {
     "reservation_id": "RES-001",
     "customer_id": "CUST-123",
     "items": [...],
     "created_at": "2025-11-20T10:00:00Z",
     "expires_at": "2025-11-21T10:00:00Z",
     "status": "ACTIVE",
     "requires_deposit": false
   }
   ```
5. Sistema reserva inventario
   - `POST /api/inventory/reservations`
6. Sistema informa al cliente:
   - Productos reservados
   - Tiempo de expiración
   - Instrucciones para completar compra
7. Sistema programa tarea de expiración
8. Si cliente completa compra antes de expiración:
   - Convierte reserva en venta
   - Procede con flujo normal de venta
9. Si expira sin compra:
   - Sistema libera automáticamente inventario
   - Notifica al cliente (opcional)
   - Marca reserva como `EXPIRED`
10. Fin del caso de uso

### Flujos Alternativos

**FA-001: Cliente Solicita Extensión de Reserva**
- Validar si es posible extender
- Verificar disponibilidad continua
- Extender hasta límite máximo permitido
- Confirmar con cliente

**FA-002: Reserva Requiere Anticipo**
- Sistema solicita pago de anticipo
- Cliente paga anticipo
- Reserva se confirma
- Anticipo se aplica a compra final

**FA-003: Producto Se Agota Durante Reserva**
- Situación excepcional (error de concurrencia)
- Sistema detecta inconsistencia
- Notifica al cliente inmediatamente
- Ofrece alternativas o reembolso de anticipo

### Postcondiciones Exitosas
- Reserva creada o convertida en venta
- Inventario gestionado correctamente
- Cliente informado del status

---

## <a name="cu-010"></a>CU-010: Venta con Stock Insuficiente

### Descripción
Cliente solicita cantidad mayor a la disponible en stock.

### Actores
- Cliente
- Sistema de Ventas
- API de Inventarios

### Precondiciones
- Cliente ha seleccionado cantidad de producto
- Cantidad solicitada > Stock disponible

### Flujo Principal

1. Cliente solicita cantidad X de producto
2. Sistema consulta disponibilidad
   ```json
   {
     "product_id": "PROD-999",
     "requested_quantity": 100,
     "available_stock": 60,
     "in_manufacturing": 30,
     "can_manufacture_more": true,
     "additional_manufacturing_time_days": 10
   }
   ```
3. Sistema detecta stock insuficiente
4. Sistema presenta opciones al cliente:

   **Opción A: Comprar Solo Disponible**
   - Cantidad: 60 unidades
   - Disponibilidad: Inmediata

   **Opción B: Comprar Disponible + En Fabricación**
   - Parte 1: 60 unidades (inmediato)
   - Parte 2: 30 unidades (fecha estimada)
   - Opción de envío único o separado

   **Opción C: Completar Cantidad con Fabricación Adicional**
   - Parte 1: 60 unidades (inmediato)
   - Parte 2: 30 unidades (fabricación actual)
   - Parte 3: 10 unidades (fabricación nueva, +10 días)

   **Opción D: Esperar a Completar Todo**
   - 100 unidades cuando todo esté disponible
   - Fecha estimada: [fecha más lejana]

   **Opción E: Notificar Cuando Haya Stock**
   - No comprar ahora
   - Recibir notificación cuando haya stock
   - Sin reserva

5. Cliente selecciona una opción
6. Sistema procesa según opción seleccionada:
   - Opción A → CU-001 con cantidad ajustada
   - Opción B → CU-005 (venta mixta)
   - Opción C → CU-005 con múltiples lotes
   - Opción D → CU-003 (despacho programado)
   - Opción E → Crear alerta de disponibilidad
7. Fin del caso de uso

### Flujos Alternativos

**FA-001: No Se Puede Fabricar Más**
- Solo Opciones A y E disponibles
- Informar al cliente
- Cliente decide

**FA-002: Cliente Empresarial con Descuento por Volumen**
- Evaluar si cantidad reducida mantiene descuento
- Ajustar precio si es necesario
- Informar al cliente el cambio
- Cliente decide si continúa

**FA-003: Stock Se Agota Mientras Cliente Decide**
- Sistema detecta cambio de disponibilidad
- Actualiza opciones automáticamente
- Notifica al cliente del cambio
- Cliente re-evalúa decisión

### Postcondiciones Exitosas
- Cliente informado de opciones
- Acción tomada según elección
- Expectativas claras establecidas

---

## Matriz de Estados de Venta

| Estado | Descripción | Puede Transitar A |
|--------|-------------|-------------------|
| `PENDING_PAYMENT` | Esperando pago del cliente | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | Pago recibido, pendiente preparación | `IN_PREPARATION`, `CANCELLED` |
| `IN_PREPARATION` | Preparando productos para despacho | `IN_TRANSIT`, `CANCELLED` |
| `IN_TRANSIT` | En camino al cliente | `DELIVERED`, `FAILED_DELIVERY` |
| `DELIVERED` | Entregado exitosamente | `COMPLETED`, `RETURN_REQUESTED` |
| `COMPLETED` | Venta completada sin issues | - |
| `CANCELLED` | Venta cancelada | - |
| `PENDING_MANUFACTURING` | Esperando fabricación de productos | `MANUFACTURING_IN_PROGRESS`, `CANCELLED` |
| `MANUFACTURING_IN_PROGRESS` | Productos en fabricación | `READY_FOR_DISPATCH`, `MANUFACTURING_DELAYED` |
| `MANUFACTURING_DELAYED` | Retraso en fabricación | `MANUFACTURING_IN_PROGRESS`, `CANCELLED` |
| `READY_FOR_DISPATCH` | Productos listos, creando despacho | `IN_PREPARATION` |
| `PARTIALLY_SHIPPED` | Algunos productos enviados | `PARTIALLY_SHIPPED`, `IN_TRANSIT` |
| `SCHEDULED` | Venta programada para fecha futura | `CONFIRMED`, `CANCELLED` |
| `FAILED_DELIVERY` | Fallo en entrega | `IN_TRANSIT`, `CANCELLED`, `RETURN_REQUESTED` |

---

## Priorización de Implementación

### Fase 1 - MVP (Mínimo Viable)
1. CU-001: Venta Web con Stock Disponible
2. CU-002: Venta Tienda Física
3. CU-007: Cancelación de Venta

### Fase 2 - Programación
4. CU-003: Venta con Despacho Programado
5. CU-009: Reserva de Productos

### Fase 3 - Fabricación
6. CU-004: Venta con Productos en Fabricación
7. CU-006: Venta sin Stock - Fabricación Bajo Pedido

### Fase 4 - Complejidad
8. CU-005: Venta Mixta
9. CU-008: Entrega Parcial
10. CU-010: Stock Insuficiente con Opciones

---

## Consideraciones de Integración

### Timeouts y Reintentos
- Consultas a APIs: timeout 5 segundos
- Reintentos: máximo 3 con backoff exponencial
- Circuit breaker después de 5 fallos consecutivos

### Compensaciones
- Todas las operaciones de múltiples pasos deben tener compensación
- Implementar patrón Saga para transacciones distribuidas
- Logging detallado de compensaciones

### Idempotencia
- Todos los endpoints deben ser idempotentes
- Usar IDs de idempotencia en requests críticos
- Validar duplicados antes de procesar

---

## Métricas de Éxito

- **Tasa de Conversión**: % de carritos que se convierten en ventas
- **Tiempo Promedio de Compra**: Desde agregar al carrito hasta confirmar
- **Tasa de Cancelación**: % de ventas canceladas por estado
- **Precisión de Estimaciones**: % de entregas en fecha estimada ± 1 día
- **Satisfacción del Cliente**: NPS sobre experiencia de compra
- **Disponibilidad del Sistema**: Uptime de la API
- **Tiempo de Respuesta**: P95 de tiempo de respuesta de endpoints críticos
