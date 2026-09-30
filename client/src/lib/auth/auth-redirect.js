import { getDefaultPathForUser } from "@/lib/auth/get-default-path";
import { hasRole } from "./user-roles";

const AUTH_PATHS = new Set(["/login", "/sign-up", "/forgot-password", "/verify-email"]);
const VERIFICATION_PATH = "/verify-email";

export const sanitizeRedirectTo = (redirectTo) => {
  if (typeof redirectTo !== "string" || !redirectTo) {
    return "";
  }

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "";
  }

  try {
    const url = new URL(redirectTo, "http://localhost");

    if (AUTH_PATHS.has(url.pathname)) {
      return "";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "";
  }
};

export const buildPathWithSearchParams = (pathname, searchParams) => {
  const queryString = searchParams?.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

const buildAuthPath = (pathname, redirectTo) => {
  const safeRedirectTo = sanitizeRedirectTo(redirectTo);

  if (!safeRedirectTo) {
    return pathname;
  }

  const query = new URLSearchParams({
    redirectTo: safeRedirectTo,
  });

  return `${pathname}?${query.toString()}`;
};

export const buildLoginPath = (redirectTo) => buildAuthPath("/login", redirectTo);

export const buildSignUpPath = (redirectTo) => buildAuthPath("/sign-up", redirectTo);

export const buildVerifyEmailPath = (redirectTo) =>
  buildAuthPath(VERIFICATION_PATH, redirectTo);

export const getPostAuthPath = (user, redirectTo) => {
  const safeRedirectTo = sanitizeRedirectTo(redirectTo);

  if (
    (hasRole(user, "customer") || hasRole(user, "worker")) &&
    user.isEmailVerified === false
  ) {
    return buildVerifyEmailPath(safeRedirectTo);
  }

  if (safeRedirectTo) {
    return safeRedirectTo;
  }

  return getDefaultPathForUser(user);
};
