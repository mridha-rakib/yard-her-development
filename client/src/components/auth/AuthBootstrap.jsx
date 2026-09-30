"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/use-auth-store";

const AuthBootstrap = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize().catch(() => {});
  }, [initialize]);

  return null;
};

export default AuthBootstrap;
