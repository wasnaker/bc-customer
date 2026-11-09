import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomerAccessGuard } from './customer-access.guard';
import {
  CUSTOMER_SELF_BRANCH_METADATA,
} from './customer-resource.decorator';

describe('CustomerAccessGuard self-service Profile permission', () => {
  const authorize = jest.fn();
  const isModuleActive = jest.fn();
  const resolveScopes = jest.fn();
  const options = { authorize, isModuleActive, resolveScopes };
  const execute = async (
    metadata: boolean | string,
    user: Record<string, unknown>,
  ) => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) =>
        key === CUSTOMER_SELF_BRANCH_METADATA ? metadata : undefined,
      ),
    };
    const guard = new CustomerAccessGuard(
      options as never,
      reflector as unknown as Reflector,
    );
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => class TestController {},
    };
    return guard.canActivate(context as never);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    isModuleActive.mockResolvedValue(true);
    resolveScopes.mockResolvedValue({ global: false, scopes: [] });
  });

  it('denies all Customer routes while the module is inactive', async () => {
    isModuleActive.mockResolvedValue(false);
    await expect(
      execute(true, { id: 44, roles: [] }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(authorize).not.toHaveBeenCalled();
  });

  it('allows My Company only when one assigned role has its Profile permission', async () => {
    resolveScopes.mockResolvedValueOnce({
      global: false,
      scopes: [{ type: 'customer', id: '42' }],
    });

    await expect(
      execute('read:my-customer-company', {
        id: 44,
        roles: [{ id: 10 }, { id: 11 }],
      }),
    ).resolves.toBe(true);

    expect(resolveScopes).toHaveBeenCalledWith(44, 'read:my-customer-company');
    expect(authorize).not.toHaveBeenCalled();
  });

  it('denies My Company when no assigned role has the Profile permission', async () => {
    resolveScopes.mockResolvedValue({ global: false, scopes: [] });

    await expect(
      execute('read:my-customer-company', {
        id: 44,
        roles: [{ id: 10 }],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('keeps the self-scope UX endpoint authenticated without requiring a Profile tab permission', async () => {
    await expect(
      execute(true, { id: 44, roles: [] }),
    ).resolves.toBe(true);
    expect(authorize).not.toHaveBeenCalled();
  });
});
