import { formatTime } from "./time";

const titleCase = (value = "") =>
  String(value)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getInitials = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "NA";

export const formatHeroStatus = (status = "") => titleCase(status) || "Unknown";

export const getHeroStatusClasses = (status = "") => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "pending":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

export const formatAccountStatus = (status = "") => titleCase(status) || "Unknown";

export const getAccountStatusClasses = (status = "") => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "inactive":
      return "bg-gray-100 text-gray-700";
    case "suspended":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

export const formatLocation = (location = {}) => {
  const cityState = [location.city, location.state].filter(Boolean).join(", ");
  return cityState || location.addressLine1 || "Not provided";
};

export const formatFullAddress = (location = {}) =>
  [location.addressLine1, location.city, location.state, location.zipCode]
    .filter(Boolean)
    .join(", ") || "Not provided";

export const formatAvailability = (availability = {}) => {
  if (availability?.label) {
    return availability.label;
  }

  const dayText = Array.isArray(availability?.days) && availability.days.length
    ? availability.days.join(", ")
    : "";
  const timeText =
    availability?.startTime && availability?.endTime
      ? `${formatTime(availability.startTime)} - ${formatTime(availability.endTime)}`
      : "";

  return [dayText, timeText].filter(Boolean).join(" | ") || "Not provided";
};

export const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};
