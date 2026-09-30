import { formatDate, formatDateTime } from "./time";

export const TESTIMONIAL_PAGE_SIZE = 8;

export const TESTIMONIAL_SORT_OPTIONS = [
  { label: "Sort by: Recently Updated", value: "newest" },
  { label: "Sort by: Oldest", value: "oldest" },
  { label: "Sort by: Highest Rating", value: "highest_rating" },
  { label: "Sort by: Lowest Rating", value: "lowest_rating" },
];

export const buildVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
};

export const getReviewerName = (testimonial = {}) =>
  testimonial.customer?.name || testimonial.displayName || "Unknown customer";

export const getReviewerEmail = (testimonial = {}) =>
  testimonial.customer?.email || "No account email";

export const getReviewerPhone = (testimonial = {}) =>
  testimonial.customer?.phone || "No phone";

export const getPublicDisplayName = (testimonial = {}) =>
  testimonial.displayName || "Verified Customer";

export const formatReviewDate = (value) => formatDate(value) || "Not available";

export const formatReviewDateTime = (value) => formatDateTime(value) || "Not available";
