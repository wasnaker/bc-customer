import { StaffService } from "./staff.service";

describe("StaffService account provisioning", () => {
  const branch = { id: "42" };
  const branchRepository = { findById: jest.fn() };
  const customerRepository = { findById: jest.fn() };
  const staffRepository = { create: jest.fn() };
  const regionValidation = { assertRegionPair: jest.fn() };
  const moduleOptions = {
    createLoginAccount: jest.fn(),
    deleteLoginAccount: jest.fn(),
  };

  let service: StaffService;

  beforeEach(() => {
    jest.clearAllMocks();
    branchRepository.findById.mockResolvedValue(branch);
    regionValidation.assertRegionPair.mockResolvedValue(undefined);
    moduleOptions.createLoginAccount.mockResolvedValue({ id: 202 });
    moduleOptions.deleteLoginAccount.mockResolvedValue(undefined);
    staffRepository.create.mockResolvedValue({ id: "100", userId: 202 });
    service = new StaffService(
      staffRepository as never,
      branchRepository as never,
      customerRepository as never,
      regionValidation as never,
      moduleOptions as never,
    );
  });

  it("creates a login account with the Customer role scoped to the selected branch", async () => {
    await service.create(
      "42",
      {
        name: "Siti Aminah",
        email: " SITI@example.com ",
        password: "secret123",
      } as never,
      12,
    );

    expect(moduleOptions.createLoginAccount).toHaveBeenCalledWith({
      email: " SITI@example.com ",
      password: "secret123",
      name: "Siti Aminah",
      roleKey: "customer",
      scopeType: "branch",
      scopeId: "42",
      assignedBy: 12,
    });
    expect(staffRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: "42",
        userId: 202,
        email: "siti@example.com",
      }),
    );
  });

  it("deletes the login account when the staff record cannot be saved", async () => {
    const failure = new Error("staff insert failed");
    staffRepository.create.mockRejectedValue(failure);

    await expect(
      service.create(
        "42",
        {
          name: "Siti Aminah",
          email: "siti@example.com",
          password: "secret123",
        } as never,
        12,
      ),
    ).rejects.toBe(failure);

    expect(moduleOptions.deleteLoginAccount).toHaveBeenCalledWith(202);
  });
});
