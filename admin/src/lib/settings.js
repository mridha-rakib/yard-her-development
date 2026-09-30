export const DEFAULT_PLATFORM_INFO = {
  name: "Yard Heroes",
  email: "support@yardheroes.com",
  phone: "+1 (555) 123-4567",
};

export const DEFAULT_PAYMENT_SETTINGS = {
  platformFee: 12,
  minimumServiceAmount: 25,
  paymentProcessor: "stripe",
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  newUserRegistrations: true,
  serviceCompletions: true,
  paymentIssues: true,
};

export const DEFAULT_LEGAL_DOCS = [
  {
    id: "terms-of-service",
    name: "Terms & Conditions",
    status: "active",
    body: "",
  },
  {
    id: "privacy-policy",
    name: "Privacy Policy",
    status: "active",
    body: "",
  },
  {
    id: "cookie-policy",
    name: "Cookie Policy",
    status: "active",
    body: "",
  },
  {
    id: "gdpr-compliance",
    name: "GDPR Compliance",
    status: "active",
    body: "",
  },
];

export const PAYMENT_PROCESSOR_OPTIONS = [
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
  { value: "square", label: "Square" },
];

export const cloneLegalDocs = (documents = DEFAULT_LEGAL_DOCS) =>
  documents.map((document) => ({ ...document }));

export const normalizePlatformInfo = (platformInfo = {}) => ({
  name: platformInfo?.name ?? DEFAULT_PLATFORM_INFO.name,
  email: platformInfo?.email ?? DEFAULT_PLATFORM_INFO.email,
  phone: platformInfo?.phone ?? DEFAULT_PLATFORM_INFO.phone,
});

export const normalizePaymentSettings = (paymentSettings = {}) => ({
  platformFee: DEFAULT_PAYMENT_SETTINGS.platformFee,
  minimumServiceAmount: Number(
    paymentSettings?.minimumServiceAmount ?? DEFAULT_PAYMENT_SETTINGS.minimumServiceAmount
  ),
  paymentProcessor:
    paymentSettings?.paymentProcessor ?? DEFAULT_PAYMENT_SETTINGS.paymentProcessor,
});

export const normalizeNotificationSettings = (notificationSettings = {}) => ({
  newUserRegistrations:
    notificationSettings?.newUserRegistrations ??
    DEFAULT_NOTIFICATION_SETTINGS.newUserRegistrations,
  serviceCompletions:
    notificationSettings?.serviceCompletions ?? DEFAULT_NOTIFICATION_SETTINGS.serviceCompletions,
  paymentIssues:
    notificationSettings?.paymentIssues ?? DEFAULT_NOTIFICATION_SETTINGS.paymentIssues,
});

export const normalizeLegalDocs = (documents = []) => {
  const sourceDocuments = Array.isArray(documents) && documents.length ? documents : DEFAULT_LEGAL_DOCS;

  return sourceDocuments.map((document, index) => ({
    id: document?.id || DEFAULT_LEGAL_DOCS[index]?.id || `document-${index + 1}`,
    name: document?.name || DEFAULT_LEGAL_DOCS[index]?.name || `Document ${index + 1}`,
    status: document?.status === "inactive" ? "inactive" : "active",
    body: document?.body || "",
  }));
};

export const getLegalDocumentStatusClasses = (status = "") =>
  status === "inactive" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700";

export const formatPaymentProcessorLabel = (value = "") =>
  PAYMENT_PROCESSOR_OPTIONS.find((option) => option.value === value)?.label || value || "Unknown";
