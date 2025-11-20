# Flujos de Proceso - Portal de Ventas

## Versión: 1.0

---

## 1. Flujo: Venta con Stock Disponible (Escenario Ideal)

```
┌─────────┐
│ CLIENTE │
└────┬────┘
     │
     │ 1. Selecciona productos
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ 2. GET /availability
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── Stock: 50 unidades
└────┬─────────────┘
     │
     │ 3. Stock disponible: 50
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ 4. POST /reservations
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── Reserva: 2 unidades
└────┬─────────────┘
     │
     │ 5. Reserva confirmada (RES-001)
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Crea venta PENDING_PAYMENT
└────┬────────────┘
     │
     │ 6. Procesa pago
     ▼
┌──────────────────┐
│ SISTEMA DE PAGOS │
└────┬─────────────┘
     │
     │ 7. Pago confirmado
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Actualiza a CONFIRMED
└────┬────────────┘
     │
     │ 8. POST /dispatches
     ▼
┌──────────────────┐
│ API DESPACHOS    │◄──── Crea orden despacho
└────┬─────────────┘
     │
     │ 9. Despacho creado (DISP-001)
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Actualiza a IN_PREPARATION
└────┬────────────┘
     │
     │ 10. PUT /reservations/confirm
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── Confirma y descuenta stock
└────┬─────────────┘
     │
     │ 11. Stock actualizado: 48
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Notifica cliente
└────┬────────────┘
     │
     ▼
┌─────────┐
│ CLIENTE │◄──── Email: "Tu pedido está en camino"
└─────────┘

RESULTADO:
✅ Venta creada
✅ Stock reservado y descontado
✅ Despacho programado
✅ Cliente notificado
```

**Tiempo Total Estimado**: 10-15 segundos
**Estado Final**: `IN_PREPARATION`

---

## 2. Flujo: Venta con Productos en Fabricación

```
┌─────────┐
│ CLIENTE │
└────┬────┘
     │
     │ 1. Selecciona productos
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ 2. GET /availability
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── Stock: 0, En fabricación: 50
└────┬─────────────┘
     │
     │ 3. Response:
     │    {
     │      available_stock: 0,
     │      in_manufacturing: 50,
     │      estimated_date: "2025-12-01"
     │    }
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ 4. Muestra al cliente:
     │    "Producto en fabricación"
     │    "Disponible: 01-Dic-2025"
     ▼
┌─────────┐
│ CLIENTE │───→ Acepta esperar
└────┬────┘
     │
     │ 5. Confirma compra
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ 6. POST /manufacturing-reservations
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── Reserva en lote de producción
└────┬─────────────┘
     │
     │ 7. Reserva en batch BATCH-2025-12
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Crea venta PENDING_MANUFACTURING
└────┬────────────┘
     │
     │ 8. Cliente paga
     ▼
┌──────────────────┐
│ SISTEMA DE PAGOS │
└────┬─────────────┘
     │
     │ 9. Pago confirmado
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ CONFIRMED_PENDING_MANUFACTURING
└────┬────────────┘
     │
     │ 10. Notifica cliente
     ▼
┌─────────┐
│ CLIENTE │◄──── "Pedido confirmado, fabricación en curso"
└─────────┘
     │
     │ ... (días pasan) ...
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │───→ Webhook: "manufacturing.completed"
└────┬─────────────┘
     │
     │ 11. Event: Fabricación completada
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Actualiza a READY_FOR_DISPATCH
└────┬────────────┘
     │
     │ 12. POST /dispatches
     ▼
┌──────────────────┐
│ API DESPACHOS    │
└────┬─────────────┘
     │
     │ 13. Despacho creado
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Actualiza a IN_PREPARATION
└────┬────────────┘
     │
     │ 14. Notifica cliente
     ▼
┌─────────┐
│ CLIENTE │◄──── "Tu pedido está listo y en camino"
└─────────┘

RESULTADO:
✅ Venta vinculada a fabricación
✅ Cliente informado de tiempos
✅ Despacho automático al completar
```

**Tiempo Total Estimado**: 15-30 días (incluyendo fabricación)
**Estado Final**: `IN_PREPARATION` → `IN_TRANSIT` → `DELIVERED`

---

## 3. Flujo: Venta Mixta con Entregas Separadas

