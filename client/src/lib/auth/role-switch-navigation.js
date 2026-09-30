"use client";

let pendingNavigation = null;
let clearTimer = null;

export const markRoleSwitchNavigation = (role) => {
  pendingNavigation = {
    role,
    startedAt: Date.now(),
  };

  if (clearTimer) {
    window.clearTimeout(clearTimer);
  }

  clearTimer = window.setTimeout(() => {
    pendingNavigation = null;
    clearTimer = null;
  }, 3000);
};

export const clearRoleSwitchNavigation = () => {
  pendingNavigation = null;

  if (clearTimer) {
    window.clearTimeout(clearTimer);
    clearTimer = null;
  }
};

export const isNavigatingToDifferentRole = (requiredRole) =>
  Boolean(pendingNavigation?.role && pendingNavigation.role !== requiredRole);
