# Configuración de Docker - Portal de Ventas

## Resumen de la Instalación

Se ha configurado exitosamente el proyecto para ejecutarse en Docker con todos sus servicios.

## Servicios Activos

### 1. PostgreSQL (Base de Datos)
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: postgres
- **Base de datos**: sales_db
- **Estado**: ✅ Funcionando

### 2. Redis (Cache y Colas)
- **Puerto**: 6379
- **Estado**: ✅ Funcionando

### 3. API de Ventas (NestJS)
- **Puerto**: 3000
- **URL**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Estado**: ✅ Funcionando

### 4. pgAdmin (Gestión de PostgreSQL)
- **Puerto**: 5050
- **URL**: http://localhost:5050
- **Email**: admin@sales.com
- **Contraseña**: admin
- **Estado**: ✅ Funcionando

### 5. Redis Commander (Gestión de Redis)
- **Puerto**: 8081
- **URL**: http://localhost:8081
- **Estado**: ✅ Funcionando

## Comandos Útiles

### Iniciar todos los servicios
```bash
./start-services.sh
```

### Ver estado de los contenedores
```bash
docker ps --filter "name=sales_"
```

### Ver logs de la API
```bash
docker logs -f sales_api
```

### Ver logs de PostgreSQL
```bash
docker logs -f sales_postgres
```

### Detener todos los servicios
```bash
docker stop sales_api sales_postgres sales_redis sales_pgadmin sales_redis_commander
```

### Eliminar todos los contenedores
```bash
docker rm sales_api sales_postgres sales_redis sales_pgadmin sales_redis_commander
```

### Reiniciar la API
```bash
docker restart sales_api
```

## Estructura del Proyecto

```
paralelas_ventas/
├── api/
│   ├── src/                    # Código fuente
│   ├── prisma/                 # Schema y migraciones de DB
│   ├── Dockerfile              # Configuración Docker
│   ├── .env                    # Variables de entorno
│   └── package.json            # Dependencias
├── docker-compose.yml          # Configuración de servicios (no usado)
└── start-services.sh           # Script de inicio manual
```

## Migraciones de Base de Datos

Las migraciones ya fueron aplicadas. La base de datos incluye:

- ✅ Enums: SaleChannel, SaleStatus, AvailabilityType, EventType, ReservationStatus, DispatchStatus
- ✅ Tabla: sales
- ✅ Tabla: sale_items
- ✅ Tabla: sale_events
- ✅ Tabla: reservations_snapshot
- ✅ Tabla: dispatches_snapshot
- ✅ Tabla: idempotency_keys
- ✅ Tabla: api_logs

## Endpoints Disponibles

### Swagger Documentation
- **GET** http://localhost:3000/api/v1/docs

### Ventas
- **POST** http://localhost:3000/api/v1/sales - Crear venta
- **GET** http://localhost:3000/api/v1/sales/:id - Obtener venta

### Webhooks
- **POST** http://localhost:3000/api/v1/webhooks/inventory - Webhook de inventarios
- **POST** http://localhost:3000/api/v1/webhooks/dispatch - Webhook de despachos

## Correcciones Realizadas

1. ✅ Instalado OpenSSL en la imagen Docker para Prisma
2. ✅ Corregido import de compression en main.ts
3. ✅ Corregido filtro de tipos en prisma.service.ts
4. ✅ Creadas migraciones de base de datos manualmente
5. ✅ Aplicadas migraciones en PostgreSQL
6. ✅ Configurado archivo .env desde .env.example

## Problemas Conocidos

### Warning de TypeScript (No crítico)
```
ERROR in ./src/main.ts:5:25
TS7016: Could not find a declaration file for module 'compression'.
```
**Solución**: Instalar `@types/compression` (opcional, la app funciona correctamente)

```bash
cd api
npm install --save-dev @types/compression
```

## Próximos Pasos

1. **Desarrollar endpoints faltantes**: La estructura está lista pero faltan implementaciones completas
2. **Integrar con APIs externas**: Configurar conexiones a API de Inventarios y Despachos
3. **Agregar tests**: Implementar tests unitarios y de integración
4. **Configurar CI/CD**: Setup de pipelines automáticos
5. **Monitoring**: Configurar Prometheus y Grafana

## Arquitectura

La API sigue el patrón de arquitectura de microservicios con:

- **NestJS**: Framework principal
- **Prisma ORM**: Para gestión de base de datos
- **Redis**: Para cache y colas de mensajes (Bull)
- **PostgreSQL**: Base de datos principal
- **Swagger**: Documentación automática de API

## Variables de Entorno Importantes

Ver [api/.env](api/.env) para la configuración completa. Las principales son:

- `DATABASE_URL`: Conexión a PostgreSQL
- `REDIS_HOST`: Host de Redis
- `INVENTORY_API_URL`: URL de API de Inventarios (mock)
- `DISPATCH_API_URL`: URL de API de Despachos (mock)
- `JWT_SECRET`: Secret para autenticación

## Soporte

Para problemas o preguntas:
1. Revisar logs: `docker logs sales_api`
2. Verificar conexiones de red: `docker network inspect sales-network`
3. Verificar base de datos: Acceder a pgAdmin en http://localhost:5050
