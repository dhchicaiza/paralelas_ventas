# Sales API - API de Ventas

API REST para el portal de ventas con integración a sistemas de inventarios y despachos.

## 🚀 Tecnologías

- **Runtime**: Node.js 20
- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5
- **Cache**: Redis 7
- **Queue**: Bull
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisitos

- Node.js >= 20
- npm >= 9
- Docker & Docker Compose (para desarrollo)

## 🛠️ Setup del Proyecto

### 1. Clonar y navegar al directorio

```bash
cd api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones.

### 4. Iniciar servicios con Docker

```bash
# Desde la raíz del proyecto
cd ..
docker-compose up -d postgres redis
```

### 5. Ejecutar migraciones de base de datos

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. (Opcional) Poblar base de datos con datos de prueba

```bash
npm run seed
```

## 🏃 Ejecutar la Aplicación

### Modo Desarrollo

```bash
npm run start:dev
```

La API estará disponible en: `http://localhost:3000`
Swagger docs: `http://localhost:3000/api/v1/docs`

### Modo Producción

```bash
npm run build
npm run start:prod
```

### Con Docker Compose (Todo el Stack)

```bash
# Desde la raíz del proyecto
cd ..
docker-compose up
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)
- API (puerto 3000)
- Worker (background jobs)
- pgAdmin (puerto 5050)
- Redis Commander (puerto 8081)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📦 Estructura del Proyecto

```
api/
├── prisma/
│   └── schema.prisma          # Schema de base de datos
├── src/
│   ├── common/                # Utilidades compartidas
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── middleware/
│   │   ├── pipes/
│   │   └── utils/
│   ├── config/                # Configuraciones
│   ├── database/              # Configuración de base de datos
│   │   ├── migrations/
│   │   ├── seeders/
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   ├── modules/               # Módulos de la aplicación
│   │   ├── sales/             # Módulo de ventas
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   └── sales.module.ts
│   │   ├── integrations/      # Integraciones externas
│   │   │   ├── inventory/
│   │   │   ├── dispatch/
│   │   │   └── payment/
│   │   ├── saga/              # Saga orchestration
│   │   ├── webhooks/          # Webhooks handlers
│   │   └── workers/           # Background jobs
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts                # Punto de entrada
├── test/                      # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── Dockerfile
├── nest-cli.json
├── package.json
├── README.md
└── tsconfig.json
```

## 🔑 Endpoints Principales

### Health Checks
- `GET /api/v1` - Información de la API
- `GET /api/v1/health` - Health check
- `GET /api/v1/health/ready` - Readiness probe
- `GET /api/v1/health/live` - Liveness probe

### Sales
- `POST /api/v1/sales` - Crear venta
- `GET /api/v1/sales/:id` - Obtener venta por ID
- `GET /api/v1/sales` - Listar ventas
- `PUT /api/v1/sales/:id` - Actualizar venta
- `DELETE /api/v1/sales/:id` - Cancelar venta

### Webhooks
- `POST /api/v1/webhooks/inventory` - Webhook de inventarios
- `POST /api/v1/webhooks/dispatch` - Webhook de despachos

Documentación completa: `http://localhost:3000/api/v1/docs`

## 🗄️ Base de Datos

### Prisma Studio

Para explorar la base de datos visualmente:

```bash
npx prisma studio
```

Abrirá en: `http://localhost:5555`

### pgAdmin

Si usas Docker Compose, pgAdmin está disponible en:
- URL: `http://localhost:5050`
- Email: `admin@sales.com`
- Password: `admin`

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Reset de base de datos (desarrollo)
npx prisma migrate reset
```

## 🔄 Cache y Queues

### Redis Commander

Para inspeccionar Redis:
- URL: `http://localhost:8081`

### Gestión de Colas

Las colas de Bull se pueden monitorear desde la aplicación o usando Bull Board (a configurar).

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Inicia en modo desarrollo (watch)
npm run start:debug        # Inicia en modo debug

# Build
npm run build              # Compila TypeScript

# Producción
npm run start:prod         # Inicia versión compilada

# Database
npm run migration:generate # Genera migración de Prisma
npm run migration:run      # Aplica migraciones
npm run prisma:studio      # Abre Prisma Studio
npm run seed               # Pobla base de datos

# Calidad de código
npm run lint               # Ejecuta ESLint
npm run format             # Formatea código con Prettier

# Testing
npm run test               # Tests unitarios
npm run test:watch         # Tests en modo watch
npm run test:cov           # Coverage
npm run test:e2e           # Tests end-to-end
```

## 🐛 Debugging

### Visual Studio Code

Configuración de launch.json:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register", "-r", "tsconfig-paths/register"],
      "args": ["${workspaceFolder}/src/main.ts"],
      "env": {
        "NODE_ENV": "development"
      },
      "sourceMaps": true,
      "cwd": "${workspaceFolder}",
      "protocol": "inspector"
    }
  ]
}
```

### Logs

Los logs se guardan en el directorio `logs/`:
- `error.log` - Solo errores
- `combined.log` - Todos los logs

## 🔐 Seguridad

- **Helmet**: Protección de headers HTTP
- **CORS**: Configurado según `.env`
- **Rate Limiting**: Throttler configurado
- **Validation**: Class-validator para DTOs
- **JWT**: Autenticación (a implementar)

## 🚢 Deploy

### Build para Producción

```bash
npm run build
```

### Docker Production Image

```bash
docker build -t sales-api:latest --target production .
docker run -p 3000:3000 --env-file .env sales-api:latest
```

## 📚 Recursos

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contribuir

1. Crear feature branch: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits: `git commit -am 'Agregar nueva funcionalidad'`
3. Push al branch: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Ver README principal del proyecto para información del equipo.
