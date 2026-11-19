/**
 * Validation and message text for the WhatsApp / email composers on
 * /reports and /contact. Pure and free of site-data imports, so the client
 * islands can use it; facts (numbers, branch names) arrive as arguments.
 *
 * Nothing here sends anything. The composed text only leaves the browser
 * when the visitor opens it in their own WhatsApp or email client.
 */

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export type Validation<K extends string> = {
  ok: boolean;
  errors: FieldErrors<K>;
};

const NAME_MIN = 2;
const NAME_MAX = 80;
const LAB_NO_MAX = 30;
export const MESSAGE_MAX = 1000;

function checkName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return "Enter the patient's name.";
  if (name.length < NAME_MIN) return "The name looks too short.";
  if (name.length > NAME_MAX)
    return `Keep the name under ${NAME_MAX} characters.`;
  return undefined;
}

/** Spaces, dashes, dots and brackets are ignored: "0322-5135060" is fine. */
export function normalisePhone(value: string): string {
  return value.replace(/[\s\-().]/g, "");
}

/** Pakistani numbers: 03XX…, 923XX… or +92…, landline or mobile. */
export function isValidPhone(value: string): boolean {
  return /^(\+?92|0)\d{9,10}$/.test(normalisePhone(value));
}

/* ------------------------------------------------------------------ */
/* Report request                                                      */
/* ------------------------------------------------------------------ */

export type ReportRequestFields = {
  name: string;
  labNo: string;
  branchId: string;
  phone: string;
};

export type ReportRequestField = keyof ReportRequestFields;

/** Field order, used to focus the first invalid field. */
export const REPORT_REQUEST_FIELDS: ReportRequestField[] = [
  "name",
  "labNo",
  "branchId",
  "phone",
];

export function validateReportRequest(
  fields: ReportRequestFields,
  branchIds: readonly string[],
): Validation<ReportRequestField> {
  const errors: FieldErrors<ReportRequestField> = {};

  const name = checkName(fields.name);
  if (name) errors.name = name;

  const labNo = fields.labNo.trim();
  if (!labNo) errors.labNo = "Enter the Lab No. printed on your receipt.";
  else if (labNo.length > LAB_NO_MAX)
    errors.labNo = `Keep the Lab No. under ${LAB_NO_MAX} characters.`;
  else if (!/^[A-Za-z0-9][A-Za-z0-9\-/ ]*$/.test(labNo))
    errors.labNo = "Use only the letters, numbers, - and / on your receipt.";

  if (!branchIds.includes(fields.branchId))
    errors.branchId = "Choose the branch where the sample was taken.";

  if (!fields.phone.trim())
    errors.phone = "Enter a phone number we can reach you on.";
  else if (!isValidPhone(fields.phone))
    errors.phone = "Enter a Pakistani number, e.g. 0300-1234567.";

  return { ok: Object.keys(errors).length === 0, errors };
}

/** "Report request\nName: …\nLab No: …\nBranch: …\nPhone: …" */
export function buildReportRequestMessage(request: {
  name: string;
  labNo: string;
  branchName: string;
  phone: string;
}): string {
  return [
    "Report request",
    `Name: ${request.name.trim()}`,
    `Lab No: ${request.labNo.trim()}`,
    `Branch: ${request.branchName}`,
    `Phone: ${request.phone.trim()}`,
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* General enquiry                                                     */
/* ------------------------------------------------------------------ */

export const ENQUIRY_PURPOSES = [
  { id: "test", label: "Test enquiry" },
  { id: "appointment", label: "Appointment" },
  { id: "report", label: "Report" },
  { id: "other", label: "Other" },
] as const;

export type EnquiryPurpose = (typeof ENQUIRY_PURPOSES)[number]["id"];

export type EnquiryFields = {
  name: string;
  purpose: string;
  message: string;
};

export type EnquiryField = keyof EnquiryFields;

export const ENQUIRY_FIELDS: EnquiryField[] = ["name", "purpose", "message"];

export function purposeLabel(purpose: string): string | undefined {
  return ENQUIRY_PURPOSES.find((option) => option.id === purpose)?.label;
}

export function validateEnquiry(
  fields: EnquiryFields,
): Validation<EnquiryField> {
  const errors: FieldErrors<EnquiryField> = {};

  const name = checkName(fields.name);
  if (name) errors.name = name.replace("the patient's name", "your name");

  if (!purposeLabel(fields.purpose))
    errors.purpose = "Choose what your message is about.";

  const message = fields.message.trim();
  if (!message) errors.message = "Write your message.";
  else if (message.length > MESSAGE_MAX)
    errors.message = `Keep the message under ${MESSAGE_MAX} characters.`;

  return { ok: Object.keys(errors).length === 0, errors };
}

/** "Website enquiry: Appointment", or plain "Website enquiry" before a purpose is chosen. */
export function enquirySubject(purpose: string): string {
  const label = purposeLabel(purpose);
  return label ? `Website enquiry: ${label}` : "Website enquiry";
}

/** The enquiry as WhatsApp / email text. Empty fields are left out. */
export function buildEnquiryMessage(fields: EnquiryFields): string {
  const label = purposeLabel(fields.purpose);
  return [
    enquirySubject(fields.purpose),
    fields.name.trim() && `Name: ${fields.name.trim()}`,
    label && `Purpose: ${label}`,
    fields.message.trim() && `\n${fields.message.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");
}
