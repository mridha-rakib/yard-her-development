import { create } from "zustand";
import { authApi } from "../lib/api/auth-api";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  patchStoredAuthSession,
  setStoredAuthSession,
  subscribeToAuthSession,
} from "../lib/api/auth-session";
import { getApiErrorMessage } from "../lib/api/http";

const emptyAuthSlice = {
  user: null,
  tokens: null,
  isAuthenticated: false,
};

const buildSessionSlice = (session) => ({
  user: session?.user || null,
  tokens: session?.tokens || null,
  isAuthenticated: Boolean(session?.tokens?.accessToken && session?.tokens?.refreshToken),
});

const buildLoggedOutState = (error = null) => ({
  ...emptyAuthSlice,
  isInitializing: false,
  isReady: true,
  error,
});

let initializePromise = null;

export const useAuthStore = create((set, get) => ({
  ...emptyAuthSlice,
  ...buildSessionSlice(getStoredAuthSession()),
  isInitializing: false,
  isReady: false,
  error: null,

  clearError: () => set({ error: null }),

  initialize: async () => {
    if (get().isReady) {
      return get().user;
    }

    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      set({ isInitializing: true, error: null, ...buildSessionSlice(getStoredAuthSession()) });

      const existingSession = getStoredAuthSession();

      if (!existingSession?.tokens?.refreshToken) {
        set(buildLoggedOutState());
        initializePromise = null;
        return null;
      }

      try {
        const user = await authApi.getCurrentUser();
        const nextSession = patchStoredAuthSession({ user });

        set({
          isInitializing: false,
          isReady: true,
          error: null,
          ...buildSessionSlice(nextSession),
        });

        return user;
      } catch (error) {
        clearStoredAuthSession();
        set(buildLoggedOutState());

        throw error;
      } finally {
        initializePromise = null;
      }
    })();

    return initializePromise;
  },

  login: async (credentials) => {
    set({ isInitializing: true, error: null });

    try {
      const session = await authApi.login(credentials);
      setStoredAuthSession(session);
      set({
        isInitializing: false,
        isReady: true,
        error: null,
        ...buildSessionSlice(session),
      });

      return session;
    } catch (error) {
      clearStoredAuthSession();
      set(buildLoggedOutState(getApiErrorMessage(error)));
      throw error;
    }
  },

  refreshCurrentUser: async () => {
    try {
      const user = await authApi.getCurrentUser();
      const session = patchStoredAuthSession({ user });
      set({ error: null, ...buildSessionSlice(session) });
      return user;
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message });
      throw error;
    }
  },

  logout: async () => {
    try {
      if (get().isAuthenticated) {
        await authApi.logout();
      }
    } catch (error) {
      // Preserve local logout even if the API call fails.
    } finally {
      clearStoredAuthSession();
      set(buildLoggedOutState());
    }
  },

  logoutAll: async () => {
    try {
      if (get().isAuthenticated) {
        await authApi.logoutAll();
      }
    } finally {
      clearStoredAuthSession();
      set(buildLoggedOutState());
    }
  },
}));

subscribeToAuthSession((session) => {
  useAuthStore.setState((state) => ({
    ...state,
    ...buildSessionSlice(session),
  }));
});