```
┌─────────┐
│ CLIENTE │───→ Carrito: [PROD-A (stock), PROD-B (fabricación)]
└────┬────┘
     │
     │ 1. Checkout
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ 2. GET /availability (batch)
     ▼
┌──────────────────┐
│ API INVENTARIOS  │
└────┬─────────────┘
     │
     │ 3. Response:
     │    PROD-A: disponible
     │    PROD-B: en fabricación (est: 15 días)
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ 4. Presenta opciones:
     │    [ ] Un solo envío (esperar todo)
     │    [✓] Envíos separados
     ▼
┌─────────┐
│ CLIENTE │───→ Selecciona "Envíos separados"
└────┬────┘
     │
     │ 5. Confirma
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Crea 2 sub-ventas:
│                 │      - SALE-001-A (PROD-A)
│                 │      - SALE-001-B (PROD-B)
└────┬────────────┘
     │
     ├─────────────────────┬─────────────────────┐
     │                     │                     │
     ▼                     ▼                     ▼
[FLUJO STOCK]        [ESPERA]         [FLUJO FABRICACIÓN]
     │                     │                     │
     │ Reserva PROD-A      │                     │ Reserva en batch
     │                     │                     │
     ▼                     │                     ▼
Despacho PROD-A            │            Espera fabricación
     │                     │                     │
     ▼                     │                     ▼
EN_TRÁNSITO               │            PENDING_MANUFACTURING
     │                     │                     │
     ▼                     │                     │
ENTREGADO                  │                     │
(Día 1)                    │                (Día 15)
     │                     │                     │
     │                     │                     ▼
     │                     │            Despacho PROD-B
     │                     │                     │
     │                     │                     ▼
     │                     │            EN_TRÁNSITO
     │                     │                     │
     │                     │                     ▼
     │                     │            ENTREGADO
     │                     │                (Día 16)
     │                     │                     │
     └─────────────────────┴─────────────────────┘
                           │
                           ▼
                  VENTA COMPLETADA

RESULTADO:
✅ Cliente recibe productos disponibles rápido
✅ Cliente informado de segunda entrega
✅ Seguimiento independiente de cada parte
```

**Tiempo Total**: Variable (depende de fabricación)
**Envíos**: 2 entregas separadas

---

## 4. Flujo: Cancelación de Venta (Con Compensación)

```
┌─────────┐
│ CLIENTE │───→ Solicita cancelar SALE-123
└────┬────┘
     │
     │ 1. DELETE /sales/SALE-123
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ 2. Valida estado: CONFIRMED
     │    ✅ Puede cancelarse
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Inicia Saga de Compensación
└────┬────────────┘
     │
     │ 3. Paso 1: Cancelar Despacho
     ▼
┌──────────────────┐
│ API DESPACHOS    │◄──── PUT /dispatches/{id}/cancel
└────┬─────────────┘
     │
     │ 4. Despacho cancelado ✅
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ 5. Paso 2: Liberar Inventario
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── PUT /reservations/{id}/release
└────┬─────────────┘
     │
     │ 6. Inventario liberado ✅
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ 7. Paso 3: Procesar Reembolso
     ▼
┌──────────────────┐
│ SISTEMA DE PAGOS │◄──── POST /refunds
└────┬─────────────┘
     │
     │ 8. Reembolso procesado ✅
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Actualiza estado a CANCELLED
└────┬────────────┘
     │
     │ 9. Notifica cliente
     ▼
┌─────────┐
│ CLIENTE │◄──── "Venta cancelada, reembolso procesado"
└─────────┘

RESULTADO:
✅ Venta cancelada
✅ Recursos liberados
✅ Reembolso emitido
```

**Manejo de Errores en Compensación**:

```
Escenario: Falla al liberar inventario

┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ PUT /reservations/release
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── ❌ ERROR 500
└────┬─────────────┘
     │
     │ Error: Timeout
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Reintento 1 (2s después)
└────┬────────────┘
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── ❌ ERROR 500
└────┬─────────────┘
     │
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Reintento 2 (4s después)
└────┬────────────┘
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── ❌ ERROR 500
└────┬─────────────┘
     │
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Marca como INCONSISTENT
│                 │───→ Crea ticket de soporte
│                 │───→ Alerta a equipo de operaciones
│                 │───→ Continúa con cancelación
└────┬────────────┘
     │
     ▼
┌─────────┐
│ CLIENTE │◄──── "Venta cancelada, procesando ajustes"
└─────────┘

⚠️  ACCIÓN MANUAL REQUERIDA:
    Equipo de ops debe reconciliar inventario
```

---

## 5. Flujo: Venta sin Stock - Solicitar Fabricación

