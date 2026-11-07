"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import { FormDialogLayout } from "@/components/form/form-dialog-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateStaff, useUpdateStaff } from "../hooks/use-staff";
import { CustomerApiError } from "../services/api-error";
import { AddressFields, type AddressValue } from "./address-fields";
import { FormErrorBanner } from "./form-fields";
import type { Staff } from "../types/customer";

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: Staff["branchId"];
  editItem?: Staff | null;
  onSuccess: (savedId: Staff["id"]) => void;
  profileMode?: boolean;
}

interface FormState {
  name: string;
  password: string;
  passwordConfirm: string;
  position: string;
  phone: string;
  email: string;
  nip: string;
  addressLine: string;
  address: AddressValue;
  photoId: string;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  provinceId?: string;
  cityId?: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  password: "",
  passwordConfirm: "",
  position: "",
  phone: "",
  email: "",
  nip: "",
  addressLine: "",
  address: { provinceId: "", cityId: "" },
  photoId: "",
  isActive: true,
};

export function StaffFormDialog({
  open,
  onOpenChange,
  branchId,
  editItem,
  onSuccess,
  profileMode = false,
}: StaffFormDialogProps) {
  const { t } = useTranslation("module-customer");
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff(profileMode);

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
              position: editItem.position ?? "",
              phone: editItem.phone ?? "",
              email: editItem.email ?? "",
              nip: editItem.nip ?? "",
              addressLine: editItem.addressLine ?? "",
              address: {
                provinceId:
                  editItem.provinceId != null
                    ? String(editItem.provinceId)
                    : "",
                cityId: editItem.cityId != null ? String(editItem.cityId) : "",
              },
              photoId: editItem.photoId ?? "",
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
    if (!isEditing && !form.email.trim()) e.email = t("form.validation.required");
    else if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = t("form.validation.email");
    if (!isEditing) {
      if (form.password.length < 6) e.password = t("form.validation.password");
      if (form.password !== form.passwordConfirm) e.passwordConfirm = t("form.validation.passwordMismatch");
    }
    // Provinsi dipilih → kota wajib (pasangan divalidasi API).
    if (form.address.provinceId && !form.address.cityId) {
      e.cityId = t("form.validation.required");
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
      position: form.position.trim() || null,
      phone: form.phone.trim() || null,
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      nip: form.nip.trim() || null,
      addressLine: form.addressLine.trim() || null,
      // Provinsi & kota opsional — hanya dikirim bila provinsi dipilih.
      provinceId: form.address.provinceId
        ? Number(form.address.provinceId)
        : null,
      cityId: form.address.cityId ? Number(form.address.cityId) : null,
      photoId: form.photoId.trim() || null,
      isActive: form.isActive,
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
          branchId,
          ...payload,
          email: form.email.trim(),
          password: form.password,
        });
        onOpenChange(false);
        onSuccess(result.id);
      }
    } catch (err) {
      if (err instanceof CustomerApiError) {
        const fieldErrors = err.errors;
        setErrors({
          name: fieldErrors.name,
          email: fieldErrors.email,
          password: fieldErrors.password,
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
      title={isEditing ? t("staff.edit") : t("staff.create")}
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
        <Label htmlFor="staff-name">
          {t("form.field.name")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="staff-name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder={t("form.placeholder.staffName")}
          maxLength={190}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && (
          <p className="text-xs text-destructive">
            {t(`errors.${errors.name}`)}
          </p>
        )}
      </div>

      {/* Position / Phone */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="staff-position">{t("form.field.position")}</Label>
          <Input
            id="staff-position"
            value={form.position}
            onChange={(e) => setField("position", e.target.value)}
            placeholder={t("form.placeholder.position")}
            maxLength={100}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="staff-phone">{t("form.field.phone")}</Label>
          <Input
            id="staff-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder={t("form.placeholder.phone")}
            maxLength={20}
            className="font-mono"
          />
        </div>
      </div>

      {/* Email / NIP */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="staff-email">{t("form.field.email")}</Label>
          <Input
            id="staff-email"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            disabled={isEditing}
            placeholder={t("form.placeholder.email")}
            maxLength={190}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p className="text-xs text-destructive">
              {t(`errors.${errors.email}`)}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="staff-nip">{t("form.field.nip")}</Label>
          <Input
            id="staff-nip"
            value={form.nip}
            onChange={(e) => setField("nip", e.target.value)}
            placeholder={t("form.placeholder.nip")}
            maxLength={50}
            className="font-mono"
          />
        </div>
      </div>

      <div className="space-y-1.5"><Label htmlFor="staff-photo-id">{t("form.field.photoId")}</Label><Input id="staff-photo-id" value={form.photoId} onChange={(e) => setField("photoId", e.target.value)} placeholder={t("form.placeholder.photoId")} className="font-mono" /></div>
      {!isEditing ? (
        <section className="space-y-3 rounded-md border p-4">
          <div><h3 className="text-sm font-semibold">{t("form.loginAccount.title")}</h3><p className="text-xs text-muted-foreground">{t("form.loginAccount.description")}</p></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="staff-password">{t("form.field.password")}</Label><Input id="staff-password" type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} />{errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}</div>
            <div className="space-y-1.5"><Label htmlFor="staff-password-confirm">{t("form.field.confirmPassword")}</Label><Input id="staff-password-confirm" type="password" value={form.passwordConfirm} onChange={(e) => setField("passwordConfirm", e.target.value)} />{errors.passwordConfirm ? <p className="text-xs text-destructive">{errors.passwordConfirm}</p> : null}</div>
          </div>
        </section>
      ) : null}

      {/* Address (optional) */}
      <div className="space-y-1.5">
        <Label htmlFor="staff-address">{t("form.field.addressLine")}</Label>
        <Input
          id="staff-address"
          value={form.addressLine}
          onChange={(e) => setField("addressLine", e.target.value)}
          placeholder={t("form.placeholder.addressLine")}
          maxLength={255}
        />
      </div>

      <AddressFields
        idPrefix="staff"
        value={form.address}
        onChange={(next) => setField("address", next)}
        errors={errors}
        optional
      />

      {/* isActive */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="staff-active"
          checked={form.isActive}
          onCheckedChange={(v) => setField("isActive", Boolean(v))}
        />
        <Label
          htmlFor="staff-active"
          className="cursor-pointer text-sm font-normal"
        >
          {t("form.field.isActive")}
        </Label>
      </div>
    </FormDialogLayout>
  );
}
