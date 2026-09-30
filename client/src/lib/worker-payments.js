import { formatPrice } from "@/lib/pricing-content";
import { formatDate, formatDateTime } from "@/lib/time";

export const createEmptyPaymentSummary = () => ({
  totalPaidHeroPayout: 0,
  pendingHeroPayout: 0,
  currentMonthHeroPayout: 0,
  totalHeroPayout: 0,
  totalPlatformFee: 0,
  totalCount: 0,
});

export const formatCurrency = (value) => `$${formatPrice(value || 0)}`;

export const paymentStatusConfig = {
  paid: {
    label: "Paid",
    tone: "text-emerald-600 bg-emerald-50",
    cardTone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  authorized: {
    label: "Secure Hold",
    tone: "text-blue-600 bg-blue-50",
    cardTone: "border-blue-200 bg-blue-50 text-blue-700",
  },
  pending: {
    label: "Pending",
    tone: "text-amber-600 bg-amber-50",
    cardTone: "border-amber-200 bg-amber-50 text-amber-700",
  },
  failed: {
    label: "Failed",
    tone: "text-red-600 bg-red-50",
    cardTone: "border-red-200 bg-red-50 text-red-700",
  },
  refunded: {
    label: "Refunded",
    tone: "text-slate-600 bg-slate-50",
    cardTone: "border-slate-200 bg-slate-50 text-slate-700",
  },
  cancelled: {
    label: "Cancelled",
    tone: "text-slate-600 bg-slate-50",
    cardTone: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

export const getPaymentStatusDetails = (status = "") =>
  paymentStatusConfig[status] || {
    label: status ? String(status) : "Unknown",
    tone: "text-slate-600 bg-slate-50",
    cardTone: "border-slate-200 bg-slate-50 text-slate-700",
  };

export const getPaymentDate = (payment = {}) =>
  payment?.paidAt || payment?.authorizedAt || payment?.createdAt || null;

export const getCompletedDate = (payment = {}) =>
  payment?.booking?.completedAt || payment?.paidAt || payment?.authorizedAt || payment?.createdAt;

export const getJobTitle = (payment = {}) =>
  payment?.job?.title || payment?.job?.serviceType || payment?.description || "Service job";

export const getPaymentMethodLabel = (method = "") => {
  const labels = {
    card: "Card",
    paypal: "PayPal",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    unknown: "Unknown",
  };

  return labels[method] || "Unknown";
};

export const getPaymentIdLabel = (payment = {}) => {
  const sourceId = payment?.job?._id || payment?._id || "";
  return sourceId ? `#${String(sourceId).slice(-6).toUpperCase()}` : "#------";
};

export const getLocationLabel = (payment = {}) =>
  [
    payment?.job?.streetAddress,
    payment?.job?.city,
    payment?.job?.state,
    payment?.job?.zipCode,
  ]
    .filter(Boolean)
    .join(", ") || "Location pending";

export const getHeroInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("") || "YH";

export const getPaymentDetailSummary = (payment = {}) => {
  const amount = Number(payment?.jobSubtotal || payment?.job?.estimatedPrice || payment?.amount || 0);
  const bookingFee = Number(payment?.bookingFee || 0);
  const totalCharged = Number(payment?.amount || amount + bookingFee || 0);
  const platformFee = Number(payment?.platformFee || 0);
  const workerPayout =
    payment?.workerPayout !== undefined
      ? Number(payment?.workerPayout || 0)
      : Number((amount - platformFee).toFixed(2));

  return {
    amount,
    bookingFee,
    totalCharged,
    platformFee,
    workerPayout,
    platformFeePercentage: Number(payment?.platformFeePercentage || 12),
  };
};

export const formatShortDate = (value) =>
  formatDate(value, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) || "N/A";

export const formatLongDateTime = (value) =>
  formatDateTime(value, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) || "Not available";
