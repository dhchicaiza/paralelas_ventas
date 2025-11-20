import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: 'Sales API',
      version: '1.0.0',
      description: 'API de Ventas - Portal de Ventas',
      documentation: '/api/v1/docs',
      health: '/api/v1/health',
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getReady() {
    // Check if application is ready to serve traffic
    // TODO: Add checks for database, redis, etc.
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        redis: 'ok',
      },
    };
  }

  getLive() {
    // Check if application is alive
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid,
    };
  }
}
