import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvinceEntity } from './infrastructure/persistence/relational/entities/province.entity';
import { RegencyEntity } from './infrastructure/persistence/relational/entities/regency.entity';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';
import { CustomerSeedService } from './database/customer-seed.service';
import { ProvinceRepository } from './infrastructure/persistence/province.repository';
import { RegencyRepository } from './infrastructure/persistence/regency.repository';
import { ProvincesRelationalRepository } from './infrastructure/persistence/relational/repositories/province.repository';
import { RegenciesRelationalRepository } from './infrastructure/persistence/relational/repositories/regency.repository';
import { CustomerAccessGuard } from './security/customer-access.guard';
import { CUSTOMER_MODULE_OPTIONS, CustomerModuleAsyncOptions } from './customer.options';
export { CUSTOMER_MODULE_OPTIONS } from './customer.options';
export type { CustomerModuleOptions, CustomerModuleAsyncOptions } from './customer.options';

@Module({
  imports: [TypeOrmModule.forFeature([ProvinceEntity, RegencyEntity])],
  providers: [
    CustomerService,
    CustomerSeedService,
    CustomerAccessGuard,
    { provide: ProvinceRepository, useClass: ProvincesRelationalRepository },
    { provide: RegencyRepository, useClass: RegenciesRelationalRepository },
  ],
  controllers: [CustomerController],
  exports: [CustomerService, CustomerSeedService],
})
export class CustomerModule {
  static registerAsync(options: CustomerModuleAsyncOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: CUSTOMER_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    };

    return {
      module: CustomerModule,
      imports: options.imports ?? [],
      providers: [optionsProvider],
    };
  }
}
