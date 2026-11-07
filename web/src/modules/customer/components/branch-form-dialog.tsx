"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import { FormDialogLayout } from "@/components/form/form-dialog-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateBranch, useUpdateBranch } from "../hooks/use-branches";
import { CustomerApiError } from "../services/api-error";
import { AddressFields, type AddressValue } from "./address-fields";
import { VatTypeRadios, FormErrorBanner } from "./form-fields";
import type { Branch, VatType } from "../types/customer";

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: Branch["customerId"];
  editItem?: Branch | null;
  /** True bila customer SUDAH punya kantor pusat lain (max 1 — API guard). */
  hasHeadOffice: boolean;
  /** Only customer-scope administrators may change the head-office marker. */
  canChangeHeadOffice?: boolean;
  onSuccess: (savedId: Branch["id"]) => void;
}

interface FormState {
  name: string;
  isHeadOffice: boolean;
  addressLine: string;
  address: AddressValue;
  postalCode: string;
  vatNumber: string;
  vatType: VatType;
  isActive: boolean;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPasswordConfirm: string;
}

interface FormErrors {
  name?: string;
  addressLine?: string;
  provinceId?: string;
  cityId?: string;
  isHeadOffice?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminPasswordConfirm?: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  isHeadOffice: false,
  addressLine: "",
  address: { provinceId: "", cityId: "" },
  postalCode: "",
  vatNumber: "",
  vatType: "npwp",
  isActive: true,
  adminName: "", adminEmail: "", adminPassword: "", adminPasswordConfirm: "",
};

