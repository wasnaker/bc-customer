"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/services/i18n/client";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useGetMyBranchService } from "../services/branch-api";

export function MyCustomerPage() {
  const { t } = useTranslation("module-customer");
  const getMyBranch = useGetMyBranchService();
  const {
    data: branch,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customer", "my-branch"],
    queryFn: async () => {
      const response = await getMyBranch();
      if (response.status === 404) return null;
      if (
        response.status !== HTTP_CODES_ENUM.OK ||
        !response.data
      ) {
        throw new Error(t("myCustomer.error"));
      }
      return response.data;
    },
  });

  return (
    <div className="page-content--narrow">
      <div className="page-content--body space-y-6">
        <div>
          <h1 className="page-title">{t("myCustomer.title")}</h1>
          <p className="page-subtitle">{t("myCustomer.subtitle")}</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("table.loading")}</p>
        ) : error ? (
          <p role="alert" className="text-sm text-destructive">
            {t("myCustomer.error")}
          </p>
        ) : !branch ? (
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              {t("myCustomer.noBranch")}
            </p>
          </div>
        ) : (
          <section className="rounded-lg border bg-card">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("myCustomer.branch")}
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
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${branch.isActive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                  {branch.isActive ? t("table.active") : t("table.inactive")}
                </span>
              </div>
            </div>

            <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">{t("table.code")}</dt>
                <dd className="mt-1 font-mono text-sm">{branch.code ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("table.name")}</dt>
                <dd className="mt-1 text-sm font-medium">{branch.name}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">{t("table.addressLine")}</dt>
                <dd className="mt-1 text-sm">{branch.addressLine}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("table.province")}</dt>
                <dd className="mt-1 text-sm">{branch.provinceId}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("table.city")}</dt>
                <dd className="mt-1 text-sm">{branch.cityId}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("form.field.postalCode")}</dt>
                <dd className="mt-1 text-sm">{branch.postalCode ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("form.field.vatNumber")}</dt>
                <dd className="mt-1 text-sm">{branch.vatNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("myCustomer.linkedStaff")}</dt>
                <dd className="mt-1 text-sm">{branch.staffName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("table.position")}</dt>
                <dd className="mt-1 text-sm">{branch.staffPosition ?? "—"}</dd>
              </div>
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}
