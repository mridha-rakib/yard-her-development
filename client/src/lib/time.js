export const TIME_HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1));
export const TIME_MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0")
);
export const TIME_PERIODS = ["AM", "PM"];

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const parseTimeValue = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmedValue = String(value).trim();

  if (!trimmedValue) {
    return null;
  }

  const twentyFourHourMatch = trimmedValue.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);

    if (
      Number.isInteger(hours) &&
      Number.isInteger(minutes) &&
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    ) {
      return hours * 60 + minutes;
    }

    return null;
  }

  const twelveHourMatch = trimmedValue.match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])$/);

  if (!twelveHourMatch) {
    return null;
  }

  const hours = Number(twelveHourMatch[1]);
  const minutes = Number(twelveHourMatch[2] || "00");

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 1 ||
    hours > 12 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const normalizedHours =
    String(twelveHourMatch[3]).toUpperCase() === "PM" ? (hours % 12) + 12 : hours % 12;

  return normalizedHours * 60 + minutes;
};

export const formatDate = (
  value,
  options = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
) => {
  const parsedDate = parseDateValue(value);

  if (!parsedDate) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
};

export const formatDateTime = (
  value,
  options = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
) => {
  const parsedDate = parseDateValue(value);

  if (!parsedDate) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
};

export const formatTime = (value) => {
  const totalMinutes = parseTimeValue(value);

  if (totalMinutes === null) {
    return value ? String(value) : "";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const hourOnClock = hours % 12 || 12;

  return `${hourOnClock}:${String(minutes).padStart(2, "0")} ${period}`;
};

export const createEmptyTimeParts = () => ({
  hour: "",
  minute: "",
  meridiem: "",
});

export const getTimeFieldParts = (value) => {
  const totalMinutes = parseTimeValue(value);

  if (totalMinutes === null) {
    return createEmptyTimeParts();
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    hour: String(hours % 12 || 12),
    minute: String(minutes).padStart(2, "0"),
    meridiem: hours >= 12 ? "PM" : "AM",
  };
};

export const buildTimeValue = ({ hour = "", minute = "", meridiem = "" } = {}) => {
  if (!hour || minute === "" || !meridiem) {
    return "";
  }

  const hourValue = Number(hour);
  const minuteValue = Number(minute);

  if (
    !Number.isInteger(hourValue) ||
    !Number.isInteger(minuteValue) ||
    hourValue < 1 ||
    hourValue > 12 ||
    minuteValue < 0 ||
    minuteValue > 59
  ) {
    return "";
  }

  const normalizedHours = meridiem === "PM" ? (hourValue % 12) + 12 : hourValue % 12;

  return `${String(normalizedHours).padStart(2, "0")}:${String(minuteValue).padStart(2, "0")}`;
};
