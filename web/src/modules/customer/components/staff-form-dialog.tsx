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
  userId: string;
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
  userId?: string;
  provinceId?: string;
  cityId?: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  userId: "",
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
              userId: editItem.userId != null ? String(editItem.userId) : "",
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
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = t("form.validation.email");
    }
    if (form.userId && !/^\d+$/.test(form.userId.trim())) {
      e.userId = t("form.validation.positiveInt");
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
      userId: form.userId.trim() ? Number(form.userId.trim()) : null,
      position: form.position.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
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
          userId: fieldErrors.userId,
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

      {/* Linked user */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="staff-user-id">{t("form.field.userId")}</Label>
          <Input
            id="staff-user-id"
            type="number"
            min={1}
            value={form.userId}
            onChange={(e) => setField("userId", e.target.value)}
            placeholder={t("form.placeholder.userId")}
            aria-invalid={Boolean(errors.userId)}
          />
          {errors.userId && (
            <p className="text-xs text-destructive">
              {t(`errors.${errors.userId}`)}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="staff-photo-id">{t("form.field.photoId")}</Label>
          <Input
            id="staff-photo-id"
            value={form.photoId}
            onChange={(e) => setField("photoId", e.target.value)}
            placeholder={t("form.placeholder.photoId")}
            className="font-mono"
          />
        </div>
      </div>

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