```
┌─────────┐
│ CLIENTE │───→ Solicita producto PROD-X (cantidad: 100)
└────┬────┘
     │
     │ 1. GET /availability?product=PROD-X
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │
└────┬─────────────┘
     │
     │ Response:
     │ {
     │   available_stock: 0,
     │   in_manufacturing: 0,
     │   can_manufacture: true,
     │   lead_time_days: 20,
     │   min_quantity: 10
     │ }
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ Presenta al cliente:
     │ "No disponible"
     │ "Podemos fabricar en 20 días"
     │ "¿Desea ordenar?"
     ▼
┌─────────┐
│ CLIENTE │───→ Confirma orden anticipada
└────┬────┘
     │
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ POST /manufacturing-orders
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── Solicita iniciar fabricación
└────┬─────────────┘
     │
     │ Crea orden: MFG-001
     │ Estado: PENDING_START
     │ Fecha estimada: 2025-12-10
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Crea venta: PENDING_MANUFACTURING_START
└────┬────────────┘
     │
     │ Cliente paga
     ▼
┌──────────────────┐
│ SISTEMA DE PAGOS │
└────┬─────────────┘
     │
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Actualiza: MANUFACTURING_IN_PROGRESS
└────┬────────────┘
     │
     │ Notifica cliente
     ▼
┌─────────┐
│ CLIENTE │◄──── "Orden confirmada, iniciando fabricación"
└─────────┘
     │
     │ ... Días pasan ...
     │
     │ Webhook periódicos:
     ▼
┌──────────────────┐
│ API INVENTARIOS  │───→ "25% completado" (Día 5)
└──────────────────┘───→ "50% completado" (Día 10)
                   │───→ "75% completado" (Día 15)
                   │───→ "100% completado" (Día 20)
                   │
                   ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Cada actualización notifica cliente
└────┬────────────┘
     │
     │ Al completar:
     │ POST /dispatches
     ▼
┌──────────────────┐
│ API DESPACHOS    │
└────┬─────────────┘
     │
     ▼
[Continúa con flujo normal de despacho]

RESULTADO:
✅ Fabricación iniciada específicamente para este pedido
✅ Cliente informado del progreso
✅ Despacho automático al completar
```

---

## 6. Flujo: Manejo de Stock Insuficiente

```
┌─────────┐
│ CLIENTE │───→ Carrito: PROD-Y (cantidad: 100)
└────┬────┘
     │
     ▼
┌─────────────────┐
│ API DE VENTAS   │
└────┬────────────┘
     │
     │ GET /availability
     ▼
┌──────────────────┐
│ API INVENTARIOS  │
└────┬─────────────┘
     │
     │ Response:
     │ {
     │   available_stock: 60,
     │   in_manufacturing: 30,
     │   can_manufacture_more: true,
     │   additional_lead_time: 10 days
     │ }
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Calcula opciones
└────┬────────────┘
     │
     │ Presenta matriz de decisión:
     │
     │ ┌──────────────────────────────────────┐
     │ │ OPCIÓN A: Solo Disponible            │
     │ │ - 60 unidades                        │
     │ │ - Envío inmediato                    │
     │ │ - Descuento por menor cantidad       │
     │ └──────────────────────────────────────┘
     │
     │ ┌──────────────────────────────────────┐
     │ │ OPCIÓN B: Disponible + En Fabricación│
     │ │ - Parte 1: 60 unidades (inmediato)   │
     │ │ - Parte 2: 30 unidades (+7 días)     │
     │ │ - Opción envío único o separado      │
     │ └──────────────────────────────────────┘
     │
     │ ┌──────────────────────────────────────┐
     │ │ OPCIÓN C: Completar con Fabricación  │
     │ │ - Parte 1: 60 unidades (inmediato)   │
     │ │ - Parte 2: 30 unidades (+7 días)     │
     │ │ - Parte 3: 10 unidades (+17 días)    │
     │ └──────────────────────────────────────┘
     │
     │ ┌──────────────────────────────────────┐
     │ │ OPCIÓN D: Esperar Todo               │
     │ │ - 100 unidades                       │
     │ │ - Envío único (+17 días)             │
     │ │ - Sin cargos extras de envío         │
     │ └──────────────────────────────────────┘
     │
     ▼
┌─────────┐
│ CLIENTE │───→ Selecciona OPCIÓN B
└────┬────┘
     │
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Procesa como venta mixta
└─────────────────┘    (Ver Flujo 3)

RESULTADO:
✅ Cliente informado de todas las opciones
✅ Cliente toma decisión informada
✅ Sistema procesa según elección
```

