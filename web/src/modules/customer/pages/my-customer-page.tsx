"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useGetMyBranchService } from "../services/branch-api";
import { BranchOverviewTab } from "../components/branch-detail-tab";
import { BranchFormDialog } from "../components/branch-form-dialog";
import { useBranchesServerSide, useHeadOffice } from "../hooks/use-branches";
import { useMyCustomerScope } from "../hooks/use-customers";
import { Button } from "@/components/ui/button";
import PencilIcon from "lucide-react/dist/esm/icons/pencil";
import useAuth from "@/services/auth/use-auth";
import { useStaffServerSide } from "../hooks/use-staff";
import { StaffFormDialog } from "../components/staff-form-dialog";
import type { Staff } from "../types/customer";

export function MyCompanyTab() {
  const { t } = useTranslation("module-customer");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const getMyBranch = useGetMyBranchService();
  const { data: accessScope } = useMyCustomerScope();
  const [formOpen, setFormOpen] = useState(false);
  const {
    data: branch,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customer", "my-branch", user?.id ?? "anonymous"],
    queryFn: async () => {
      const response = await getMyBranch();
      if (response.status === HTTP_CODES_ENUM.NOT_FOUND) return null;
      if (response.status !== HTTP_CODES_ENUM.OK || !response.data) {
        throw new Error(t("myCompany.error"));
      }
      return response.data;
    },
    enabled: Boolean(user?.id),
  });
  const { data: headOffice } = useHeadOffice(branch?.customerId ?? null);
  const updateScope = accessScope?.permissions["update:branch"];
  const canEdit = Boolean(
    branch &&
      updateScope &&
      (updateScope.global ||
        updateScope.customerIds.includes(String(branch.customerId)) ||
        updateScope.branchIds.includes(String(branch.id))),
  );
  const canChangeHeadOffice = Boolean(
    updateScope?.global ||
      updateScope?.customerIds.includes(String(branch?.customerId)),
  );

  return (
    <div className="page-content--narrow">
      <div className="page-content--body space-y-6">
        <div>
          <h1 className="page-title">{t("myCompany.title")}</h1>
          <p className="page-subtitle">{t("myCompany.subtitle")}</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("table.loading")}</p>
        ) : error ? (
          <p role="alert" className="text-sm text-destructive">
            {t("myCompany.error")}
          </p>
        ) : !branch ? (
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              {t("myCompany.noBranch")}
            </p>
          </div>
        ) : (
          <section className="rounded-lg border bg-card">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("myCompany.branch")}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{branch.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {branch.customerName ?? "—"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {branch.isHeadOffice ? (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {t("branch.headOfficeBadge")}
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${branch.isActive
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground"}`}
                >
                  {branch.isActive ? t("table.active") : t("table.inactive")}
                </span>
                {canEdit ? (
                  <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
                    <PencilIcon className="mr-2 size-3.5" />
                    {t("actions.edit")}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <h3 className="text-sm font-semibold">
                  {t("myCompany.branchDetails")}
                </h3>
                <div className="mt-3">
                  <BranchOverviewTab item={branch} />
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold">
                  {t("myCompany.linkedStaff")}
                </h3>
                <p className="mt-1 text-sm">{branch.staffName}</p>
                <p className="text-sm text-muted-foreground">
                  {branch.staffPosition ?? "—"}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {branch && canEdit ? (
        <BranchFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          customerId={branch.customerId}
          editItem={branch}
          hasHeadOffice={Boolean(headOffice)}
          canChangeHeadOffice={canChangeHeadOffice}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["customer", "my-branch"] });
            queryClient.invalidateQueries({ queryKey: ["customer", "branches"] });
            queryClient.invalidateQueries({ queryKey: ["customer", "head-office"] });
          }}
        />
      ) : null}
    </div>
  );
}


/** Customer Admin's consolidated branch management inside Profile. */
export function MyBranchTab() {
  const { t } = useTranslation("module-customer");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const getMyBranch = useGetMyBranchService();
  const { data: accessScope } = useMyCustomerScope();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<import("../types/customer").Branch | null>(null);
  const {
    data: ownBranch,
    isLoading: ownBranchLoading,
    error: ownBranchError,
  } = useQuery({
    queryKey: ["customer", "my-branch", user?.id ?? "anonymous"],
    queryFn: async () => {
      const response = await getMyBranch();
      if (response.status === HTTP_CODES_ENUM.NOT_FOUND) return null;
      if (response.status !== HTTP_CODES_ENUM.OK || !response.data) {
        throw new Error(t("myCompany.error"));
      }
      return response.data;
    },
    enabled: Boolean(user?.id),
  });
  const customerId = ownBranch?.customerId ?? null;
  const table = useBranchesServerSide(customerId);
  const { data: headOffice } = useHeadOffice(customerId);
  const updateScope = accessScope?.permissions["update:branch"];
  const canEdit = (item: import("../types/customer").Branch) =>
    Boolean(
      updateScope &&
        (updateScope.global ||
          updateScope.customerIds.includes(String(item.customerId)) ||
          updateScope.branchIds.includes(String(item.id))),
    );
  const canChangeHeadOffice = Boolean(
    updateScope?.global ||
      (customerId != null &&
        updateScope?.customerIds.includes(String(customerId))),
  );

  if (ownBranchLoading) {
    return <p className="text-sm text-muted-foreground">{t("table.loading")}</p>;
  }
  if (ownBranchError || !ownBranch || !customerId) {
    return <p role="alert" className="text-sm text-destructive">{t("myBranch.error")}</p>;
  }

  return (
    <div className="page-content--wide">
      <div className="page-content--body space-y-4">
        <div>
          <h1 className="page-title">{t("myBranch.title")}</h1>
          <p className="page-subtitle">{t("myBranch.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            aria-label={t("branch.searchLabel")}
            value={table.search}
            onChange={(event) => {
              table.setSearch(event.target.value);
              table.setPage(1);
            }}
            placeholder={t("branch.search")}
            className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm"
          />
          <span className="text-sm text-muted-foreground">{table.total} {t("myBranch.branchCount")}</span>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t("table.code")}</th>
                <th className="px-4 py-3 font-medium">{t("table.name")}</th>
                <th className="px-4 py-3 font-medium">{t("table.addressLine")}</th>
                <th className="px-4 py-3 font-medium">{t("table.isActive")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("actions.edit")}</th>
              </tr>
            </thead>
            <tbody>
              {table.isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{t("table.loading")}</td></tr>
              ) : table.error ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-destructive">{t("table.error")}</td></tr>
              ) : table.data.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{t("branch.empty")}</td></tr>
              ) : table.data.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{item.code ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">
                    {item.name}
                    {item.isHeadOffice ? <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{t("branch.headOfficeBadge")}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.addressLine}</td>
                  <td className="px-4 py-3">{item.isActive ? t("table.active") : t("table.inactive")}</td>
                  <td className="px-4 py-3 text-right">
                    {canEdit(item) ? (
                      <Button size="sm" variant="outline" onClick={() => { setEditItem(item); setFormOpen(true); }}>
                        <PencilIcon className="mr-2 size-3.5" />{t("actions.edit")}
                      </Button>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {table.total === 0 ? "0" : `${(table.page - 1) * table.limit + 1}–${Math.min(table.page * table.limit, table.total)}`} {t("table.of")} {table.total}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={table.page <= 1} onClick={() => table.setPage(table.page - 1)}>{t("actions.prev_page")}</Button>
            <Button size="sm" variant="outline" disabled={table.page * table.limit >= table.total} onClick={() => table.setPage(table.page + 1)}>{t("actions.next_page")}</Button>
          </div>
        </div>
      </div>
      {editItem && canEdit(editItem) ? (
        <BranchFormDialog
          open={formOpen}
          onOpenChange={(open) => { setFormOpen(open); if (!open) setEditItem(null); }}
          customerId={customerId}
          editItem={editItem}
          hasHeadOffice={Boolean(headOffice)}
          canChangeHeadOffice={canChangeHeadOffice}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["customer", "branches"] });
            queryClient.invalidateQueries({ queryKey: ["customer", "head-office"] });
            queryClient.invalidateQueries({ queryKey: ["customer", "my-branch"] });
          }}
        />
      ) : null}
    </div>
  );
}


