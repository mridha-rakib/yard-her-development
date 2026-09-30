export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  WORKER: "worker",
};

const uniqueRoles = (values = []) => [
  ...new Set(
    values
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase())
      .filter((value) => Object.values(ROLES).includes(value))
  ),
];

export const getUserRoles = (user) => {
  const roles = uniqueRoles([...(Array.isArray(user?.roles) ? user.roles : []), user?.role]);

  if (roles.includes(ROLES.WORKER) && !roles.includes(ROLES.CUSTOMER)) {
    roles.push(ROLES.CUSTOMER);
  }

  return roles;
};

export const hasRole = (user, role) => getUserRoles(user).includes(role);

export const isDualRoleUser = (user) =>
  hasRole(user, ROLES.CUSTOMER) && hasRole(user, ROLES.WORKER);

export const getPrimaryRole = (user) => {
  const roles = getUserRoles(user);

  if (user?.role && roles.includes(user.role)) {
    return user.role;
  }

  if (roles.includes(ROLES.ADMIN)) {
    return ROLES.ADMIN;
  }

  if (roles.includes(ROLES.WORKER)) {
    return ROLES.WORKER;
  }

  if (roles.includes(ROLES.CUSTOMER)) {
    return ROLES.CUSTOMER;
  }

  return "";
};
