import { formatDate, formatDateTime } from "./time";

export const BOOKING_PAGE_SIZE = 5;

export const BOOKING_STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "New", value: "new" },
  { label: "Accepted", value: "assigned" },
  { label: "In Progress", value: "in_progress" },
  { label: "Awaiting Approval", value: "pending_verification" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Paid", value: "paid" },
];

export const BOOKING_STATUS_UPDATE_OPTIONS = [
  { label: "Accepted", value: "assigned" },
  { label: "In Progress", value: "in_progress" },
  { label: "Awaiting Approval", value: "pending_verification" },
  { label: "Cancelled", value: "cancelled" },
];

export const BOOKING_URGENCY_OPTIONS = [
  { label: "All Urgency", value: "all" },
  { label: "Today", value: "today" },
  { label: "24 Hours", value: "within24" },
  { label: "Booked", value: "scheduled" },
  { label: "Flexible", value: "flexible" },
];

const STATUS_LABELS = {
  new: "New",
  assigned: "Accepted",
  in_progress: "In Progress",
  pending_verification: "Awaiting Approval",
  completed: "Completed",
  cancelled: "Cancelled",
  paid: "Paid",
};

const STATUS_CLASSES = {
  new: "bg-gray-100 text-gray-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  pending_verification: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  paid: "bg-purple-100 text-purple-700",
};

const URGENCY_LABELS = {
  today: "Today",
  within24: "24 Hours",
  flexible: "Flexible",
  scheduled: "Booked",
};

const URGENCY_CLASSES = {
  today: "bg-red-100 text-red-700",
  within24: "bg-yellow-100 text-yellow-700",
  flexible: "bg-gray-100 text-gray-700",
  scheduled: "bg-green-100 text-green-700",
};

const PREFERRED_TIME_LABELS = {
  anytime: "Any time",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const titleCase = (value = "") =>
  String(value)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getBookingIdLabel = (jobId = "") =>
  jobId ? `#${String(jobId).slice(-6).toUpperCase()}` : "N/A";

export const getBookingCustomerName = (job = {}) => job.customer?.name || job.fullName || "Unknown";

export const getBookingCustomerEmail = (job = {}) => job.customer?.email || job.email || "No email";

export const getBookingHeroName = (job = {}) => job.assignedWorker?.name || "No Hero connected";

export const formatBookingLocation = (job = {}) =>
  [job.city, job.state, job.zipCode].filter(Boolean).join(", ") ||
  job.streetAddress ||
  "Location pending";

export const getBookingStatusLabel = (status = "") =>
  STATUS_LABELS[status] || titleCase(status) || "Unknown";

export const getBookingStatusClasses = (status = "") =>
  STATUS_CLASSES[status] || "bg-gray-100 text-gray-700";

export const getUrgencyLabel = (urgency = "") =>
  URGENCY_LABELS[urgency] || titleCase(urgency) || "Flexible";

export const getUrgencyClasses = (urgency = "") =>
  URGENCY_CLASSES[urgency] || "bg-gray-100 text-gray-700";

export const getPreferredTimeLabel = (preferredTime = "") =>
  PREFERRED_TIME_LABELS[preferredTime] || preferredTime || "Any time";

export const formatBookingDate = (value) => formatDate(value) || "Not booked";

export const formatBookingDateTime = (value) => formatDateTime(value) || "Pending";

export const formatPreferredSchedule = (job = {}) => {
  const dateLabel = job.preferredDate ? formatDate(job.preferredDate) : "";
  const timeLabel = getPreferredTimeLabel(job.preferredTime);

  if (dateLabel && timeLabel) {
    return `${dateLabel} - ${timeLabel}`;
  }

  if (dateLabel) {
    return dateLabel;
  }

  return timeLabel;
};
