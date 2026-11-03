"use client";

import { useMemo } from "react";
import { useTranslation } from "@/services/i18n/client";
import { useProvinceOptions, useRegencyOptions } from "../hooks/use-region-ref";
import type { Branch } from "../types/customer";
import { StatusBadge } from "./customer-detail-tab";

/** Ringkasan branch — nama province/city dicari dari referensi region. */
export function BranchOverviewTab({ item }: { item: Branch }) {
  const { t } = useTranslation("module-customer");
  const { data: provinces } = useProvinceOptions();
  const { data: regencies } = useRegencyOptions(
    item.provinceId != null ? String(item.provinceId) : null,
  );

  const provinceName = useMemo(
    () =>
      provinces?.find((p) => String(p.id) === String(item.provinceId))?.name ??
      null,
    [provinces, item.provinceId],
  );
  const cityName = useMemo(
    () =>
      regencies?.find((r) => String(r.id) === String(item.cityId))?.name ??
      null,
    [regencies, item.cityId],
  );

  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-muted-foreground">{t("table.code")}</dt>
        <dd className="font-mono font-medium text-foreground">
          {item.code ?? "—"}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("table.isHeadOffice")}</dt>
        <dd>
          {item.isHeadOffice ? (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {t("branch.headOfficeBadge")}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.addressLine")}</dt>
        <dd className="text-foreground">{item.addressLine || "—"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.province")}</dt>
        <dd className="text-foreground">{provinceName ?? item.provinceId}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.city")}</dt>
        <dd className="text-foreground">{cityName ?? item.cityId}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.postalCode")}</dt>
        <dd className="font-mono text-foreground">{item.postalCode ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.nitkuNumber")}</dt>
        <dd className="font-mono text-foreground">{item.nitkuNumber ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("table.vatType")}</dt>
        <dd className="font-mono uppercase text-foreground">{item.vatType}</dd>
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
    </dl>
  );
}
