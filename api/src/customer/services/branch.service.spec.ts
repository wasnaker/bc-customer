import { BranchService } from "./branch.service";

describe("BranchService transactional account provisioning", () => {
  const branch = {
    id: "42",
    customerId: "7",
    name: "Branch Bandung",
    code: "BR-00042",
    isHeadOffice: false,
    isActive: true,
  };
  const manager = { transactionId: "tx-1" };
  const branchRepository = {
    reserveId: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const customerRepository = { findById: jest.fn() };
  const regionValidation = { assertRegionPair: jest.fn() };
  const staffRepository = { create: jest.fn() };
  const moduleOptions = {
    transaction: jest.fn(async (work: (manager: typeof manager) => Promise<unknown>) => work(manager)),
    recordBranchCreated: jest.fn().mockResolvedValue(undefined),
    recordBranchUpdated: jest.fn().mockResolvedValue(undefined),
    recordBranchDeleted: jest.fn().mockResolvedValue(undefined),
    createLoginAccount: jest.fn(),
    deleteLoginAccount: jest.fn(),
  };

  let service: BranchService;

  beforeEach(() => {
    jest.clearAllMocks();
    customerRepository.findById.mockResolvedValue({ id: "7" });
    regionValidation.assertRegionPair.mockResolvedValue(undefined);
    branchRepository.reserveId.mockResolvedValue("42");
    branchRepository.create.mockResolvedValue(branch);
    branchRepository.findById.mockResolvedValue(branch);
    branchRepository.update.mockResolvedValue({ ...branch, name: "Updated Branch" });
    branchRepository.remove.mockResolvedValue(undefined);
    moduleOptions.createLoginAccount.mockResolvedValue({ id: 101 });
    moduleOptions.deleteLoginAccount.mockResolvedValue(undefined);
    staffRepository.create.mockResolvedValue({ id: "99" });
    moduleOptions.transaction.mockImplementation((work) => work(manager));
    service = new BranchService(
      branchRepository as never,
      customerRepository as never,
      regionValidation as never,
      staffRepository as never,
      moduleOptions as never,
    );
  });

  it("creates Branch, scoped account, Staff and outbox event within one transaction", async () => {
    const result = await service.create(
      "7",
      {
        name: "Branch Bandung",
        addressLine: "Jl. Asia Afrika",
        provinceId: 11,
        cityId: 1101,
        adminName: "Budi Santoso",
        adminEmail: " BUDI@example.com ",
        adminPassword: "secret123",
      } as never,
      12,
    );

    expect(result).toBe(branch);
    expect(branchRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: "7", name: "Branch Bandung" }),
      manager,
      "42",
    );
    expect(branchRepository.reserveId).toHaveBeenCalledTimes(1);
    expect(moduleOptions.createLoginAccount).toHaveBeenCalledWith({
      email: " BUDI@example.com ",
      password: "secret123",
      name: "Budi Santoso",
      roleKey: "customer-branch-admin",
      scopeType: "branch",
      scopeId: "42",
      assignedBy: 12,
    });
    expect(staffRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: "42",
        name: "Budi Santoso",
        userId: 101,
        email: "budi@example.com",
      }),
      manager,
    );
    expect(moduleOptions.recordBranchCreated).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({
        entityId: "42",
        actorUserId: 12,
        data: expect.objectContaining({
          id: "42",
          customerId: "7",
          code: "BR-00042",
        }),
      }),
    );
  });

  it("rolls back Branch and Staff and compensates the account when Staff insert fails", async () => {
    const failure = new Error("staff insert failed");
    staffRepository.create.mockRejectedValue(failure);

    await expect(
      service.create(
        "7",
        {
          name: "Branch Bandung",
          addressLine: "Jl. Asia Afrika",
          provinceId: 11,
          cityId: 1101,
          adminName: "Budi Santoso",
          adminEmail: "budi@example.com",
          adminPassword: "secret123",
        } as never,
        12,
      ),
    ).rejects.toBe(failure);

    expect(moduleOptions.deleteLoginAccount).toHaveBeenCalledWith(101);
    expect(moduleOptions.recordBranchCreated).not.toHaveBeenCalled();
  });

  it("rolls back database work and compensates the account when outbox persistence fails", async () => {
    const failure = new Error("outbox insert failed");
    moduleOptions.recordBranchCreated.mockRejectedValue(failure);

    await expect(
      service.create(
        "7",
        {
          name: "Branch Bandung",
          addressLine: "Jl. Asia Afrika",
          provinceId: 11,
          cityId: 1101,
          adminName: "Budi Santoso",
          adminEmail: "budi@example.com",
          adminPassword: "secret123",
        } as never,
        12,
      ),
    ).rejects.toBe(failure);

    expect(moduleOptions.deleteLoginAccount).toHaveBeenCalledWith(101);
  });

  it("records branch updates in the same transaction as the repository update", async () => {
    const updated = { ...branch, name: "Updated Branch" };
    branchRepository.update.mockResolvedValue(updated);

    await expect(service.update("42", { name: "Updated Branch" } as never))
      .resolves.toBe(updated);

    expect(branchRepository.update).toHaveBeenCalledWith(
      "42",
      { name: "Updated Branch" },
      manager,
    );
    expect(moduleOptions.recordBranchUpdated).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({
        entityId: "42",
        data: expect.objectContaining({ name: "Updated Branch" }),
      }),
    );
  });

  it("records a pre-delete branch snapshot in the delete transaction", async () => {
    await expect(service.remove("42")).resolves.toBeUndefined();

    expect(branchRepository.remove).toHaveBeenCalledWith("42", manager);
    expect(moduleOptions.recordBranchDeleted).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({
        entityId: "42",
        data: expect.objectContaining({
          id: "42",
          customerId: "7",
          name: "Branch Bandung",
        }),
      }),
    );
  });

  it("reports incomplete compensation if the external account cannot be deleted", async () => {
    staffRepository.create.mockRejectedValue(new Error("staff insert failed"));
    moduleOptions.deleteLoginAccount.mockRejectedValue(
      new Error("account cleanup failed"),
    );

    await expect(
      service.create(
        "7",
        {
          name: "Branch Bandung",
          addressLine: "Jl. Asia Afrika",
          provinceId: 11,
          cityId: 1101,
          adminName: "Budi Santoso",
          adminEmail: "budi@example.com",
          adminPassword: "secret123",
        } as never,
        12,
      ),
    ).rejects.toBeInstanceOf(AggregateError);
  });
});
