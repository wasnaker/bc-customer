"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import {
  useStaffServerSide,
  useStaff,
  useDeleteStaff,
} from "../hooks/use-staff";
import { useCustomerOptionsFetcher } from "../hooks/use-customers";
import { useBranchesOptions, useBranch } from "../hooks/use-branches";
import { useMyCustomerScope } from "../hooks/use-customers";
import { useMasterDetail } from "@/core/master-detail/use-master-detail";
import { SmallTable, type SmallTableColumn } from "@/components/small-table";
import { StaffFormDialog } from "../components/staff-form-dialog";
import { StaffOverviewTab } from "../components/staff-detail-tab";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "../components/searchable-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PencilIcon from "lucide-react/dist/esm/icons/pencil";
import TrashIcon from "lucide-react/dist/esm/icons/trash";
import ArrowLeftIcon from "lucide-react/dist/esm/icons/arrow-left";
import ArrowRightIcon from "lucide-react/dist/esm/icons/arrow-right";
import UsersIcon from "lucide-react/dist/esm/icons/users";
import type { Staff } from "../types/customer";

function PageInner() {
  const { t } = useTranslation("module-customer");
  const { data: accessScope } = useMyCustomerScope();
  const readStaffScope = accessScope?.permissions["read:staff"];
  const allowedBranchIds = readStaffScope?.branchIds ?? [];
  const canSelectCustomer = Boolean(
    readStaffScope?.global || (readStaffScope?.customerIds.length ?? 0) > 0,
  );

  // ── Cascade: customer → branch ──────────────────────────────────────────
  const [customer, setCustomer] = useState<SearchableSelectOption | null>(null);
  const [branchId, setBranchId] = useState<string>("");
  const customerId = customer?.value ?? null;
  const fetchCustomerOptions = useCustomerOptionsFetcher();
  const { data: branchOptions } = useBranchesOptions(customerId);
  const { data: selectedBranch } = useBranch(branchId || null);

  useEffect(() => {
    if (
      branchId ||
      !readStaffScope ||
      readStaffScope.global ||
      readStaffScope.customerIds.length > 0
    ) {
      return;
    }
    if (allowedBranchIds.length === 1) {
      setBranchId(allowedBranchIds[0]);
    }
  }, [branchId, readStaffScope, allowedBranchIds]);

  const canManageStaff = (permission: string, item: Staff): boolean => {
    const scope = accessScope?.permissions[permission];
    return Boolean(
      scope &&
        (scope.global ||
          scope.branchIds.includes(String(item.branchId)) ||
          scope.customerIds.length > 0),
    );
  };

  const createStaffScope = accessScope?.permissions["create:staff"];
  const canCreateStaff = Boolean(
    createStaffScope &&
      (createStaffScope.global ||
        (branchId && createStaffScope.branchIds.includes(String(branchId))) ||
        (selectedBranch &&
          createStaffScope.customerIds.includes(
            String(selectedBranch.customerId),
          ))),
  );

  // Ganti customer → reset branch.
  function handleCustomerChange(next: SearchableSelectOption | null) {
    setCustomer(next);
    setBranchId("");
  }

  const { selectedId, showDetail, select, close, toggle, afterSave } =
    useMasterDetail({ invalidateKey: ["customer"] });
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Staff | null>(null);

  // Detail SELALU diambil dari endpoint detail, bukan dari baris list.
  const { data: selectedStaff, isLoading: detailLoading } = useStaff(
    selectedId != null ? String(selectedId) : null,
  );

  // ── Delete ──────────────────────────────────────────────────────────────
  const deleteMutation = useDeleteStaff();

  async function handleDelete(id: Staff["id"]) {
    if (!window.confirm(t("confirm.delete.message"))) return;
    await deleteMutation.mutateAsync({ id });
    if (String(selectedId) === String(id)) {
      close();
    }
  }

  // ── Table data (server-side: pagination, search, sort) ──────────────────
  const {
    data: staff,
    total,
    limit,
    isLoading,
    isFetching,
    error,
    page,
    setPage,
    search,
    setSearch,
    sort,
    setSort,
  } = useStaffServerSide(branchId || null, customerId);

  // Ganti customer/branch → reset state tabel (page/search milik useTable
  // tidak otomatis reset saat queryKey parent berubah).
  function handleBranchChange(next: string) {
    setBranchId(next === "__all__" ? "" : next);
    setSearch("");
    setPage(1);
  }

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns: SmallTableColumn<Staff>[] = useMemo(
    () => [
      {
        key: "name",
        label: t("table.name"),
        primary: true,
        render: (item) => <span className="font-medium">{item.name}</span>,
      },
      {
        key: "position",
        label: t("table.position"),
        render: (item) => (
          <span className="text-muted-foreground">{item.position ?? "—"}</span>
        ),
      },
      {
        key: "branchName",
        label: t("table.branch"),
        sortable: false,
        render: (item) => (
          <span className="line-clamp-1 text-muted-foreground">
            {item.branchName ?? item.branchId}
          </span>
        ),
      },
      {
        key: "customerName",
        label: t("table.customer"),
        sortable: false,
        render: (item) => (
          <span className="text-muted-foreground">
            {item.customerName ?? "—"}
          </span>
        ),
      },
      {
        key: "email",
        label: t("table.email"),
        render: (item) => (
          <span className="line-clamp-1 text-muted-foreground">
            {item.email ?? "—"}
          </span>
        ),
      },
      {
        key: "isActive",
        label: t("table.isActive"),
        render: (item) =>
          item.isActive ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {t("table.active")}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {t("table.inactive")}
            </span>
          ),
      },
    ],
    [t],
  );

  // ── Toolbar for detail panel ────────────────────────────────────────────
  function toolbar(item: Staff) {
    return (
      <div className="flex items-center gap-2">
        {canManageStaff("update:staff", item) ? (
          <Button
            variant="outline"
            size="icon-sm"
            title={t("actions.edit")}
          onClick={() => {
            setEditItem(item);
            setFormOpen(true);
          }}
          >
            <PencilIcon className="size-3.5" />
          </Button>
        ) : null}
        {canManageStaff("delete:staff", item) ? (
          <Button
            variant="outline"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10"
          title={t("actions.delete")}
          onClick={() => handleDelete(item.id)}
          disabled={deleteMutation.isPending}
          >
            <TrashIcon className="size-3.5" />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          title={showDetail ? t("actions.collapse") : t("actions.expand")}
          onClick={toggle}
        >
          {showDetail ? (
            <ArrowRightIcon className="size-3.5" />
          ) : (
            <ArrowLeftIcon className="size-3.5" />
          )}
        </Button>
      </div>
    );
  }

  function renderHeader(item: Staff) {
    return (
      <div className="flex items-center gap-2">
        <UsersIcon className="size-4 text-primary" />
        <span>{item.name}</span>
        {item.position && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {item.position}
          </span>
        )}
      </div>
    );
  }

  // Saat edit dari daftar global/semua cabang, ambil branchId dari staff.
  // Create tetap mensyaratkan cabang yang dipilih pada filter.
  const formBranchId = editItem?.branchId ?? branchId;
  const branchReady = Boolean(branchId);

  return (
    <div className="page-content--wide">
      <div className="page-content--body">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="page-header--split">
          <div>
            <h1 className="page-title">{t("staff.title")}</h1>
            <p className="page-subtitle">{t("staff.subtitle")}</p>
          </div>
          <div className="page-header__actions">
            {canCreateStaff ? (
              <Button
                onClick={() => {
                  setEditItem(null);
                  setFormOpen(true);
                }}
                disabled={!branchReady}
              >
                {t("staff.create")}
              </Button>
            ) : null}
          </div>
        </div>

        {/* ── Filter customer (opsional) + cabang ────────────────────── */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:max-w-2xl sm:grid-cols-2">
          {canSelectCustomer ? (
            <div className="space-y-1.5">
              <Label htmlFor="staff-customer-picker">
                {t("staff.selectCustomer")}
              </Label>
              <div className="flex items-center gap-2">
                <SearchableSelect
                  id="staff-customer-picker"
                  ariaLabel={t("staff.selectCustomer")}
                  value={customer}
                  onSelect={handleCustomerChange}
                  fetchOptions={fetchCustomerOptions}
                  placeholder={t("staff.filterAllCustomers")}
                  loadingText={t("picker.loading")}
                  emptyText={t("picker.empty")}
                  errorText={t("picker.error")}
                  className="flex-1"
                />
                {customer && (
                  <Button
                    variant="outline"
                    size="sm"
                    title={t("staff.clearCustomerFilter")}
                    onClick={() => handleCustomerChange(null)}
                  >
                    <TrashIcon className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="staff-branch-select">
              {t("staff.selectBranch")}
            </Label>
            <Select
              value={branchId || "__all__"}
              disabled={!customerId && allowedBranchIds.length === 0}
              onValueChange={handleBranchChange}
            >
              <SelectTrigger id="staff-branch-select">
                <SelectValue
                  placeholder={
                    !customerId
                      ? t("staff.selectBranchNeedCustomer")
                      : t("staff.selectBranchPlaceholder")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {canSelectCustomer ? (
                  <>
                    {/* Nilai "Semua cabang" — list tetap difilter scope di API. */}
                    <SelectItem value="__all__">
                      {t("staff.allBranches")}
                    </SelectItem>
                    {(branchOptions ?? []).map((branch) => (
                      <SelectItem key={String(branch.id)} value={String(branch.id)}>
                        {branch.name}
                        {branch.isHeadOffice
                          ? ` · ${t("branch.headOfficeBadge")}`
                          : ""}
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <>
                    {allowedBranchIds.length > 1 ? (
                      <SelectItem value="__all__">
                        {t("staff.allBranches")}
                      </SelectItem>
                    ) : null}
                    {allowedBranchIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {String(selectedBranch?.id) === id
                        ? selectedBranch?.name ?? id
                        : id}
                    </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Table (selalu tampil; tanpa branch = list global) ──────── */}
        <SmallTable<Staff>
          items={staff}
          total={total}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("staff.search")}
          searchLabel={t("staff.searchLabel")}
          page={page}
          onPageChange={setPage}
          perPage={limit}
          sort={sort}
          onSortChange={setSort}
          columns={columns}
          selectedId={selectedId}
          onSelectId={select}
          getItemId={(item) => item.id}
          showDetail={showDetail}
          detailItem={selectedStaff ?? null}
          detailLoading={detailLoading}
          tabs={[
            { slug: "overview", label: t("detail.overview"), position: 0 },
          ]}
          customTabBody={{
            overview: (item: Staff) => <StaffOverviewTab item={item} />,
          }}
          emptyText={t("staff.empty")}
          isLoading={isLoading}
          isFetching={isFetching}
          loadingText={t("table.loading")}
          error={error}
          errorText={t("table.error")}
          tabEmptyText={t("detail.empty")}
          paginationOfLabel={t("table.of")}
          previousPageLabel={t("actions.prev_page")}
          nextPageLabel={t("actions.next_page")}
          toolbar={toolbar}
          renderHeader={renderHeader}
          listHeader={
            showDetail ? (
              <Button variant="outline" size="sm" onClick={close}>
                {t("actions.collapse")}
              </Button>
            ) : undefined
          }
        />
      </div>

      {/* ── Create / Edit dialog ──────────────────────────────────────── */}
      {formOpen && formBranchId ? (
        <StaffFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          branchId={formBranchId}
          editItem={editItem}
          onSuccess={(savedId) => afterSave(savedId)}
        />
      ) : null}
    </div>
  );
}

export function StaffPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-muted-foreground">Loading…</div>}
    >
      <PageInner />
    </Suspense>
  );
}
