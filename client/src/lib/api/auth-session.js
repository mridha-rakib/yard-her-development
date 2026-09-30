import { AUTH_STORAGE_KEY } from "./config";

let authSession = null;
let hasLoadedFromStorage = false;
let storageSyncAttached = false;
const listeners = new Set();

const isBrowser = () => typeof window !== "undefined";

const normalizeSession = (session) => {
  if (!session?.tokens?.accessToken || !session?.tokens?.refreshToken) {
    return null;
  }

  return {
    user: session.user || null,
    tokens: {
      accessToken: session.tokens.accessToken,
      refreshToken: session.tokens.refreshToken,
      accessTokenExpiresIn: session.tokens.accessTokenExpiresIn || null,
      refreshTokenExpiresIn: session.tokens.refreshTokenExpiresIn || null,
    },
    metadata: session.metadata || null,
  };
};

const emit = () => {
  listeners.forEach((listener) => listener(authSession));
};

const readStorage = () => {
  if (!isBrowser()) {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return normalizeSession(JSON.parse(rawSession));
  } catch (error) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const writeStorage = (session) => {
  if (!isBrowser()) {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const ensureStorageSync = () => {
  if (!isBrowser() || storageSyncAttached) {
    return;
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== AUTH_STORAGE_KEY) {
      return;
    }

    authSession = readStorage();
    hasLoadedFromStorage = true;
    emit();
  });

  storageSyncAttached = true;
};

export const getStoredAuthSession = () => {
  ensureStorageSync();

  if (!hasLoadedFromStorage) {
    authSession = readStorage();
    hasLoadedFromStorage = true;
  }

  return authSession;
};

export const setStoredAuthSession = (session) => {
  ensureStorageSync();
  authSession = normalizeSession(session);
  hasLoadedFromStorage = true;
  writeStorage(authSession);
  emit();
  return authSession;
};

export const patchStoredAuthSession = (patch) => {
  const currentSession = getStoredAuthSession();

  if (!currentSession && !patch) {
    return null;
  }

  const nextSession = normalizeSession({
    user:
      patch && Object.prototype.hasOwnProperty.call(patch, "user")
        ? patch.user
        : currentSession?.user || null,
    tokens: {
      ...(currentSession?.tokens || {}),
      ...(patch?.tokens || {}),
    },
    metadata:
      patch && Object.prototype.hasOwnProperty.call(patch, "metadata")
        ? patch.metadata
        : currentSession?.metadata || null,
  });

  authSession = nextSession;
  hasLoadedFromStorage = true;
  writeStorage(authSession);
  emit();
  return authSession;
};

export const clearStoredAuthSession = () => {
  ensureStorageSync();
  authSession = null;
  hasLoadedFromStorage = true;
  writeStorage(null);
  emit();
};

export const getAccessToken = () => getStoredAuthSession()?.tokens?.accessToken || "";
export const getRefreshToken = () => getStoredAuthSession()?.tokens?.refreshToken || "";

export const subscribeToAuthSession = (listener) => {
  ensureStorageSync();
  listeners.add(listener);
  return () => listeners.delete(listener);
};
