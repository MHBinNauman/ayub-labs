"use client";

import { MessageCircle } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { controlAria, controlClass, Field } from "@/components/ui/Field";
import {
  buildReportRequestMessage,
  REPORT_REQUEST_FIELDS,
  validateReportRequest,
  type ReportRequestField,
  type ReportRequestFields,
} from "@/lib/composers";
import { whatsapp } from "@/lib/links";
import { useHydrated } from "@/lib/use-hydrated";

export type ReportBranchOption = {
  id: string;
  name: string;
  /** WhatsApp number (digits) that receives requests for this branch. */
  whatsapp: string;
};

const empty: ReportRequestFields = {
  name: "",
  labNo: "",
  branchId: "",
  phone: "",
};

/**
 * "Request your report on WhatsApp". Validates in the browser, then opens
 * the visitor's own WhatsApp with a structured message. Nothing is stored,
 * put in the URL or sent anywhere else.
 */
export function ReportRequestForm({
  branches,
}: {
  branches: ReportBranchOption[];
}) {
  const baseId = useId();
  const hydrated = useHydrated();
  const [fields, setFields] = useState(empty);
  const [errors, setErrors] = useState<
    Partial<Record<ReportRequestField, string>>
  >({});
  const id = (field: ReportRequestField) => `${baseId}-${field}`;

  function update(field: ReportRequestField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    // Clear a field's error as soon as it is edited.
    if (errors[field])
      setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateReportRequest(
      fields,
      branches.map((branch) => branch.id),
    );
    setErrors(result.errors);
    if (!result.ok) {
      const first = REPORT_REQUEST_FIELDS.find((field) => result.errors[field]);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    const branch = branches.find((option) => option.id === fields.branchId)!;
    const message = buildReportRequestMessage({
      name: fields.name,
      labNo: fields.labNo,
      branchName: branch.name,
      phone: fields.phone,
    });
    window.open(
      whatsapp(branch.whatsapp, message),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-label="Request your report on WhatsApp"
      data-hydrated={hydrated || undefined}
      className="grid gap-5 sm:grid-cols-2"
    >
      <Field id={id("name")} label="Patient name" error={errors.name}>
        <input
          id={id("name")}
          name="name"
          autoComplete="name"
          value={fields.name}
          onChange={(event) => update("name", event.target.value)}
          className={controlClass(Boolean(errors.name))}
          {...controlAria(id("name"), errors.name)}
        />
      </Field>
      <Field
        id={id("labNo")}
        label="Receipt / Lab No."
        hint="Printed on the receipt you got when your sample was taken."
        error={errors.labNo}
      >
        <input
          id={id("labNo")}
          name="labNo"
          autoComplete="off"
          autoCapitalize="characters"
          value={fields.labNo}
          onChange={(event) => update("labNo", event.target.value)}
          className={controlClass(Boolean(errors.labNo))}
          {...controlAria(id("labNo"), errors.labNo, true)}
        />
      </Field>
      <Field id={id("branchId")} label="Branch" error={errors.branchId}>
        <select
          id={id("branchId")}
          name="branch"
          value={fields.branchId}
          onChange={(event) => update("branchId", event.target.value)}
          className={controlClass(Boolean(errors.branchId))}
          {...controlAria(id("branchId"), errors.branchId)}
        >
          <option value="">Choose a branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </Field>
      <Field id={id("phone")} label="Phone" error={errors.phone}>
        <input
          id={id("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0300-1234567"
          value={fields.phone}
          onChange={(event) => update("phone", event.target.value)}
          className={controlClass(Boolean(errors.phone))}
          {...controlAria(id("phone"), errors.phone)}
        />
      </Field>

      <div className="sm:col-span-2">
        <Button
          type="submit"
          variant="whatsapp"
          size="lg"
          className="w-full sm:w-auto"
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          Request on WhatsApp
        </Button>
        <p className="mt-3 text-sm text-muted">
          This opens WhatsApp with your request filled in. Nothing is sent until
          you press Send there, and this website keeps no copy.
        </p>
      </div>
    </form>
  );
}
