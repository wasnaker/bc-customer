import { BranchService } from "./branch.service";

describe("BranchService account provisioning", () => {
  const branch = { id: "42", customerId: "7" };
  const branchRepository = {
    create: jest.fn(),
    remove: jest.fn(),
  };
  const customerRepository = { findById: jest.fn() };
  const regionValidation = { assertRegionPair: jest.fn() };
  const staffRepository = { create: jest.fn() };
  const moduleOptions = {
    createLoginAccount: jest.fn(),
    deleteLoginAccount: jest.fn(),
  };

  let service: BranchService;

  beforeEach(() => {
    jest.clearAllMocks();
    customerRepository.findById.mockResolvedValue({ id: "7" });
    regionValidation.assertRegionPair.mockResolvedValue(undefined);
    branchRepository.create.mockResolvedValue(branch);
    branchRepository.remove.mockResolvedValue(undefined);
    moduleOptions.createLoginAccount.mockResolvedValue({ id: 101 });
    moduleOptions.deleteLoginAccount.mockResolvedValue(undefined);
    staffRepository.create.mockResolvedValue({ id: "99" });
    service = new BranchService(
      branchRepository as never,
      customerRepository as never,
      regionValidation as never,
      staffRepository as never,
      moduleOptions as never,
    );
  });

  it("creates the branch, a scoped Customer Branch Admin account, and its staff record", async () => {
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
    );
  });

  it("removes the created account and branch if the branch-admin staff record fails", async () => {
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
    expect(branchRepository.remove).toHaveBeenCalledWith("42");
  });
  it("still removes the branch if deleting the provisioned account fails", async () => {
    const failure = new Error("staff insert failed");
    staffRepository.create.mockRejectedValue(failure);
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

    expect(branchRepository.remove).toHaveBeenCalledWith("42");
  });

});
