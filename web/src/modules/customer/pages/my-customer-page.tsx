"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useGetMyBranchService } from "../services/branch-api";
import { BranchOverviewTab } from "../components/branch-detail-tab";
import { BranchFormDialog } from "../components/branch-form-dialog";
import { useHeadOffice } from "../hooks/use-branches";
import { useMyCustomerScope } from "../hooks/use-customers";
import { Button } from "@/components/ui/button";
import PencilIcon from "lucide-react/dist/esm/icons/pencil";
import useAuth from "@/services/auth/use-auth";

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
