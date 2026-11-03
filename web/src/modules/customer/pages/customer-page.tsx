"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/services/i18n/client";
import { useProvincesServerSide, useProvince, useDeleteProvince } from "../hooks/use-customers";
import { useMasterDetail } from "@/core/master-detail/use-master-detail";
import { SmallTable, type SmallTableColumn, type DetailTab } from "@/components/small-table";
import { ProvinceFormDialog } from "../components/province-form-dialog";
import { ProvinceOverviewTab, ProvinceRegenciesTab } from "../components/province-detail-tab";
import { Button } from "@/components/ui/button";
import PencilIcon from "lucide-react/dist/esm/icons/pencil";
import TrashIcon from "lucide-react/dist/esm/icons/trash";
import ArrowLeftIcon from "lucide-react/dist/esm/icons/arrow-left";
import ArrowRightIcon from "lucide-react/dist/esm/icons/arrow-right";
import MapPinIcon from "lucide-react/dist/esm/icons/map-pin";
import { Suspense } from "react";
import type { Province } from "../types/customer";

function PageInner() {
  const { t } = useTranslation("module-customer");
  const qc = useQueryClient();

  // ── State master-detail (pola core: seleksi, panel, hash) ──────────────
  const {
    selectedId,
    showDetail,
    select,
    close,
    toggle,
    afterSave,
  } = useMasterDetail();
  const [refreshKey, setRefreshKey] = useState(0);

  // Detail SELALU diambil dari endpoint detail, bukan dari baris list.
  const detailId =
    selectedId != null && /^\d+$/.test(String(selectedId))
      ? Number(selectedId)
      : null;
  const { data: selectedProvince, isLoading: detailLoading } =
    useProvince(detailId);

  // ── Dialogs ────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Province | null>(null);

  function openCreateDialog() {
    setEditItem(null);
    setFormOpen(true);
  }

  function openEditDialog(item: Province) {
    setEditItem(item);
    setFormOpen(true);
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  const deleteMutation = useDeleteProvince();

  async function handleDelete(id: Province["id"]) {
    if (!window.confirm(t("confirm.delete.message"))) return;
    await deleteMutation.mutateAsync({ id });
    // Tutup panel bila yang dihapus adalah baris terpilih.
    if (String(selectedId) === String(id)) {
      close();
    }
    setRefreshKey((k) => k + 1);
  }

  // ── Table data ──────────────────────────────────────────────────────────
  // Server-side pagination: page & search sudah dihandle useTable
  const {
    data: provinces,
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
  } = useProvincesServerSide();

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns: SmallTableColumn<Province>[] = useMemo(
    () => [
      {
        key: "id",
        label: "#",
        primary: true,
        render: (item) => (
          <span className="font-mono text-muted-foreground">
            {String(item.id)}
          </span>
        ),
      },
      {
        key: "name",
        label: t("table.name"),
        primary: true,
        render: (item) => (
          <span className="font-medium">{item.name}</span>
        ),
      },
      {
        key: "isoCode",
        label: t("table.isoCode"),
        render: (item) => (
          <span className="font-mono text-muted-foreground">
            {item.isoCode ?? "—"}
          </span>
        ),
      },
      {
        key: "coordinates",
        label: t("table.coordinates"),
        sortable: false,
        render: (item) => {
          if (item.latitude == null || item.longitude == null) return "—";
          return (
            <span className="font-mono text-xs text-muted-foreground">
              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </span>
          );
        },
      },
    ],
    [t]
  );

  // ── Tabs ───────────────────────────────────────────────────────────────
  const tabs: DetailTab[] = useMemo(
    () => [
      {
        slug: "overview",
        label: t("detail.overview"),
        position: 0,
      },
      {
        slug: "regencies",
        label: t("detail.regencies"),
        position: 10,
      },
    ],
    [t]
  );

  // ── Custom tab bodies ──────────────────────────────────────────────────
  const customTabBody = useMemo(
    () => ({
      overview: (item: Province) => <ProvinceOverviewTab item={item} />,
      regencies: (item: Province) => <ProvinceRegenciesTab item={item} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey]
  );

  // ── Toolbar for detail panel ────────────────────────────────────────────
  function toolbar(item: Province) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          title={t("actions.edit")}
          onClick={() => openEditDialog(item)}
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

  function renderHeader(item: Province) {
    return (
      <div className="flex items-center gap-2">
        <MapPinIcon className="size-4 text-primary" />
        <span>{item.name}</span>
        {item.isoCode && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {item.isoCode}
          </span>
        )}
      </div>
    );
  }

  const tableEmptyText = t("table.empty");

  return (
    <div className="page-content--wide">
      <div className="page-content--body">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="page-header--split">
          <div>
            <h1 className="page-title">{t("title")}</h1>
            <p className="page-subtitle">{t("subtitle")}</p>
          </div>
          <div className="page-header__actions">
            <Button onClick={openCreateDialog}>
              {t("actions.create_province")}
            </Button>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────── */}
        <SmallTable<Province>
          items={provinces}
          total={total}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("table.search")}
          searchLabel={t("table.search_label")}
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
          detailItem={selectedProvince ?? null}
          detailLoading={detailLoading}
          tabs={tabs}
          customTabBody={customTabBody}
          emptyText={tableEmptyText}
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
              <Button
                variant="outline"
                size="sm"
                onClick={close}
              >
                {t("actions.collapse")}
              </Button>
            ) : undefined
          }
        />

        {/* Pagination controls (server-side) */}
        {/* Pagination now handled by SmallTable component */}
      </div>

      {/* ── Create / Edit dialog ──────────────────────────────────────── */}
      <ProvinceFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditItem(null);
        }}
        editItem={editItem}
        onSuccess={(savedId) => {
          qc.invalidateQueries({ queryKey: ["customer", "provinces"] });
          setRefreshKey((k) => k + 1);
          // Pola core: panel detail menampilkan data hasil simpan.
          afterSave(savedId);
        }}
      />
    </div>
  );
}

export function CustomerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading…</div>}>
      <PageInner />
    </Suspense>
  );
}