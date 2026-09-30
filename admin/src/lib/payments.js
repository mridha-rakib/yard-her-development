import { formatDate, formatDateTime } from "./time";

export const PAYMENT_PAGE_SIZE = 5;

export const PAYMENT_STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Secure Hold", value: "authorized" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
  { label: "Cancelled", value: "cancelled" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { label: "All Methods", value: "all" },
  { label: "Card", value: "card" },
  { label: "PayPal", value: "paypal" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Cash", value: "cash" },
];

const PAYMENT_STATUS_LABELS = {
  paid: "Completed",
  authorized: "Secure Hold",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

const PAYMENT_STATUS_CLASSES = {
  paid: "bg-green-100 text-green-700",
  authorized: "bg-orange-100 text-orange-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const PAYMENT_METHOD_LABELS = {
  card: "Card",
  paypal: "PayPal",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  unknown: "Unknown",
};

const PAYOUT_STATUS_LABELS = {
  paid: "Paid",
  authorized: "Secure Hold",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

const titleCase = (value = "") =>
  String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim();

const toNumber = (value) => {
  const parsedValue = Number(value || 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const buildShortId = (prefix, value) => {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "N/A";
  }

  return `#${prefix}-${normalizedValue.slice(-6).toUpperCase()}`;
};

const getPaymentTimestamp = (payment = {}) =>
  payment?.paidAt || payment?.authorizedAt || payment?.createdAt || null;

const getServiceDateValue = (payment = {}) =>
  payment?.booking?.scheduledDate ||
  payment?.job?.preferredDate ||
  payment?.paidAt ||
  payment?.authorizedAt ||
  payment?.createdAt ||
  null;

export const formatCurrency = (amount = 0, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(amount));

export const getPaymentStatusLabel = (status = "") =>
  PAYMENT_STATUS_LABELS[status] || titleCase(status) || "Unknown";

export const getPaymentStatusClasses = (status = "") =>
  PAYMENT_STATUS_CLASSES[status] || "bg-gray-100 text-gray-700";

export const getPaymentMethodLabel = (paymentMethod = "") =>
  PAYMENT_METHOD_LABELS[paymentMethod] || titleCase(paymentMethod) || "Unknown";

export const buildVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
};

export const mapPaymentRecord = (payment = {}) => {
  const totalAmount = toNumber(payment.amount);
  const serviceAmount = toNumber(payment.jobSubtotal || payment.amount);
  const bookingFee = toNumber(payment.bookingFee);
  const platformFee = toNumber(payment.platformFee);
  const workerPayout = toNumber(payment.workerPayout);
  const platformFeePercentage = toNumber(payment.platformFeePercentage);
  const payoutPercentage =
    platformFeePercentage > 0 ? Math.max(0, 100 - platformFeePercentage) : 0;
  const paymentTimestamp = getPaymentTimestamp(payment);
  const paymentMethodLabel = getPaymentMethodLabel(payment.paymentMethod);
  const serviceDateValue = getServiceDateValue(payment);

  return {
    id: payment._id,
    jobId: buildShortId("JOB", payment?.job?._id),
    customer: {
      id: payment?.customer?._id || "",
      name: payment?.customer?.name || "Unknown Customer",
      email: payment?.customer?.email || "No email available",
      phone: payment?.customer?.phone || "No phone available",
    },
    worker: {
      id: payment?.worker?._id || "",
      name: payment?.worker?.name || "No Hero connected",
      email: payment?.worker?.email || "No Hero connected",
    },
    totalAmount,
    bookingFee,
    platformFee,
    platformFeePercentage,
    workerPayout,
    payoutPercentage,
    currency: payment.currency || "USD",
    paymentMethod: paymentMethodLabel,
    paymentMethodCode: payment.paymentMethod || "unknown",
    status: getPaymentStatusLabel(payment.status),
    statusCode: payment.status || "",
    jobTitle: payment?.job?.title || payment?.job?.serviceType || "Service request",
    serviceDate: formatDate(serviceDateValue) || "Not booked",
    duration: payment?.booking?.scheduledTime || payment?.job?.preferredTime || "Not available",
    address: [
      payment?.job?.streetAddress,
      payment?.job?.city,
      payment?.job?.zipCode,
    ]
      .filter(Boolean)
      .join(", ") || "Address not available",
    customerId: buildShortId("CUST", payment?.customer?._id),
    phone: payment?.customer?.phone || "No phone available",
    workerId: buildShortId("HERO", payment?.worker?._id),
    rating: null,
    serviceAmount,
    processingFee: 0,
    transactionId:
      payment?.stripePaymentIntentId ||
      payment?.stripeCheckoutSessionId ||
      String(payment?._id || ""),
    gateway: titleCase(payment.gateway) || "Unknown",
    processedAt: formatDateTime(paymentTimestamp) || "Not available",
    payoutStatus: PAYOUT_STATUS_LABELS[payment.status] || "Pending",
    payoutDate:
      payment.status === "paid"
        ? formatDate(payment.paidAt) || "Not available"
        : payment.status === "authorized"
          ? formatDate(payment.authorizedAt) || "Pending"
          : "Pending",
    refundAmount: toNumber(payment?.stripeRefundAmount),
    refundStatus: payment?.stripeRefundStatus || "",
    refundReason: payment?.refundReason || "",
    refundFailureReason: payment?.refundFailureReason || "",
    refundedAt: formatDateTime(payment?.refundedAt) || "",
    remainingRefundableAmount: Math.max(
      0,
      Number(payment?.amount || 0) - toNumber(payment?.stripeRefundAmount)
    ),
    transferReversedAmount: toNumber(payment?.stripeTransferReversedAmount),
    disputeId: payment?.stripeDisputeId || "",
    disputeStatus: payment?.stripeDisputeStatus || "",
    disputeReason: payment?.stripeDisputeReason || "",
    disputeAmount: toNumber(payment?.stripeDisputeAmount),
    disputeEvidenceDueBy: formatDateTime(payment?.stripeDisputeEvidenceDueBy) || "",
    disputeSubmittedAt: formatDateTime(payment?.stripeDisputeSubmittedAt) || "",
    disputeLastAction: payment?.stripeDisputeLastAction || "",
    disputeOutcome: payment?.stripeDisputeOutcome || "",
    cardEnding: "N/A",
    rawPayment: payment,
  };
};
