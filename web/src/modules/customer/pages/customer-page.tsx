"use client";

import { Suspense, useMemo, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import {
  useCustomersServerSide,
  useCustomer,
  useDeleteCustomer,
} from "../hooks/use-customers";
import { useMasterDetail } from "@/core/master-detail/use-master-detail";
import { SmallTable, type SmallTableColumn } from "@/components/small-table";
import { CustomerFormDialog } from "../components/customer-form-dialog";
import { CustomerOverviewTab } from "../components/customer-detail-tab";
import { Button } from "@/components/ui/button";
import PencilIcon from "lucide-react/dist/esm/icons/pencil";
import TrashIcon from "lucide-react/dist/esm/icons/trash";
import ArrowLeftIcon from "lucide-react/dist/esm/icons/arrow-left";
import ArrowRightIcon from "lucide-react/dist/esm/icons/arrow-right";
import Building2Icon from "lucide-react/dist/esm/icons/building-2";
import type { Customer } from "../types/customer";

function PageInner() {
  const { t } = useTranslation("module-customer");
  const { selectedId, showDetail, select, close, toggle, afterSave } =
    useMasterDetail({ invalidateKey: ["customer"] });
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);

  // Detail SELALU diambil dari endpoint detail, bukan dari baris list.
  // Id customer adalah string (bigint serialisasi) — jangan Number().
  const { data: selectedCustomer, isLoading: detailLoading } = useCustomer(
    selectedId != null ? String(selectedId) : null,
  );

  // ── Delete ──────────────────────────────────────────────────────────────
  const deleteMutation = useDeleteCustomer();

  async function handleDelete(id: Customer["id"]) {
    if (!window.confirm(t("confirm.delete.customer"))) return;
    await deleteMutation.mutateAsync({ id });
    if (String(selectedId) === String(id)) {
      close();
    }
  }

  // ── Table data (server-side: pagination, search, sort) ──────────────────
  const {
    data: customers,
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
  } = useCustomersServerSide();

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns: SmallTableColumn<Customer>[] = useMemo(
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
        render: (item) => <span className="font-medium">{item.name}</span>,
      },
      {
        key: "npwpNumber",
        label: t("table.npwpNumber"),
        render: (item) => (
          <span className="font-mono text-xs text-muted-foreground">
            {item.npwpNumber ?? "—"}
          </span>
        ),
      },
      {
        key: "nibNumber",
        label: t("table.nibNumber"),
        render: (item) => (
          <span className="font-mono text-xs text-muted-foreground">
            {item.nibNumber ?? "—"}
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
  function toolbar(item: Customer) {
    return (
      <div className="flex items-center gap-2">
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

  function renderHeader(item: Customer) {
    return (
      <div className="flex items-center gap-2">
        <Building2Icon className="size-4 text-primary" />
        <span>{item.name}</span>
        {item.code && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {item.code}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="page-content--wide">
      <div className="page-content--body">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="page-header--split">
          <div>
            <h1 className="page-title">{t("customer.title")}</h1>
            <p className="page-subtitle">{t("customer.subtitle")}</p>
          </div>
          <div className="page-header__actions">
            <Button
              onClick={() => {
                setEditItem(null);
                setFormOpen(true);
              }}
            >
              {t("customer.create")}
            </Button>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────── */}
        <SmallTable<Customer>
          items={customers}
          total={total}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("customer.search")}
          searchLabel={t("customer.searchLabel")}
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
          detailItem={selectedCustomer ?? null}
          detailLoading={detailLoading}
          tabs={[
            { slug: "overview", label: t("detail.overview"), position: 0 },
          ]}
          customTabBody={{
            overview: (item: Customer) => <CustomerOverviewTab item={item} />,
          }}
          emptyText={t("customer.empty")}
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
      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
        onSuccess={(savedId) => afterSave(savedId)}
      />
    </div>
  );
}

export function CustomerPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-muted-foreground">Loading…</div>}
    >
      <PageInner />
    </Suspense>
  );
}
