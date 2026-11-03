import type { DynamicModule } from '@nestjs/common';
import { CustomerModule } from './customer.module';
import { moduleManifest } from './customer.manifest';
import { moduleEntities } from './customer.entities';
import { moduleMigrations } from './database/migrations';
import { moduleSeedServices } from './customer.seeds';
import type { CustomerModuleAsyncOptions } from './customer.options';

/**
 * Standard backend module contract consumed by the host module runtime.
 * New modules should expose the same named export from their api/definition entry.
 */
export const moduleDefinition = {
  manifest: moduleManifest,
  registerAsync: (options: CustomerModuleAsyncOptions): DynamicModule =>
    CustomerModule.registerAsync(options),
  entities: moduleEntities,
  migrations: moduleMigrations,
  seedServices: moduleSeedServices,
};
