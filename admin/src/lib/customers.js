import { formatDate, formatDateTime } from "./time";

export const CUSTOMER_PAGE_SIZE = 6;

export const CUSTOMER_STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

export const CUSTOMER_SORT_OPTIONS = [
  { label: "Sort by: Newest", value: "newest" },
  { label: "Sort by: Oldest", value: "oldest" },
  { label: "Sort by: Most Bookings", value: "most_bookings" },
  { label: "Sort by: Highest Spent", value: "highest_spent" },
];

const CUSTOMER_STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

const CUSTOMER_STATUS_CLASSES = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  suspended: "bg-red-100 text-red-700",
};

const PAYMENT_METHOD_LABELS = {
  card: "Card",
  cash: "Cash",
  paypal: "PayPal",
  bank_transfer: "Bank Transfer",
  unknown: "Unknown",
};

const titleCase = (value = "") =>
  String(value)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const buildVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
};

export const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCustomerStatus = (status = "") =>
  CUSTOMER_STATUS_LABELS[status] || titleCase(status) || "Unknown";

export const getCustomerStatusClasses = (status = "") =>
  CUSTOMER_STATUS_CLASSES[status] || "bg-gray-100 text-gray-600";

export const formatMemberSince = (value) => {
  const label = formatDate(value, {
    month: "short",
    year: "numeric",
  });

  return label ? `Member since ${label}` : "Member since unavailable";
};

export const formatFullAddress = (customer = {}) =>
  [
    customer.location?.addressLine1,
    customer.location?.city,
    customer.location?.state,
    customer.location?.zipCode,
  ]
    .filter(Boolean)
    .join(", ") || "Not provided";

export const formatPaymentMethod = (value = "") =>
  PAYMENT_METHOD_LABELS[value] || titleCase(value) || "Unknown";

export const formatCustomerDate = (value) => formatDate(value) || "Not available";

export const formatCustomerDateTime = (value) => formatDateTime(value) || "Not available";