/** Staff records visible through the signed-in user's Profile permission + scope. */
export function MyStaffTab() {
  const { t } = useTranslation("module-customer");
  const queryClient = useQueryClient();
  const { data: accessScope } = useMyCustomerScope();
  const table = useStaffServerSide(null, null, true);
  const [editItem, setEditItem] = useState<Staff | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const updateScope = accessScope?.permissions["update:my-customer-staff"];
  const canEdit = (item: Staff) =>
    Boolean(
      updateScope &&
        (updateScope.global ||
          updateScope.customerIds.length > 0 ||
          updateScope.branchIds.includes(String(item.branchId))),
    );

  return (
    <div className="page-content--wide">
      <div className="page-content--body space-y-4">
        <div>
          <h1 className="page-title">{t("staff.title")}</h1>
          <p className="page-subtitle">{t("staff.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            aria-label={t("staff.searchLabel")}
            value={table.search}
            onChange={(event) => {
              table.setSearch(event.target.value);
              table.setPage(1);
            }}
            placeholder={t("staff.search")}
            className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm"
          />
          <span className="text-sm text-muted-foreground">
            {table.total} {t("staff.title")}
          </span>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t("table.name")}</th>
                <th className="px-4 py-3 font-medium">{t("table.position")}</th>
                <th className="px-4 py-3 font-medium">{t("table.branch")}</th>
                <th className="px-4 py-3 font-medium">{t("table.email")}</th>
                <th className="px-4 py-3 font-medium">{t("table.isActive")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("actions.edit")}</th>
              </tr>
            </thead>
            <tbody>
              {table.isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("table.loading")}</td></tr>
              ) : table.error ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-destructive">{t("table.error")}</td></tr>
              ) : table.data.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("staff.empty")}</td></tr>
              ) : table.data.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.position ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.branchName ?? item.branchId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.email ?? "—"}</td>
                  <td className="px-4 py-3">{item.isActive ? t("table.active") : t("table.inactive")}</td>
                  <td className="px-4 py-3 text-right">
                    {canEdit(item) ? (
                      <Button size="sm" variant="outline" onClick={() => { setEditItem(item); setFormOpen(true); }}>
                        <PencilIcon className="mr-2 size-3.5" />{t("actions.edit")}
                      </Button>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {table.total === 0 ? "0" : `${(table.page - 1) * table.limit + 1}–${Math.min(table.page * table.limit, table.total)}`} {t("table.of")} {table.total}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={table.page <= 1} onClick={() => table.setPage(table.page - 1)}>{t("actions.prev_page")}</Button>
            <Button size="sm" variant="outline" disabled={table.page * table.limit >= table.total} onClick={() => table.setPage(table.page + 1)}>{t("actions.next_page")}</Button>
          </div>
        </div>
      </div>
      {editItem && canEdit(editItem) ? (
        <StaffFormDialog
          open={formOpen}
          onOpenChange={(open) => { setFormOpen(open); if (!open) setEditItem(null); }}
          branchId={editItem.branchId}
          editItem={editItem}
          profileMode
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["customer", "my-staff"] });
            queryClient.invalidateQueries({ queryKey: ["customer", "staff"] });
          }}
        />
      ) : null}
    </div>
  );
}
