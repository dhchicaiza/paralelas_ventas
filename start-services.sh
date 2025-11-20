#!/bin/bash

# Script para iniciar servicios sin docker-compose

echo "🚀 Iniciando servicios del Portal de Ventas..."

# Crear red
echo "📡 Creando red sales-network..."
docker network create sales-network 2>/dev/null || echo "Red ya existe"

# Crear volúmenes
echo "💾 Creando volúmenes..."
docker volume create postgres_data 2>/dev/null || echo "Volumen postgres_data ya existe"
docker volume create redis_data 2>/dev/null || echo "Volumen redis_data ya existe"
docker volume create pgadmin_data 2>/dev/null || echo "Volumen pgadmin_data ya existe"

# PostgreSQL
echo "🐘 Iniciando PostgreSQL..."
docker run -d \
  --name sales_postgres \
  --network sales-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sales_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15-alpine

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Redis
echo "🔴 Iniciando Redis..."
docker run -d \
  --name sales_redis \
  --network sales-network \
  -p 6379:6379 \
  -v redis_data:/data \
  --restart unless-stopped \
  redis:7-alpine redis-server --appendonly yes

# Esperar a que Redis esté listo
echo "⏳ Esperando a que Redis esté listo..."
sleep 5

# pgAdmin
echo "🔧 Iniciando pgAdmin..."
docker run -d \
  --name sales_pgadmin \
  --network sales-network \
  -e PGADMIN_DEFAULT_EMAIL=admin@sales.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  -e PGADMIN_LISTEN_PORT=80 \
  -p 5050:80 \
  -v pgadmin_data:/var/lib/pgadmin \
  --restart unless-stopped \
  dpage/pgadmin4:latest

# Redis Commander
echo "🎮 Iniciando Redis Commander..."
docker run -d \
  --name sales_redis_commander \
  --network sales-network \
  -e REDIS_HOSTS=local:sales_redis:6379 \
  -p 8081:8081 \
  --restart unless-stopped \
  rediscommander/redis-commander:latest

echo "✅ Servicios de infraestructura iniciados!"
echo ""
echo "📊 Servicios disponibles:"
echo "  - PostgreSQL:      localhost:5432 (user: postgres, pass: postgres)"
echo "  - Redis:           localhost:6379"
echo "  - pgAdmin:         http://localhost:5050 (email: admin@sales.com, pass: admin)"
echo "  - Redis Commander: http://localhost:8081"
echo ""
echo "⚠️  NOTA: La API y el Worker deben ejecutarse por separado después de instalar dependencias"
echo ""
echo "🔍 Para construir y ejecutar la API:"
echo "  cd api"
echo "  docker build -t sales-api ."
echo "  docker run -d --name sales_api --network sales-network -p 3000:3000 --env-file .env sales-api"
