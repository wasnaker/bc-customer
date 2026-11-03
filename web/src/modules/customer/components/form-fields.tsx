"use client";

import { useTranslation } from "@/services/i18n/client";
import { Label } from "@/components/ui/label";
import { extractErrorKeys } from "../services/api-error";
import type { VatType } from "../types/customer";

const VAT_TYPES: VatType[] = ["npwp", "nitku"];

interface VatTypeRadiosProps {
  idPrefix: string;
  value: VatType;
  onChange: (value: VatType) => void;
  disabled?: boolean;
}

/** Radio NPWP / NITKU — native input radio agar tanpa import host baru. */
export function VatTypeRadios({
  idPrefix,
  value,
  onChange,
  disabled = false,
}: VatTypeRadiosProps) {
  const { t } = useTranslation("module-customer");

  return (
    <div className="space-y-1.5">
      <Label>{t("form.field.vatType")}</Label>
      <div
        role="radiogroup"
        aria-label={t("form.field.vatType")}
        className="flex items-center gap-5 pt-1"
      >
        {VAT_TYPES.map((type) => (
          <label
            key={type}
            htmlFor={`${idPrefix}-vat-${type}`}
            className="flex cursor-pointer items-center gap-2 text-sm font-normal"
          >
            <input
              id={`${idPrefix}-vat-${type}`}
              type="radio"
              name={`${idPrefix}-vatType`}
              value={type}
              checked={value === type}
              disabled={disabled}
              onChange={() => onChange(type)}
              className="size-4 accent-primary"
            />
            {type.toUpperCase()}
          </label>
        ))}
      </div>
    </div>
  );
}

interface FormErrorBannerProps {
  /** Error apa pun dari mutateAsync — key 422 diterjemahkan. */
  error: unknown;
}

/** Banner error umum di atas footer dialog — memetakan messageKey API ke i18n. */
export function FormErrorBanner({ error }: FormErrorBannerProps) {
  const { t } = useTranslation("module-customer");
  if (!error) return null;

  const keys = extractErrorKeys(error);
  const message =
    keys.length > 0
      ? Array.from(new Set(keys))
          .map((key) => t(`errors.${key}`))
          .join(" ")
      : error instanceof Error && error.message
        ? error.message
        : t("errors.unknown");

  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  );
}
