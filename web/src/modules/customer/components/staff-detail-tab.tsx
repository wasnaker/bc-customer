"use client";

import { useMemo } from "react";
import { useTranslation } from "@/services/i18n/client";
import { useProvinceOptions, useRegencyOptions } from "../hooks/use-region-ref";
import type { Staff } from "../types/customer";
import { StatusBadge } from "./customer-detail-tab";

/** Ringkasan staff — province/city opsional, nama dicari dari referensi region. */
export function StaffOverviewTab({ item }: { item: Staff }) {
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
        <dt className="text-muted-foreground">{t("form.field.position")}</dt>
        <dd className="font-medium text-foreground">{item.position ?? "—"}</dd>
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
        <dt className="text-muted-foreground">{t("form.field.phone")}</dt>
        <dd className="font-mono text-foreground">{item.phone ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.email")}</dt>
        <dd className="truncate text-foreground">{item.email ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.nip")}</dt>
        <dd className="font-mono text-foreground">{item.nip ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("table.userId")}</dt>
        <dd className="font-mono text-foreground">
          {item.userId != null ? item.userId : "—"}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.addressLine")}</dt>
        <dd className="text-foreground">{item.addressLine ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.province")}</dt>
        <dd className="text-foreground">
          {provinceName ?? (item.provinceId != null ? item.provinceId : "—")}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.city")}</dt>
        <dd className="text-foreground">
          {cityName ?? (item.cityId != null ? item.cityId : "—")}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("form.field.photoId")}</dt>
        <dd className="truncate font-mono text-xs text-foreground">
          {item.photoId ?? "—"}
        </dd>
      </div>
    </dl>
  );
}
