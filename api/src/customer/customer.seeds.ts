import { CustomerSeedService } from './database/customer-seed.service';

/** Seed providers owned by this module and executed by the host seed lifecycle. */
export const moduleSeedServices = [CustomerSeedService] as const;