export function BranchFormDialog({
  open,
  onOpenChange,
  customerId,
  editItem,
  hasHeadOffice,
  canChangeHeadOffice = true,
  onSuccess,
}: BranchFormDialogProps) {
  const { t } = useTranslation("module-customer");
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

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
              name: editItem.name ?? "",
              isHeadOffice: editItem.isHeadOffice,
              addressLine: editItem.addressLine ?? "",
              address: {
                provinceId:
                  editItem.provinceId != null
                    ? String(editItem.provinceId)
                    : "",
                cityId: editItem.cityId != null ? String(editItem.cityId) : "",
              },
              postalCode: editItem.postalCode ?? "",
              vatNumber: editItem.vatNumber ?? "",
              vatType: editItem.vatType ?? "npwp",
              isActive: editItem.isActive,
              adminName: "", adminEmail: "", adminPassword: "", adminPasswordConfirm: "",
            }
          : EMPTY_FORM,
      );
      setErrors({});
      setSubmitError(null);
    }
  }, [open, editItem]);

  // Aturan max 1 HO: toggle hanya aktif bila belum ada HO, atau bila branch
  // yang diedit adalah HO itu sendiri.
  const headOfficeToggleDisabled =
    !canChangeHeadOffice ||
    (hasHeadOffice && !isEditing) ||
    (isEditing && hasHeadOffice && !editItem?.isHeadOffice);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = t("form.validation.required");
    if (!form.addressLine.trim()) e.addressLine = t("form.validation.required");
    if (!form.address.provinceId) e.provinceId = t("form.validation.required");
    if (!form.address.cityId) e.cityId = t("form.validation.required");
    if (!isEditing) {
      if (!form.adminName.trim()) e.adminName = t("form.validation.required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail.trim())) e.adminEmail = t("form.validation.email");
      if (form.adminPassword.length < 6) e.adminPassword = t("form.validation.password");
      if (form.adminPassword !== form.adminPasswordConfirm) e.adminPasswordConfirm = t("form.validation.passwordMismatch");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      isHeadOffice: form.isHeadOffice,
      addressLine: form.addressLine.trim(),
      provinceId: Number(form.address.provinceId),
      cityId: Number(form.address.cityId),
      postalCode: form.postalCode.trim() || null,
      vatNumber: form.vatNumber.trim() || null,
      vatType: form.vatType,
      isActive: form.isActive,
      ...(!isEditing ? { adminName: form.adminName.trim(), adminEmail: form.adminEmail.trim().toLowerCase(), adminPassword: form.adminPassword } : {}),
    };

    try {
      if (isEditing && editItem) {
        const result = await updateMutation.mutateAsync({
          id: editItem.id,
          data: payload,
        });
        onOpenChange(false);
        onSuccess(result.id);
      } else {
        const result = await createMutation.mutateAsync({
          customerId,
          ...payload,
        });
        onOpenChange(false);
        onSuccess(result.id);
      }
    } catch (err) {
      if (err instanceof CustomerApiError) {
        const fieldErrors = err.errors;
        setErrors({
          name: fieldErrors.name,
          addressLine: fieldErrors.addressLine,
          provinceId: fieldErrors.provinceId,
          cityId: fieldErrors.cityId,
          isHeadOffice: fieldErrors.isHeadOffice,
          adminName: fieldErrors.adminName,
          adminEmail: fieldErrors.adminEmail,
          adminPassword: fieldErrors.adminPassword,
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
      title={isEditing ? t("branch.edit") : t("branch.create")}
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
        <Label htmlFor="branch-name">
          {t("form.field.branchName")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="branch-name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder={t("form.placeholder.branchName")}
          maxLength={190}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && (
          <p className="text-xs text-destructive">
            {t(`errors.${errors.name}`)}
          </p>
        )}
      </div>

      {!isEditing ? (
        <section className="space-y-3 rounded-md border p-4">
          <div><h3 className="text-sm font-semibold">{t("form.branchAdmin.title")}</h3><p className="text-xs text-muted-foreground">{t("form.branchAdmin.description")}</p></div>
          <div className="space-y-1.5">
            <Label htmlFor="branch-admin-name">{t("form.field.adminName")}</Label>
            <Input id="branch-admin-name" value={form.adminName} onChange={(e) => setField("adminName", e.target.value)} maxLength={190} />
            {errors.adminName ? <p className="text-xs text-destructive">{t("errors." + errors.adminName)}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="branch-admin-email">{t("form.field.email")}</Label>
            <Input id="branch-admin-email" type="email" value={form.adminEmail} onChange={(e) => setField("adminEmail", e.target.value)} maxLength={190} />
            {errors.adminEmail ? <p className="text-xs text-destructive">{t("errors." + errors.adminEmail)}</p> : null}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="branch-admin-password">{t("form.field.password")}</Label><Input id="branch-admin-password" type="password" value={form.adminPassword} onChange={(e) => setField("adminPassword", e.target.value)} />{errors.adminPassword ? <p className="text-xs text-destructive">{errors.adminPassword}</p> : null}</div>
            <div className="space-y-1.5"><Label htmlFor="branch-admin-password-confirm">{t("form.field.confirmPassword")}</Label><Input id="branch-admin-password-confirm" type="password" value={form.adminPasswordConfirm} onChange={(e) => setField("adminPasswordConfirm", e.target.value)} />{errors.adminPasswordConfirm ? <p className="text-xs text-destructive">{errors.adminPasswordConfirm}</p> : null}</div>
          </div>
        </section>
      ) : null}

      {/* isHeadOffice */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Checkbox
            id="branch-head-office"
            checked={form.isHeadOffice}
            disabled={headOfficeToggleDisabled}
            onCheckedChange={(v) => setField("isHeadOffice", Boolean(v))}
          />
          <Label
            htmlFor="branch-head-office"
            className="cursor-pointer text-sm font-normal"
          >
            {t("form.field.isHeadOffice")}
          </Label>
        </div>
        {canChangeHeadOffice &&
          headOfficeToggleDisabled &&
          !editItem?.isHeadOffice && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {t("branch.headOfficeTaken")}
          </p>
        )}
        {errors.isHeadOffice && (
          <p className="text-xs text-destructive">
            {t(`errors.${errors.isHeadOffice}`)}
          </p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="branch-address">
          {t("form.field.addressLine")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="branch-address"
          value={form.addressLine}
          onChange={(e) => setField("addressLine", e.target.value)}
          placeholder={t("form.placeholder.addressLine")}
          maxLength={255}
          aria-invalid={Boolean(errors.addressLine)}
        />
        {errors.addressLine && (
          <p className="text-xs text-destructive">
            {t(`errors.${errors.addressLine}`)}
          </p>
        )}
      </div>

      <AddressFields
        idPrefix="branch"
        value={form.address}
        onChange={(next) => setField("address", next)}
        errors={errors}
      />

      {/* Postal / NITKU */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="branch-postal">{t("form.field.postalCode")}</Label>
          <Input
            id="branch-postal"
            value={form.postalCode}
            onChange={(e) => setField("postalCode", e.target.value)}
            placeholder={t("form.placeholder.postalCode")}
            maxLength={10}
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="branch-vat">{t("form.field.vatNumber")}</Label>
          <Input
            id="branch-vat"
            value={form.vatNumber}
            onChange={(e) => setField("vatNumber", e.target.value)}
            placeholder={t("form.placeholder.vatNumber")}
            maxLength={24}
            className="font-mono"
          />
        </div>
      </div>

      <VatTypeRadios
        idPrefix="branch"
        value={form.vatType}
        onChange={(v) => setField("vatType", v)}
      />

      {/* isActive */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="branch-active"
          checked={form.isActive}
          onCheckedChange={(v) => setField("isActive", Boolean(v))}
        />
        <Label
          htmlFor="branch-active"
          className="cursor-pointer text-sm font-normal"
        >
          {t("form.field.isActive")}
        </Label>
      </div>
    </FormDialogLayout>
  );
}
