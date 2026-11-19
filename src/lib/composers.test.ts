import { describe, expect, it } from "vitest";
import {
  buildEnquiryMessage,
  buildReportRequestMessage,
  enquirySubject,
  isValidPhone,
  validateEnquiry,
  validateReportRequest,
} from "./composers";

const branchIds = ["saddar-rawalpindi", "f8-islamabad"];
const validRequest = {
  name: "Ayesha Khan",
  labNo: "AL-2026/1042",
  branchId: "saddar-rawalpindi",
  phone: "0322-5135060",
};

describe("isValidPhone", () => {
  it.each(["0322-5135060", "+92 322 5135060", "923225135060", "(051) 8448533"])(
    "accepts %s",
    (phone) => expect(isValidPhone(phone)).toBe(true),
  );
  it.each(["12345", "0322-abc5060", "", "+1 555 123 4567", "03225135060123"])(
    "rejects %s",
    (phone) => expect(isValidPhone(phone)).toBe(false),
  );
});

describe("validateReportRequest", () => {
  it("passes a complete request", () => {
    expect(validateReportRequest(validRequest, branchIds)).toEqual({
      ok: true,
      errors: {},
    });
  });

  it("flags every empty field", () => {
    const result = validateReportRequest(
      { name: " ", labNo: "", branchId: "", phone: "" },
      branchIds,
    );
    expect(result.ok).toBe(false);
    expect(Object.keys(result.errors).sort()).toEqual(
      ["branchId", "labNo", "name", "phone"].sort(),
    );
  });

  it("rejects an unknown branch, a bad Lab No. and a bad phone", () => {
    const result = validateReportRequest(
      {
        ...validRequest,
        branchId: "lahore",
        labNo: "<script>",
        phone: "12345",
      },
      branchIds,
    );
    expect(Object.keys(result.errors).sort()).toEqual(
      ["branchId", "labNo", "phone"].sort(),
    );
  });

  it("limits name and Lab No. length", () => {
    const result = validateReportRequest(
      { ...validRequest, name: "A", labNo: "1".repeat(31) },
      branchIds,
    );
    expect(result.errors.name).toMatch(/too short/);
    expect(result.errors.labNo).toMatch(/under 30/);
    expect(
      validateReportRequest(
        { ...validRequest, name: "A".repeat(81) },
        branchIds,
      ).errors.name,
    ).toMatch(/under 80/);
  });
});

describe("buildReportRequestMessage", () => {
  it("produces the structured message, trimmed", () => {
    expect(
      buildReportRequestMessage({
        name: "  Ayesha Khan ",
        labNo: " AL-1042 ",
        branchName: "Saddar, Rawalpindi",
        phone: " 0322-5135060",
      }),
    ).toBe(
      "Report request\nName: Ayesha Khan\nLab No: AL-1042\nBranch: Saddar, Rawalpindi\nPhone: 0322-5135060",
    );
  });
});

describe("enquiry", () => {
  const valid = { name: "Bilal", purpose: "appointment", message: "Saturday?" };

  it("validates", () => {
    expect(validateEnquiry(valid).ok).toBe(true);
    const empty = validateEnquiry({ name: "", purpose: "", message: " " });
    expect(Object.keys(empty.errors).sort()).toEqual(
      ["message", "name", "purpose"].sort(),
    );
    expect(empty.errors.name).toBe("Enter your name.");
    expect(
      validateEnquiry({ ...valid, message: "x".repeat(1001) }).errors.message,
    ).toMatch(/under 1000/);
    expect(
      validateEnquiry({ ...valid, purpose: "spam" }).errors.purpose,
    ).toBeDefined();
  });

  it("builds the subject", () => {
    expect(enquirySubject("appointment")).toBe("Website enquiry: Appointment");
    expect(enquirySubject("")).toBe("Website enquiry");
  });

  it("builds the message and skips empty fields", () => {
    expect(buildEnquiryMessage(valid)).toBe(
      "Website enquiry: Appointment\nName: Bilal\nPurpose: Appointment\n\nSaturday?",
    );
    expect(buildEnquiryMessage({ name: "", purpose: "", message: "" })).toBe(
      "Website enquiry",
    );
  });
});
