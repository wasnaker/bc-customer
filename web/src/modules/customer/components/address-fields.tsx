"use client";

import { useTranslation } from "@/services/i18n/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProvinceOptions, useRegencyOptions } from "../hooks/use-region-ref";

export interface AddressValue {
  provinceId: string;
  cityId: string;
}

interface AddressFieldsProps {
  idPrefix: string;
  value: AddressValue;
  onChange: (next: AddressValue) => void;
  errors?: { provinceId?: string; cityId?: string };
  /** Staff: province/city boleh kosong. */
  optional?: boolean;
  disabled?: boolean;
}

/**
 * Pilihan alamat bertingkat Province → Regency memakai endpoint referensi
 * modul region. Ganti provinsi me-reset kota agar pasangan selalu valid
 * (API menolak `cityNotInProvince`).
 */
export function AddressFields({
  idPrefix,
  value,
  onChange,
  errors,
  optional = false,
  disabled = false,
}: AddressFieldsProps) {
  const { t } = useTranslation("module-customer");
  const { data: provinces, isLoading: provincesLoading } = useProvinceOptions();
  const { data: regencies, isLoading: regenciesLoading } = useRegencyOptions(
    value.provinceId || null,
  );

  const requiredMark = optional ? null : (
    <span className="text-destructive">*</span>
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Province */}
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-province`}>
          {t("form.field.province")} {requiredMark}
        </Label>
        <Select
          value={value.provinceId || undefined}
          disabled={disabled}
          onValueChange={(v) => {
            // Kota wajib di-reset saat provinsi berubah.
            onChange({ provinceId: v, cityId: "" });
          }}
        >
          <SelectTrigger
            id={`${idPrefix}-province`}
            aria-invalid={Boolean(errors?.provinceId)}
          >
            <SelectValue
              placeholder={
                provincesLoading
                  ? t("picker.loading")
                  : t("form.placeholder.province")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(provinces ?? []).map((province) => (
              <SelectItem key={String(province.id)} value={String(province.id)}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.provinceId && (
          <p className="text-xs text-destructive">
            {t(`errors.${errors.provinceId}`)}
          </p>
        )}
      </div>

      {/* Regency / City */}
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-city`}>
          {t("form.field.city")} {requiredMark}
        </Label>
        <Select
          value={value.cityId || undefined}
          disabled={disabled || !value.provinceId}
          onValueChange={(v) => {
            onChange({ ...value, cityId: v });
          }}
        >
          <SelectTrigger
            id={`${idPrefix}-city`}
            aria-invalid={Boolean(errors?.cityId)}
          >
            <SelectValue
              placeholder={
                !value.provinceId
                  ? t("form.placeholder.cityNeedProvince")
                  : regenciesLoading
                    ? t("picker.loading")
                    : t("form.placeholder.city")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(regencies ?? []).map((regency) => (
              <SelectItem key={String(regency.id)} value={String(regency.id)}>
                {regency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.cityId && (
          <p className="text-xs text-destructive">
            {t(`errors.${errors.cityId}`)}
          </p>
        )}
      </div>
    </div>
  );
}
