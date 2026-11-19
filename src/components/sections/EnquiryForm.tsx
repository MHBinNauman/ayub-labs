"use client";

import { Mail, MessageCircle } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { controlAria, controlClass, Field } from "@/components/ui/Field";
import {
  buildEnquiryMessage,
  ENQUIRY_FIELDS,
  ENQUIRY_PURPOSES,
  enquirySubject,
  MESSAGE_MAX,
  validateEnquiry,
  type EnquiryField,
  type EnquiryFields,
} from "@/lib/composers";
import { mailto, whatsapp } from "@/lib/links";
import { useHydrated } from "@/lib/use-hydrated";

const empty: EnquiryFields = { name: "", purpose: "", message: "" };

/**
 * General enquiry composer. Opens the visitor's own WhatsApp, or their email
 * client via "Prefer email?". No data is stored or sent anywhere else.
 */
export function EnquiryForm({
  whatsappNumber,
  email,
}: {
  whatsappNumber: string;
  email: string;
}) {
  const baseId = useId();
  const hydrated = useHydrated();
  const [fields, setFields] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<EnquiryField, string>>>(
    {},
  );
  const id = (field: EnquiryField) => `${baseId}-${field}`;

  function update(field: EnquiryField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    if (errors[field])
      setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateEnquiry(fields);
    setErrors(result.errors);
    if (!result.ok) {
      const first = ENQUIRY_FIELDS.find((field) => result.errors[field]);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    window.open(
      whatsapp(whatsappNumber, buildEnquiryMessage(fields)),
      "_blank",
      "noopener,noreferrer",
    );
  }

  // Rebuilt on every keystroke, so the plain link always carries the draft.
  const emailHref = mailto(
    email,
    enquirySubject(fields.purpose),
    fields.message.trim() || fields.name.trim()
      ? buildEnquiryMessage(fields)
      : undefined,
  );

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-label="General enquiry"
      data-hydrated={hydrated || undefined}
      className="grid gap-5 sm:grid-cols-2"
    >
      <Field id={id("name")} label="Your name" error={errors.name}>
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
      <Field id={id("purpose")} label="Purpose" error={errors.purpose}>
        <select
          id={id("purpose")}
          name="purpose"
          value={fields.purpose}
          onChange={(event) => update("purpose", event.target.value)}
          className={controlClass(Boolean(errors.purpose))}
          {...controlAria(id("purpose"), errors.purpose)}
        >
          <option value="">Choose one</option>
          {ENQUIRY_PURPOSES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field
        id={id("message")}
        label="Message"
        error={errors.message}
        className="sm:col-span-2"
      >
        <textarea
          id={id("message")}
          name="message"
          rows={5}
          maxLength={MESSAGE_MAX}
          value={fields.message}
          onChange={(event) => update("message", event.target.value)}
          className={controlClass(Boolean(errors.message), "py-3")}
          {...controlAria(id("message"), errors.message)}
        />
      </Field>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
        <Button
          type="submit"
          variant="whatsapp"
          size="lg"
          className="w-full sm:w-auto"
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          Send on WhatsApp
        </Button>
        <p className="text-sm text-muted">
          Prefer email?{" "}
          <a
            href={emailHref}
            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-blue"
          >
            <Mail aria-hidden="true" className="size-4" />
            Write to {email}
          </a>
        </p>
      </div>
    </form>
  );
}