---

## 7. Flujo: Actualización de Estado de Despacho (Webhook)

```
┌──────────────────┐
│ API DESPACHOS    │───→ Camión recoge paquete
└────┬─────────────┘
     │
     │ Estado cambia: PICKED_UP
     │
     │ Webhook POST
     ▼
┌─────────────────┐
│ API DE VENTAS   │◄──── /webhooks/dispatch
│                 │      {
│                 │        event: "status_changed",
│                 │        dispatch_id: "DISP-456",
│                 │        status: "PICKED_UP",
│                 │        timestamp: "..."
│                 │      }
└────┬────────────┘
     │
     │ 1. Valida firma del webhook
     │ 2. Verifica dispatch_id existe
     │ 3. Valida transición de estado
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Actualiza estado de venta
│                 │      SALE-123: IN_PREPARATION → IN_TRANSIT
└────┬────────────┘
     │
     │ 4. Registra en timeline
     │ 5. Trigger notificaciones
     ▼
┌─────────────────┐
│ NOTIFICACIONES  │───→ Email a cliente
└─────────────────┘───→ SMS (opcional)
                  │───→ Push notification (app móvil)
                  │
                  ▼
┌─────────┐
│ CLIENTE │◄──── "Tu pedido está en camino"
└─────────┘      "Tracking: TRK-ABC123"
                 "Entrega estimada: Mañana 10am"

SECUENCIA COMPLETA DE WEBHOOKS:

1. PICKED_UP
   → Cliente: "Recogido del almacén"

2. IN_TRANSIT
   → Cliente: "En camino a tu dirección"

3. OUT_FOR_DELIVERY
   → Cliente: "El repartidor está cerca"

4. DELIVERED
   → Cliente: "Entregado exitosamente"
   → Sistema: Venta → COMPLETED
   → Confirmar reserva de inventario

5. FAILED_DELIVERY (si aplica)
   → Cliente: "No pudimos entregar, intenta reagendar"
   → Sistema: Venta → FAILED_DELIVERY
   → Ofrecer opciones al cliente
```

---

## 8. Flujo: Circuit Breaker en Acción

```
ESCENARIO: API de Inventarios experimenta problemas

Estado: CLOSED (normal)
─────────────────────────

┌─────────────────┐
│ API DE VENTAS   │───→ GET /availability
└────┬────────────┘
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── ✅ Respuesta OK (500ms)
└──────────────────┘

[Fallo #1]
┌─────────────────┐
│ API DE VENTAS   │───→ GET /availability
└────┬────────────┘
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── ❌ ERROR 500
└──────────────────┘
Failures: 1/5

[Fallo #2-4]
... (similares)
Failures: 4/5

[Fallo #5]
┌─────────────────┐
│ API DE VENTAS   │───→ GET /availability
└────┬────────────┘
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── ❌ ERROR 500
└──────────────────┘
Failures: 5/5

⚡ CIRCUIT BREAKER ABRE ⚡

Estado: OPEN
────────────

┌─────────────────┐
│ API DE VENTAS   │───→ GET /availability
└────┬────────────┘
     │
     │ ⛔ Circuit breaker está OPEN
     │
     ▼
┌─────────────────┐
│ CACHE/FALLBACK  │◄──── Retorna datos en cache
└─────────────────┘      (pueden estar desactualizados)

┌─────────┐
│ CLIENTE │◄──── "Datos basados en última actualización"
└─────────┘      ⚠️  Warning: "Info puede no estar actualizada"

[Espera 30 segundos...]

Estado: HALF_OPEN
─────────────────

┌─────────────────┐
│ API DE VENTAS   │───→ GET /availability (probe request)
└────┬────────────┘
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── ✅ Respuesta OK
└──────────────────┘

⚡ CIRCUIT BREAKER CIERRA ⚡

Estado: CLOSED (normal restaurado)
──────────────────────────────────

RESULTADO:
✅ Sistema protegido de fallos en cascada
✅ Degradación gradual del servicio
✅ Recuperación automática
```

---

## 9. Flujo: Reserva con Expiración

