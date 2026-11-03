"use client";

import { useTranslation } from "@/services/i18n/client";
import { useHeadOffice } from "../hooks/use-branches";
import type { Customer } from "../types/customer";

function StatusBadge({
  active,
  labelActive,
  labelInactive,
}: {
  active: boolean;
  labelActive: string;
  labelInactive: string;
}) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
      }
    >
      {active ? labelActive : labelInactive}
    </span>
  );
}

export { StatusBadge };

/**
 * Ringkasan customer + kantor pusatnya. Head office diambil via
 * `filters[isHeadOffice]=true` (GET /:id tidak menyertakan relasi).
 */
export function CustomerOverviewTab({ item }: { item: Customer }) {
  const { t } = useTranslation("module-customer");
  const { data: headOffice, isLoading: headOfficeLoading } = useHeadOffice(
    String(item.id),
  );

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("table.code")}</dt>
          <dd className="font-mono font-medium text-foreground">
            {item.code ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("table.isActive")}</dt>
          <dd>
            <StatusBadge
              active={item.isActive}
              labelActive={t("table.active")}
              labelInactive={t("table.inactive")}
            />
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("table.npwpNumber")}</dt>
          <dd className="font-mono text-foreground">
            {item.npwpNumber ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("table.nibNumber")}</dt>
          <dd className="font-mono text-foreground">{item.nibNumber ?? "—"}</dd>
        </div>
      </dl>

      {/* Head office */}
      <div className="rounded-md border border-border bg-muted/40 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("detail.headOffice")}
        </h3>
        {headOfficeLoading ? (
          <div className="space-y-2" aria-busy="true">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ) : headOffice ? (
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">
                {t("form.field.headOfficeName")}
              </dt>
              <dd className="font-medium text-foreground">{headOffice.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {t("form.field.addressLine")}
              </dt>
              <dd className="text-foreground">{headOffice.addressLine}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("table.vatType")}</dt>
              <dd className="font-mono uppercase text-foreground">
                {headOffice.vatType}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {t("form.field.postalCode")}
              </dt>
              <dd className="font-mono text-foreground">
                {headOffice.postalCode ?? "—"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("detail.headOfficeEmpty")}
          </p>
        )}
      </div>
    </div>
  );
}
