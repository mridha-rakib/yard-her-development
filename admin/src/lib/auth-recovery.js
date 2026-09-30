const RECOVERY_STORAGE_KEY = "yard-admin-password-recovery";

const isBrowser = () => typeof window !== "undefined";

export const getPasswordRecoveryState = () => {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(RECOVERY_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    window.sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
    return null;
  }
};

export const setPasswordRecoveryState = (value) => {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(value || {}));
};

export const clearPasswordRecoveryState = () => {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
};
