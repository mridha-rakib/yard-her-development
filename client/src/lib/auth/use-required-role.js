"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildLoginPath } from "./auth-redirect";
import { getDefaultPathForUser } from "./get-default-path";
import { isNavigatingToDifferentRole } from "./role-switch-navigation";
import { hasRole } from "./user-roles";
import { useAuthStore } from "@/stores/use-auth-store";

export const useRequiredRole = (requiredRole, redirectPath) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isReady = useAuthStore((state) => state.isReady);
  const switchRole = useAuthStore((state) => state.switchRole);
  const [isRoleSyncing, setIsRoleSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncRole = async () => {
      if (!isReady) {
        return;
      }

      if (!isAuthenticated) {
        router.replace(buildLoginPath(redirectPath));
        return;
      }

      if (user?.role && !hasRole(user, requiredRole)) {
        router.replace(getDefaultPathForUser(user));
        return;
      }

      if (isNavigatingToDifferentRole(requiredRole)) {
        setIsRoleSyncing(false);
        return;
      }

      if (user?.role && user.role !== requiredRole) {
        setIsRoleSyncing(true);

        try {
          await switchRole(requiredRole);
        } catch {
          if (!cancelled) {
            router.replace(getDefaultPathForUser(user));
          }
        } finally {
          if (!cancelled) {
            setIsRoleSyncing(false);
          }
        }
      } else if (!cancelled) {
        setIsRoleSyncing(false);
      }
    };

    syncRole();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, redirectPath, requiredRole, router, switchRole, user]);

  const canAccessRole = hasRole(user, requiredRole);
  const isRoleReady =
    isReady &&
    isAuthenticated &&
    canAccessRole &&
    user?.role === requiredRole &&
    !isRoleSyncing;

  return {
    user,
    isAuthenticated,
    isReady,
    canAccessRole,
    isRoleReady,
    isRoleSyncing,
  };
};