```
┌─────────┐
│ CLIENTE │───→ Agrega productos al carrito
└────┬────┘
     │
     │ T+0: Inicio sesión
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ POST /reservations
└────┬────────────┘
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── Crea reserva temporal
│                  │      Expires: T+15min
└──────────────────┘
     │
     │ T+0: Reserva creada
     │ RES-001 (ACTIVE)
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Programa tarea de expiración
│                 │      Timer: 15 minutos
└─────────────────┘

[Cliente navegando, considerando compra...]

     │
     │ T+10min: Cliente aún decidiendo
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Envía notificación
└─────────────────┘
     │
     ▼
┌─────────┐
│ CLIENTE │◄──── "5 minutos para completar tu compra"
└─────────┘

ESCENARIO A: Cliente completa pago
───────────────────────────────────

     │ T+12min: Cliente paga
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ PUT /reservations/confirm
└────┬────────────┘
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── Reserva confirmada, stock descontado
└──────────────────┘
     │
     ▼
✅ Venta completada
Timer de expiración cancelado

ESCENARIO B: Cliente no completa pago
──────────────────────────────────────

     │ T+15min: Timer expira
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ PUT /reservations/release
└────┬────────────┘
     │
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── Libera reserva, stock disponible
└──────────────────┘
     │
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ Marca venta como EXPIRED
└─────────────────┘
     │
     ▼
┌─────────┐
│ CLIENTE │◄──── "Tu reserva expiró, productos liberados"
└─────────┘

ESCENARIO C: Cliente solicita extensión
────────────────────────────────────────

     │ T+14min: Cliente pide más tiempo
     ▼
┌─────────────────┐
│ API DE VENTAS   │───→ PUT /reservations/extend
└────┬────────────┘
     │
     │ Valida: ¿Primera extensión? ✅
     │ Máximo permitido: +10 minutos
     ▼
┌──────────────────┐
│ API INVENTARIOS  │◄──── Extiende hasta T+25min
└──────────────────┘
     │
     ▼
┌─────────┐
│ CLIENTE │◄──── "10 minutos adicionales concedidos"
└─────────┘
```

---

## 10. Matriz de Decisión de Flujos

| Escenario | Stock | Fabricación | Flujo a Seguir | Complejidad |
|-----------|-------|-------------|----------------|-------------|
| Stock disponible inmediato | ✅ Sí | - | Flujo 1 | Baja |
| Stock parcial | ⚠️ Parcial | - | Flujo 6 | Media |
| Sin stock, en fabricación | ❌ No | ✅ En curso | Flujo 2 | Media |
| Sin stock, puede fabricar | ❌ No | ⚠️ Posible | Flujo 5 | Alta |
| Mixto (algunos sí, otros no) | ⚠️ Mixto | ⚠️ Mixto | Flujo 3 | Alta |
| Cliente cancela | - | - | Flujo 4 | Media |
| Despacho programado | ✅ Sí | - | Flujo 1 + programación | Media |
| Entrega parcial | ⚠️ Mixto | ⚠️ Mixto | Flujo 3 | Alta |

---

## 11. Tiempos de Respuesta Objetivo (SLA)

| Operación | Tiempo Objetivo | Timeout | Reintento |
|-----------|----------------|---------|-----------|
| Consultar disponibilidad | < 500ms | 5s | 3x |
| Crear reserva | < 1s | 10s | 3x |
| Confirmar venta | < 2s | 15s | 3x |
| Crear despacho | < 2s | 10s | 3x |
| Solicitar fabricación | < 3s | 15s | 3x |
| Webhook procesado | < 100ms | 5s | 5x |
| Cancelar venta | < 3s | 20s | 3x |

---

## 12. Checklist de Validaciones

### Antes de Crear Venta
- [ ] Cliente autenticado
- [ ] Productos válidos
- [ ] Cantidades > 0
- [ ] Dirección de entrega válida
- [ ] Stock disponible o fabricable
- [ ] Método de pago válido

### Antes de Confirmar Pago
- [ ] Venta en estado correcto
- [ ] Reserva aún activa
- [ ] Pago procesado exitosamente
- [ ] Monto coincide con total

### Antes de Crear Despacho
- [ ] Venta confirmada
- [ ] Productos disponibles (o en camino)
- [ ] Dirección validada
- [ ] Ventana de entrega disponible

### Antes de Cancelar
- [ ] Venta existe
- [ ] Estado permite cancelación
- [ ] Despacho no está en tránsito
- [ ] Cliente autorizado

---

Este documento proporciona una guía visual y detallada de todos los flujos principales del sistema de ventas, mostrando las interacciones entre servicios y los escenarios de manejo de errores.
