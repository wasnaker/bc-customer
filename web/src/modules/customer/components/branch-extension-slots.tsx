"use client";

import { useTranslation } from "@/services/i18n/client";
import { TableCell, TableHead } from "@/components/ui/table";
import type { ModuleExtensionProps } from "@/core/modules/types";
import type { Branch } from "../types/customer";

/** Adds the existing Branch active-state field through the host table slot. */
export function BranchStatusColumnExtension({ context }: ModuleExtensionProps) {
  const { t } = useTranslation("module-customer");
  if (context?.phase === "header") {
    return <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground">{t("table.isActive")}</TableHead>;
  }
  if (context?.phase !== "cell") return null;
  const item = context.item as Branch | undefined;
  if (!item) return <TableCell />;
  return (
    <TableCell className="px-4 py-3 text-sm">
      <span className={item.isActive ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>
        {item.isActive ? t("table.active") : t("table.inactive")}
      </span>
    </TableCell>
  );
}

/** Adds identifiers that are useful when diagnosing a selected Branch record. */
export function BranchDetailMetadataExtension({ context }: ModuleExtensionProps) {
  const { t } = useTranslation("module-customer");
  const item = context?.item as Branch | undefined;
  if (!item) return null;
  return (
    <section className="mt-4 grid grid-cols-1 gap-3 rounded-md border border-border p-3 text-sm sm:grid-cols-2">
      <div>
        <p className="text-xs text-muted-foreground">{t("table.code")}</p>
        <p className="font-mono">{item.code ?? "—"}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{t("table.customer")}</p>
        <p className="font-mono">{String(item.customerId)}</p>
      </div>
    </section>
  );
}

/** Clarifies the side effect of creating a Branch with its administrator. */
export function BranchCreateGuidanceExtension({ context }: ModuleExtensionProps) {
  const { t } = useTranslation("module-customer");
  if (context?.mode !== "create") return null;
  return (
    <aside className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
      {t("form.branchAdmin.description")}
    </aside>
  );
}

/** Displays the database-generated Branch code in edit mode without making it editable. */
export function BranchCodeFormExtension({ context }: ModuleExtensionProps) {
  const { t } = useTranslation("module-customer");
  if (context?.mode !== "edit" || !context.branchCode) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{t("table.code")}</p>
      <p className="rounded-md border border-input bg-muted px-3 py-2 font-mono text-sm">
        {String(context.branchCode)}
      </p>
    </div>
  );
}
