"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import { FormDialogLayout } from "@/components/form/form-dialog-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProvince, useUpdateProvince } from "../hooks/use-customers";
import type { Province } from "../types/customer";

interface ProvinceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Province | null;
  onSuccess: (savedId: Province["id"]) => void;
}

interface FormState {
  name: string;
  isoCode: string;
  latitude: string;
  longitude: string;
}

interface FormErrors {
  name?: string;
  isoCode?: string;
  latitude?: string;
  longitude?: string;
}

export function ProvinceFormDialog({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: ProvinceFormDialogProps) {
  const { t } = useTranslation("module-customer");
  const createMutation = useCreateProvince();
  const updateMutation = useUpdateProvince();

  const isEditing = Boolean(editItem);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState<FormState>({
    name: "",
    isoCode: "",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when dialog opens / editItem changes
  useEffect(() => {
    if (open) {
      setForm({
        name: editItem?.name ?? "",
        isoCode: editItem?.isoCode ?? "",
        latitude: editItem?.latitude != null ? String(editItem.latitude) : "",
        longitude:
          editItem?.longitude != null ? String(editItem.longitude) : "",
      });
      setErrors({});
    }
  }, [open, editItem]);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = t("form.validation.required");
    if (form.latitude && isNaN(Number(form.latitude))) {
      e.latitude = t("form.validation.number");
    }
    if (form.longitude && isNaN(Number(form.longitude))) {
      e.longitude = t("form.validation.number");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      isoCode: form.isoCode.trim() || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    };

    let savedId: Province["id"] | undefined;
    if (isEditing && editItem) {
      const result = await updateMutation.mutateAsync({
        id: editItem.id,
        data: payload,
      });
      savedId = result.id;
    } else {
      const result = await createMutation.mutateAsync(payload);
      savedId = result.id;
    }

    onOpenChange(false);
    if (savedId != null) onSuccess(savedId);
  }

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <FormDialogLayout
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? t("actions.edit_province") : t("actions.create_province")}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t("actions.saving") : t("actions.save")}
          </Button>
        </>
      }
    >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="province-name">
              {t("form.field.name")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="province-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder={t("form.placeholder.name")}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* ISO Code */}
          <div className="space-y-1.5">
            <Label htmlFor="province-isoCode">{t("form.field.isoCode")}</Label>
            <Input
              id="province-isoCode"
              value={form.isoCode}
              onChange={(e) => setField("isoCode", e.target.value)}
              placeholder="e.g. 31"
              maxLength={10}
            />
          </div>

          {/* Coordinates row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="province-lat">{t("form.field.latitude")}</Label>
              <Input
                id="province-lat"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setField("latitude", e.target.value)}
                placeholder="-6.200000"
                aria-invalid={Boolean(errors.latitude)}
              />
              {errors.latitude && (
                <p className="text-xs text-destructive">{errors.latitude}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="province-lng">{t("form.field.longitude")}</Label>
              <Input
                id="province-lng"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setField("longitude", e.target.value)}
                placeholder="106.816666"
                aria-invalid={Boolean(errors.longitude)}
              />
              {errors.longitude && (
                <p className="text-xs text-destructive">{errors.longitude}</p>
              )}
            </div>
          </div>

    </FormDialogLayout>
  );
}