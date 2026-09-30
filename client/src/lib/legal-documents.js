export const LEGAL_DOCUMENTS = [
  {
    id: "terms-of-service",
    href: "/terms-conditions",
    title: "Terms & Conditions",
    summary: "Please read these Terms carefully before using our platform.",
    layout: "document",
  },
  {
    id: "privacy-policy",
    href: "/privacy-policy",
    title: "Privacy Policy",
    summary:
      "Your privacy matters to us. Here's how we collect and safeguard your personal information when using our platform.",
    layout: "privacy",
  },
  {
    id: "cookie-policy",
    href: "/cookie-policy",
    title: "Cookie Policy",
    summary: "How cookies and related technologies are used across the platform.",
    layout: "document",
  },
  {
    id: "gdpr-compliance",
    href: "/gdpr-compliance",
    title: "GDPR Compliance",
    summary: "Information about user rights, data handling, and compliance commitments.",
    layout: "document",
  },
];

export const getLegalDocumentDefinition = (documentId = "") =>
  LEGAL_DOCUMENTS.find((document) => document.id === String(documentId || "").trim()) || null;

export const sanitizeLegalDocumentHtml = (value = "") =>
  String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?<\/embed>/gi, "")
    .replace(/\sstyle=(["'])[\s\S]*?\1/gi, "")
    .replace(/\son\w+=(["']).*?\1/gi, "")
    .replace(/\son\w+=([^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");

export const hasMeaningfulLegalDocumentContent = (value = "") =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim().length > 0;
