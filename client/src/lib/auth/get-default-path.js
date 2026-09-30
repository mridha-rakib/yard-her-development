import { getPrimaryRole } from "./user-roles";

export const getDefaultPathForUser = (user) => {
  const role = getPrimaryRole(user);

  if (!role) {
    return "/";
  }

  if (role === "worker") {
    return "/worker-home";
  }

  if (role === "customer") {
    return "/myjobs";
  }

  return "/";
};
