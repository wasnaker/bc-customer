"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import { FormDialogLayout } from "@/components/form/form-dialog-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateCustomer, useUpdateCustomer } from "../hooks/use-customers";
import { CustomerApiError } from "../services/api-error";
import { AddressFields, type AddressValue } from "./address-fields";
import { VatTypeRadios, FormErrorBanner } from "./form-fields";
import type { Customer, VatType } from "../types/customer";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Customer | null;
  onSuccess: (savedId: Customer["id"]) => void;
}

interface FormState {
  name: string;
  npwpNumber: string;
  nibNumber: string;
  isActive: boolean;
  // Head office (create-only — PATCH /customer tidak menyentuh kantor pusat).
  hoName: string;
  hoAddressLine: string;
  hoAddress: AddressValue;
  hoPostalCode: string;
  hoVatNumber: string;
  hoVatType: VatType;
}

interface FormErrors {
  name?: string;
  hoName?: string;
  hoAddressLine?: string;
  provinceId?: string;
  cityId?: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  npwpNumber: "",
  nibNumber: "",
  isActive: true,
  hoName: "",
  hoAddressLine: "",
  hoAddress: { provinceId: "", cityId: "" },
  hoPostalCode: "",
  hoVatNumber: "",
  hoVatType: "npwp",
};

export function CustomerFormDialog({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: CustomerFormDialogProps) {
  const { t } = useTranslation("module-customer");
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isEditing = Boolean(editItem);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<unknown>(null);

  useEffect(() => {
    if (open) {
      setForm(
        editItem
          ? {
              ...EMPTY_FORM,
              name: editItem.name ?? "",
              npwpNumber: editItem.npwpNumber ?? "",
              nibNumber: editItem.nibNumber ?? "",
              isActive: editItem.isActive,
            }
          : EMPTY_FORM,
      );
      setErrors({});
      setSubmitError(null);
    }
  }, [open, editItem]);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = t("form.validation.required");
    if (!isEditing) {
      if (!form.hoName.trim()) e.hoName = t("form.validation.required");
      if (!form.hoAddressLine.trim())
        e.hoAddressLine = t("form.validation.required");
      if (!form.hoAddress.provinceId)
        e.provinceId = t("form.validation.required");
      if (!form.hoAddress.cityId) e.cityId = t("form.validation.required");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    try {
      if (isEditing && editItem) {
        const result = await updateMutation.mutateAsync({
          id: editItem.id,
          data: {
            name: form.name.trim(),
            npwpNumber: form.npwpNumber.trim() || null,
            nibNumber: form.nibNumber.trim() || null,
            isActive: form.isActive,
          },
        });
        onOpenChange(false);
        onSuccess(result.id);
      } else {
        const result = await createMutation.mutateAsync({
          name: form.name.trim(),
          npwpNumber: form.npwpNumber.trim() || null,
          nibNumber: form.nibNumber.trim() || null,
          isActive: form.isActive,
          headOffice: {
            name: form.hoName.trim(),
            addressLine: form.hoAddressLine.trim(),
            provinceId: Number(form.hoAddress.provinceId),
            cityId: Number(form.hoAddress.cityId),
            postalCode: form.hoPostalCode.trim() || null,
            vatNumber: form.hoVatNumber.trim() || null,
            vatType: form.hoVatType,
          },
        });
        onOpenChange(false);
        onSuccess(result.id);
      }
    } catch (err) {
      if (err instanceof CustomerApiError) {
        const fieldErrors = err.errors;
        setErrors({
          name: fieldErrors.name,
          hoName: fieldErrors["headOffice.name"],
          hoAddressLine: fieldErrors["headOffice.addressLine"],
          provinceId: fieldErrors.provinceId,
          cityId: fieldErrors.cityId,
        });
      }
      setSubmitError(err);
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors])
      setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <FormDialogLayout
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? t("customer.edit") : t("customer.create")}
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
      <FormErrorBanner error={submitError} />

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="customer-name">
          {t("form.field.name")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="customer-name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder={t("form.placeholder.customerName")}
          maxLength={190}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && (
          <p className="text-xs text-destructive">
            {t(`errors.${errors.name}`)}
          </p>
        )}
      </div>

      {/* NPWP / NIB */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="customer-npwp">{t("form.field.npwpNumber")}</Label>
          <Input
            id="customer-npwp"
            value={form.npwpNumber}
            onChange={(e) => setField("npwpNumber", e.target.value)}
            placeholder={t("form.placeholder.npwpNumber")}
            maxLength={20}
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="customer-nib">{t("form.field.nibNumber")}</Label>
          <Input
            id="customer-nib"
            value={form.nibNumber}
            onChange={(e) => setField("nibNumber", e.target.value)}
            placeholder={t("form.placeholder.nibNumber")}
            maxLength={20}
            className="font-mono"
          />
        </div>
      </div>

      {/* isActive */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="customer-active"
          checked={form.isActive}
          onCheckedChange={(v) => setField("isActive", Boolean(v))}
        />
        <Label
          htmlFor="customer-active"
          className="cursor-pointer text-sm font-normal"
        >
          {t("form.field.isActive")}
        </Label>
      </div>

      {/* ── Head office (create-only) ─────────────────────────────────── */}
      {isEditing ? (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          {t("customer.headOfficeEditHint")}
        </p>
      ) : (
        <fieldset className="space-y-3 rounded-md border border-border p-4">
          <legend className="px-1 text-sm font-semibold text-foreground">
            {t("customer.headOfficeSection")}
          </legend>

          <div className="space-y-1.5">
            <Label htmlFor="customer-ho-name">
              {t("form.field.headOfficeName")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customer-ho-name"
              value={form.hoName}
              onChange={(e) => setField("hoName", e.target.value)}
              placeholder={t("form.placeholder.headOfficeName")}
              maxLength={190}
              aria-invalid={Boolean(errors.hoName)}
            />
            {errors.hoName && (
              <p className="text-xs text-destructive">
                {t(`errors.${errors.hoName}`)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer-ho-address">
              {t("form.field.addressLine")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customer-ho-address"
              value={form.hoAddressLine}
              onChange={(e) => setField("hoAddressLine", e.target.value)}
              placeholder={t("form.placeholder.addressLine")}
              maxLength={255}
              aria-invalid={Boolean(errors.hoAddressLine)}
            />
            {errors.hoAddressLine && (
              <p className="text-xs text-destructive">
                {t(`errors.${errors.hoAddressLine}`)}
              </p>
            )}
          </div>

          <AddressFields
            idPrefix="customer-ho"
            value={form.hoAddress}
            onChange={(next) => setField("hoAddress", next)}
            errors={errors}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer-ho-postal">
                {t("form.field.postalCode")}
              </Label>
              <Input
                id="customer-ho-postal"
                value={form.hoPostalCode}
                onChange={(e) => setField("hoPostalCode", e.target.value)}
                placeholder={t("form.placeholder.postalCode")}
                maxLength={10}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer-ho-vat">
                {t("form.field.vatNumber")}
              </Label>
              <Input
                id="customer-ho-vat"
                value={form.hoVatNumber}
                onChange={(e) => setField("hoVatNumber", e.target.value)}
                placeholder={t("form.placeholder.vatNumber")}
                maxLength={24}
                className="font-mono"
              />
            </div>
          </div>

          <VatTypeRadios
            idPrefix="customer-ho"
            value={form.hoVatType}
            onChange={(v) => setField("hoVatType", v)}
          />
        </fieldset>
      )}
    </FormDialogLayout>
  );
}
