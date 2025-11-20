import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
      errorFormat: 'pretty',
    });

    // @ts-ignore
    this.$on('warn', (e) => {
      this.logger.warn(e);
    });

    // @ts-ignore
    this.$on('error', (e) => {
      this.logger.error(e);
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async enableShutdownHooks(app: any) {
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter((key) => typeof key === 'string' && key[0] !== '_');

    return Promise.all(
      models.map((modelKey) => {
        // @ts-ignore
        if (this[modelKey] && typeof this[modelKey].deleteMany === 'function') {
          // @ts-ignore
          return this[modelKey].deleteMany();
        }
      }),
    );
  }
}
