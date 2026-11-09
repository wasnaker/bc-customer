import { DynamicModule, Module, Provider } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CustomerEntity } from "./infrastructure/persistence/relational/entities/customer.entity";
import { BranchEntity } from "./infrastructure/persistence/relational/entities/branch.entity";
import { StaffEntity } from "./infrastructure/persistence/relational/entities/staff.entity";
import { CustomerDocumentEntity } from "./infrastructure/persistence/relational/entities/customer-document.entity";
import { CustomerService } from "./services/customer.service";
import { BranchService } from "./services/branch.service";
import { StaffService } from "./services/staff.service";
import { CustomerDocumentService } from "./services/customer-document.service";
import { RegionValidationService } from "./services/region-validation.service";
import { CustomerController } from "./controllers/customer.controller";
import { CustomerRepository } from "./infrastructure/persistence/customer.repository";
import { BranchRepository } from "./infrastructure/persistence/branch.repository";
import { StaffRepository } from "./infrastructure/persistence/staff.repository";
import { CustomerDocumentRepository } from "./infrastructure/persistence/customer-document.repository";
import { CustomersRelationalRepository } from "./infrastructure/persistence/relational/repositories/customer.repository";
import { BranchesRelationalRepository } from "./infrastructure/persistence/relational/repositories/branch.repository";
import { StaffRelationalRepository } from "./infrastructure/persistence/relational/repositories/staff.repository";
import { CustomerDocumentsRelationalRepository } from "./infrastructure/persistence/relational/repositories/customer-document.repository";
import { CustomerAccessGuard } from "./security/customer-access.guard";
import { CustomerScopeGuard } from "./security/customer-scope.guard";
import { CustomerDemoDataSeedService } from "./database/seeds/demo-data/customer-demo-data.seed.service";
import { CustomerBranchDirectoryContract } from "./customer-branch-directory.contract";
import {
  CUSTOMER_MODULE_OPTIONS,
  CustomerModuleAsyncOptions,
} from "./customer.options";

export { CUSTOMER_MODULE_OPTIONS } from "./customer.options";
export type {
  CustomerModuleOptions,
  CustomerModuleAsyncOptions,
} from "./customer.options";

/**
 * Phase 4 (API layer) module: controllers, services and repositories on top
 * of the Phase 3 entities. Region is a hard dependency (`requires: ['region']`
 * in the manifest) — province/regency tables are NOT created or imported here;
 * region validation runs raw queries against those well-known tables.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerEntity,
      BranchEntity,
      StaffEntity,
      CustomerDocumentEntity,
    ]),
  ],
  providers: [
    CustomerService,
    BranchService,
    StaffService,
    CustomerDocumentService,
    RegionValidationService,
    CustomerAccessGuard,
    CustomerScopeGuard,
    CustomerDemoDataSeedService,
    CustomerBranchDirectoryContract,
    { provide: CustomerRepository, useClass: CustomersRelationalRepository },
    { provide: BranchRepository, useClass: BranchesRelationalRepository },
    { provide: StaffRepository, useClass: StaffRelationalRepository },
    {
      provide: CustomerDocumentRepository,
      useClass: CustomerDocumentsRelationalRepository,
    },
  ],
  controllers: [CustomerController],
  exports: [
    CustomerService,
    BranchService,
    StaffService,
    CustomerDocumentService,
    CustomerAccessGuard,
    CustomerScopeGuard,
    CustomerDemoDataSeedService,
  ],
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
