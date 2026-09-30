import { API_ORIGIN } from "./api/config";

export const resolveApiMediaUrl = (value = "") => {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "";
  }

  if (
    normalizedValue.startsWith("data:") ||
    normalizedValue.startsWith("blob:") ||
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://")
  ) {
    return normalizedValue;
  }

  const mediaPath = normalizedValue.startsWith("/")
    ? normalizedValue
    : `/${normalizedValue.replace(/^\/+/, "")}`;

  return `${API_ORIGIN}${mediaPath}`;
};
