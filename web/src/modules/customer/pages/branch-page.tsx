"use client";

import { Suspense, useMemo, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import {
  useBranchesServerSide,
  useBranch,
  useDeleteBranch,
  useHeadOffice,
} from "../hooks/use-branches";
import {
  useCustomerOptionsFetcher,
  useMyCustomerScope,
} from "../hooks/use-customers";
import { useProvinceOptions } from "../hooks/use-region-ref";
import { useMasterDetail } from "@/core/master-detail/use-master-detail";
import { SmallTable, type SmallTableColumn } from "@/components/small-table";
import { BranchFormDialog } from "../components/branch-form-dialog";
import { BranchOverviewTab } from "../components/branch-detail-tab";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "../components/searchable-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PencilIcon from "lucide-react/dist/esm/icons/pencil";
import TrashIcon from "lucide-react/dist/esm/icons/trash";
import ArrowLeftIcon from "lucide-react/dist/esm/icons/arrow-left";
import ArrowRightIcon from "lucide-react/dist/esm/icons/arrow-right";
import GitBranchIcon from "lucide-react/dist/esm/icons/git-branch";
import type { Branch } from "../types/customer";

function PageInner() {
  const { t } = useTranslation("module-customer");
  const { data: accessScope } = useMyCustomerScope();

  const canManageBranch = (
    permission: string,
    item: Branch,
  ): boolean => {
    const scope = accessScope?.permissions[permission];
    return Boolean(
      scope &&
        (scope.global ||
          scope.customerIds.includes(String(item.customerId)) ||
          scope.branchIds.includes(String(item.id))),
    );
  };

  const canCreateBranch = (() => {
    const scope = accessScope?.permissions["create:branch"];
    return Boolean(
      scope &&
        (scope.global ||
          (customerId != null &&
            scope.customerIds.includes(String(customerId)))),
    );
  })();

  // ── Pemilih customer (master dari master-detail) ────────────────────────
  const [customer, setCustomer] = useState<SearchableSelectOption | null>(null);
  const customerId = customer?.value ?? null;
  const fetchCustomerOptions = useCustomerOptionsFetcher();

  const { selectedId, showDetail, select, close, toggle, afterSave } =
    useMasterDetail({ invalidateKey: ["customer"] });
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Branch | null>(null);

  // Nama province untuk tabel (≤ 40 baris, satu fetch).
  const { data: provinces } = useProvinceOptions();

  // Saat edit dari list global, gunakan customer milik branch yang diedit.
  const formCustomerId = editItem?.customerId ?? customerId;

  // Max-1-HO: cek apakah customer sudah punya kantor pusat.
  const { data: headOffice } = useHeadOffice(formCustomerId);

  // Detail SELALU diambil dari endpoint detail, bukan dari baris list.
  const { data: selectedBranch, isLoading: detailLoading } = useBranch(
    selectedId != null ? String(selectedId) : null,
  );

  // ── Delete ──────────────────────────────────────────────────────────────
  const deleteMutation = useDeleteBranch();

  async function handleDelete(id: Branch["id"]) {
    if (!window.confirm(t("confirm.delete.message"))) return;
    await deleteMutation.mutateAsync({ id });
    if (String(selectedId) === String(id)) {
      close();
    }
  }

  // ── Table data (server-side: pagination, search, sort) ──────────────────
  const {
    data: branches,
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
  } = useBranchesServerSide(customerId);

  // Ganti customer → reset state tabel (page/search milik useTable tidak
  // otomatis reset saat queryKey parent berubah).
  function handleCustomerChange(next: SearchableSelectOption | null) {
    setCustomer(next);
    setSearch("");
    setPage(1);
  }

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns: SmallTableColumn<Branch>[] = useMemo(
    () => [
      {
        key: "code",
        label: t("table.code"),
        primary: true,
        render: (item) => (
          <span className="font-mono text-muted-foreground">
            {item.code ?? "—"}
          </span>
        ),
      },
      {
        key: "name",
        label: t("table.name"),
        primary: true,
        render: (item) => (
          <span className="flex items-center gap-2">
            <span className="font-medium">{item.name}</span>
            {item.isHeadOffice && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {t("branch.headOfficeBadge")}
              </span>
            )}
          </span>
        ),
      },
      {
        key: "customerName",
        label: t("table.customer"),
        sortable: false,
        render: (item) => (
          <span className="text-muted-foreground">
            {item.customerName ?? item.customerId}
          </span>
        ),
      },
      {
        key: "adminName",
        label: t("table.admin"),
        sortable: false,
        render: (item) => (
          <span className="text-muted-foreground">{item.adminName ?? "—"}</span>
        ),
      },
      {
        key: "addressLine",
        label: t("table.addressLine"),
        sortable: false,
        render: (item) => (
          <span className="line-clamp-1 text-muted-foreground">
            {item.addressLine}
          </span>
        ),
      },
      {
        key: "provinceName",
        label: t("table.province"),
        sortable: false,
        render: (item) => (
          <span className="text-muted-foreground">
            {provinces?.find((p) => String(p.id) === String(item.provinceId))
              ?.name ?? item.provinceId}
          </span>
        ),
      },
      {
        key: "vatType",
        label: t("table.vatType"),
        render: (item) => (
          <span className="font-mono text-xs uppercase text-muted-foreground">
            {item.vatType}
          </span>
        ),
      },
    ],
    [t, provinces],
  );

  // ── Toolbar for detail panel ────────────────────────────────────────────
  function toolbar(item: Branch) {
    return (
      <div className="flex items-center gap-2">
        {canManageBranch("update:branch", item) ? (
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
        {canManageBranch("delete:branch", item) ? (
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

  function renderHeader(item: Branch) {
    return (
      <div className="flex items-center gap-2">
        <GitBranchIcon className="size-4 text-primary" />
        <span>{item.name}</span>
        {item.code && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {item.code}
          </span>
        )}
        {item.isHeadOffice && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            {t("branch.headOfficeBadge")}
          </span>
        )}
      </div>
    );
  }

  function openCreateDialog() {
    setEditItem(null);
    setFormOpen(true);
  }

  return (
    <div className="page-content--wide">
      <div className="page-content--body">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="page-header--split">
          <div>
            <h1 className="page-title">{t("branch.title")}</h1>
            <p className="page-subtitle">{t("branch.subtitle")}</p>
          </div>
          <div className="page-header__actions">
            {canCreateBranch ? (
              <Button onClick={openCreateDialog} disabled={!customerId}>
                {t("branch.create")}
              </Button>
            ) : null}
          </div>
        </div>

        {/* ── Filter customer (opsional — kosong = semua customer) ───── */}
        <div className="mb-4 max-w-md space-y-1.5">
          <Label htmlFor="branch-customer-picker">
            {t("branch.selectCustomer")}
          </Label>
          <div className="flex items-center gap-2">
            <SearchableSelect
              id="branch-customer-picker"
              ariaLabel={t("branch.selectCustomer")}
              value={customer}
              onSelect={handleCustomerChange}
              fetchOptions={fetchCustomerOptions}
              placeholder={t("branch.filterAllCustomers")}
              loadingText={t("picker.loading")}
              emptyText={t("picker.empty")}
              errorText={t("picker.error")}
              className="flex-1"
            />
            {customer && (
              <Button
                variant="outline"
                size="sm"
                title={t("branch.clearCustomerFilter")}
                onClick={() => handleCustomerChange(null)}
              >
                <TrashIcon className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* ── Table (selalu tampil; tanpa customer = list global) ────── */}
        <SmallTable<Branch>
          items={branches}
          total={total}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("branch.search")}
          searchLabel={t("branch.searchLabel")}
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
          detailItem={selectedBranch ?? null}
          detailLoading={detailLoading}
          tabs={[
            { slug: "overview", label: t("detail.overview"), position: 0 },
          ]}
          customTabBody={{
            overview: (item: Branch) => <BranchOverviewTab item={item} />,
          }}
          emptyText={t("branch.empty")}
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
      {formOpen && formCustomerId ? (
        <BranchFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          customerId={formCustomerId}
          editItem={editItem}
          hasHeadOffice={Boolean(headOffice)}
          onSuccess={(savedId) => afterSave(savedId)}
        />
      ) : null}
    </div>
  );
}

export function BranchPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-muted-foreground">Loading…</div>}
    >
      <PageInner />
    </Suspense>
  );
}
