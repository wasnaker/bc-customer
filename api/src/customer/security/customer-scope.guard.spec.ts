import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomerScopeGuard } from './customer-scope.guard';
import { CUSTOMER_SCOPE_METADATA, CustomerScopeSource } from './customer-scope.decorator';
import { CUSTOMER_SELF_BRANCH_METADATA } from './customer-resource.decorator';

describe('CustomerScopeGuard', () => {
  const customers = { findCustomerById: jest.fn() };
  const branches = { findBranchById: jest.fn() };
  const staff = { findStaffById: jest.fn() };
  const documents = { findDocumentById: jest.fn() };
  const options = { authorizeScoped: jest.fn(), resolveScopes: jest.fn() };
  let guard: CustomerScopeGuard;

  const execute = async (
    source: CustomerScopeSource,
    request: Record<string, any>,
  ) => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) =>
        key === CUSTOMER_SCOPE_METADATA
          ? source
          : key === CUSTOMER_SELF_BRANCH_METADATA
            ? undefined
            : undefined,
      ),
    };
    guard = new CustomerScopeGuard(
      reflector as unknown as Reflector,
      customers as never,
      branches as never,
      staff as never,
      documents as never,
      options as never,
    );
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => jest.fn(),
      getClass: () => class TestController {},
    };
    return guard.canActivate(context as never);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    customers.findCustomerById.mockResolvedValue({ id: '17' });
    branches.findBranchById.mockResolvedValue({
      id: '43',
      customerId: '17',
      isHeadOffice: false,
    });
    staff.findStaffById.mockResolvedValue({ id: '90', branchId: '43' });
    options.authorizeScoped.mockResolvedValue(true);
    options.resolveScopes.mockResolvedValue({
      global: false,
      scopes: [{ type: 'branch', id: '43' }],
    });
  });

  it('resolves branch and ancestor customer from stored data', async () => {
    await expect(
      execute(
        { kind: 'branch-lookup', param: 'id' },
        {
          method: 'PATCH',
          params: { id: '43' },
          body: {},
          user: { id: 44 },
        },
      ),
    ).resolves.toBe(true);

    expect(options.authorizeScoped).toHaveBeenCalledWith(44, 'update:branch', {
      scopes: [
        { type: 'branch', id: '43' },
        { type: 'customer', id: '17' },
      ],
    });
  });

  it('fails closed when a controller route has no scope metadata', async () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => undefined),
    };
    guard = new CustomerScopeGuard(
      reflector as unknown as Reflector,
      customers as never,
      branches as never,
      staff as never,
      documents as never,
      options as never,
    );

    await expect(
      guard.canActivate({
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            user: { id: 44 },
          }),
        }),
        getHandler: () => jest.fn(),
        getClass: () => class TestController {},
      } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies when scoped authorization is unavailable', async () => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) =>
        key === CUSTOMER_SCOPE_METADATA
          ? { kind: 'branch-lookup', param: 'id' }
          : undefined,
      ),
    };
    guard = new CustomerScopeGuard(
      reflector as unknown as Reflector,
      customers as never,
      branches as never,
      staff as never,
      documents as never,
      {} as never,
    );

    await expect(
      guard.canActivate({
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'PATCH',
            params: { id: '43' },
            user: { id: 44 },
          }),
        }),
        getHandler: () => jest.fn(),
        getClass: () => class TestController {},
      } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('requires customer-level scope to change the head-office flag', async () => {
    options.authorizeScoped
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await expect(
      execute(
        { kind: 'branch-lookup', param: 'id' },
        {
          method: 'PATCH',
          params: { id: '43' },
          body: { isHeadOffice: true },
          user: { id: 44 },
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(options.authorizeScoped).toHaveBeenNthCalledWith(
      2,
      44,
      'update:branch',
      { scopes: [{ type: 'customer', id: '17' }] },
    );
  });

  it('delegates new customer creation with no pre-existing scope', async () => {
    await expect(
      execute(
        { kind: 'global-create' },
        {
          method: 'POST',
          body: {},
          user: { id: 39 },
        },
      ),
    ).resolves.toBe(true);

    expect(options.authorizeScoped).toHaveBeenCalledWith(
      39,
      'create:customer',
      { scopes: [] },
    );
  });

  it('filters list scopes through the host callback', async () => {
    const request = { method: 'GET', user: { id: 44 } };
    await expect(
      execute({ kind: 'branch-list' }, request),
    ).resolves.toBe(true);
    expect(request).toHaveProperty('customerAuthorizationScope', {
      global: false,
      customerIds: [],
      branchIds: ['43'],
    });
    expect(options.resolveScopes).toHaveBeenCalledWith(44, 'read:branch');
  });
});
