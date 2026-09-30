"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  CheckCheck,
  ChevronDown,
  CreditCard,
  LifeBuoy,
  LoaderCircle,
  LogOut,
  MessageCircle,
  SquareUserRound,
  UserPlus,
} from "lucide-react";
import { MdClose, MdMenu } from "react-icons/md";
import { buildLoginPath } from "@/lib/auth/auth-redirect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDefaultPathForUser } from "@/lib/auth/get-default-path";
import {
  clearRoleSwitchNavigation,
  markRoleSwitchNavigation,
} from "@/lib/auth/role-switch-navigation";
import {
  ROLES,
  getPrimaryRole,
  hasRole,
  isDualRoleUser,
} from "@/lib/auth/user-roles";
import { notificationsApi } from "@/lib/api/notifications-api";
import { useAuthStore } from "@/stores/use-auth-store";

const workerRoutes = [
  "/worker-home",
  "/payment",
  "/all-jobs",
  "/work-process",
  "/help-support",
  "/registration",
  "/terms-policy",
  "/hero-agreement",
  "/profile",
  "/support",
];

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/book", label: "Book" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/testimonials", label: "Testimonials" },
];

const workerLinks = [
  { href: "/worker-home", label: "Home" },
  { href: "/work-process", label: "Work Process" },
  { href: "/all-jobs", label: "All Jobs" },
  { href: "/payment", label: "Payment" },
  { href: "/terms-policy", label: "Terms & Policy" },
  { href: "/hero-agreement", label: "Hero Agreement" },
];

const getRoleDashboardHref = (role) => {
  if (role === ROLES.WORKER) {
    return "/worker-home";
  }

  if (role === ROLES.CUSTOMER) {
    return "/myjobs";
  }

  return "/";
};

const getPrimaryActionHref = (user) => {
  if (getPrimaryRole(user) === ROLES.WORKER) {
    return "/all-jobs";
  }

  if (hasRole(user, ROLES.CUSTOMER)) {
    return "/book";
  }

  return "/";
};

const getPrimaryActionLabel = (user) => {
  if (getPrimaryRole(user) === ROLES.WORKER) {
    return "All Jobs";
  }

  if (hasRole(user, ROLES.CUSTOMER)) {
    return "Book Yard Work";
  }

  return "Browse";
};

const getProfileHref = (user) => {
  if (getPrimaryRole(user) === ROLES.WORKER) {
    return "/profile";
  }

  if (hasRole(user, ROLES.CUSTOMER)) {
    return "/my-profile";
  }

  return "/";
};

const getRoleLabel = (user) => {
  if (isDualRoleUser(user)) {
    return "Hero + Customer";
  }

  if (hasRole(user, ROLES.WORKER)) {
    return "Hero";
  }

  if (hasRole(user, ROLES.CUSTOMER)) {
    return "Customer";
  }

  return "Guest";
};

const getUserShortName = (user) => {
  const rawName = String(user?.name || "").trim();

  if (!rawName) {
    return "Account";
  }

  return rawName.split(/\s+/)[0];
};

const getAccountLabel = (user) => {
  if (getPrimaryRole(user) === ROLES.WORKER) {
    return "Hero Home";
  }

  if (hasRole(user, ROLES.CUSTOMER)) {
    return "My Jobs";
  }

  return "Account";
};

const formatRelativeTime = (value) => {
  const timestamp = new Date(value).getTime();

  if (!timestamp) {
    return "Just now";
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

const getNotificationIcon = (notification) => {
  if (notification?.category === "support") {
    return LifeBuoy;
  }

  if (notification?.category === "payment") {
    return CreditCard;
  }

  if (notification?.category === "chat") {
    return MessageCircle;
  }

  if (notification?.category === "job" || notification?.category === "booking") {
    return BriefcaseBusiness;
  }

  if (notification?.category === "account" || notification?.type?.includes("worker")) {
    return UserPlus;
  }

  return Bell;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingRoleSwitch, setPendingRoleSwitch] = useState(null);
  const accountMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const logout = useAuthStore((state) => state.logout);
  const switchRole = useAuthStore((state) => state.switchRole);
  const [notifications, setNotifications] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const isHeroPage = workerRoutes.some((route) => pathname.startsWith(route));
  const navLinks = isHeroPage ? workerLinks : publicLinks;
  const accountHref = getDefaultPathForUser(user);
  const profileHref = getProfileHref(user);
  const guestBookHref = buildLoginPath("/book");
  const dashboardLinks = [
    ...(hasRole(user, ROLES.CUSTOMER)
      ? [{ href: "/myjobs", label: "Customer Dashboard", role: ROLES.CUSTOMER }]
      : []),
    ...(hasRole(user, ROLES.WORKER)
      ? [{ href: "/worker-home", label: "Hero Dashboard", role: ROLES.WORKER }]
      : []),
  ];
  const roleToggleOptions = isDualRoleUser(user)
    ? [
        { role: ROLES.CUSTOMER, label: "Customer", href: "/myjobs" },
        { role: ROLES.WORKER, label: "Hero", href: "/worker-home" },
      ]
    : [];
  const canBecomeHero = hasRole(user, ROLES.CUSTOMER) && !hasRole(user, ROLES.WORKER);
  const activeRole = user?.role || "";
  const roleSwitching = pendingRoleSwitch?.role || "";
  const activeToggleRole = roleSwitching || activeRole;
  const isRoleSwitchPending = Boolean(pendingRoleSwitch);

  const closeMenus = () => {
    setAccountMenuOpen(false);
    setNotificationsOpen(false);
    setOpen(false);
  };

  const loadNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!isAuthenticated || !user?._id) {
      setNotifications([]);
      setNotificationsCount(0);
      return;
    }

    if (!silent) {
      setIsLoadingNotifications(true);
    }

    try {
      const result = await notificationsApi.listNotifications({ limit: 8 });
      setNotifications(result.items || []);
      setNotificationsCount(Number(result.summary?.unreadCount || 0));
    } catch {
      if (!silent) {
        setNotifications([]);
      }
    } finally {
      if (!silent) {
        setIsLoadingNotifications(false);
      }
    }
  }, [isAuthenticated, user?._id]);

  const handleLogout = async () => {
    closeMenus();
    await logout();
    router.push("/");
  };

  const handleNotificationToggle = async () => {
    const nextOpenValue = !notificationsOpen;
    setNotificationsOpen(nextOpenValue);
    setAccountMenuOpen(false);

    if (nextOpenValue) {
      await loadNotifications({ silent: false });
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification) {
      return;
    }

    if (!notification.isRead) {
      try {
        await notificationsApi.markAsRead(notification._id);
      } catch {
        // Preserve navigation if the notification API is temporarily unavailable.
      }

      setNotifications((currentValue) =>
        currentValue.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true, readAt: item.readAt || new Date().toISOString() }
            : item
        )
      );
      setNotificationsCount((currentValue) => Math.max(0, currentValue - 1));
    }

    closeMenus();

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((currentValue) =>
        currentValue.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString(),
        }))
      );
      setNotificationsCount(0);
    } catch {
      // Ignore transient failures in the dropdown.
    }
  };

  const handleRoleSwitch = async (targetRole, href = getRoleDashboardHref(targetRole)) => {
    if (!user || !hasRole(user, targetRole)) {
      return;
    }

    const resolvedHref = href || getRoleDashboardHref(targetRole);
    closeMenus();

    if (user.role === targetRole && pathname === resolvedHref) {
      return;
    }

    setPendingRoleSwitch({ role: targetRole, href: resolvedHref });
    markRoleSwitchNavigation(targetRole);

    try {
      if (user.role !== targetRole) {
        await switchRole(targetRole);
      }

      router.push(resolvedHref);
    } catch (error) {
      clearRoleSwitchNavigation();
      setPendingRoleSwitch(null);
      throw error;
    }
  };

  const handleMenuNavigation = async (href, targetRole = "") => {
    if (targetRole && user && hasRole(user, targetRole)) {
      await handleRoleSwitch(targetRole, href);
      return;
    }

    closeMenus();
    router.push(href);
  };

  useEffect(() => {
    if (!pendingRoleSwitch) {
      return undefined;
    }

    if (user?.role === pendingRoleSwitch.role && pathname === pendingRoleSwitch.href) {
      clearRoleSwitchNavigation();
      setPendingRoleSwitch(null);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      clearRoleSwitchNavigation();
      setPendingRoleSwitch(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, pendingRoleSwitch, user?.role]);

  useEffect(() => {
    if (!accountMenuOpen && !notificationsOpen) {
      return;
    }

    const handlePointerDown = (event) => {
      const clickedAccountMenu = accountMenuRef.current?.contains(event.target);
      const clickedNotificationMenu = notificationMenuRef.current?.contains(event.target);

      if (!clickedAccountMenu && !clickedNotificationMenu) {
        setAccountMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [accountMenuOpen, notificationsOpen]);

  useEffect(() => {
    setNotifications([]);
    setNotificationsCount(0);
  }, [activeRole, isAuthenticated, user?._id]);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      setNotifications([]);
      setNotificationsCount(0);
      return undefined;
    }

    loadNotifications({ silent: false });

    const intervalId = window.setInterval(() => {
      loadNotifications({ silent: true });
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [activeRole, isAuthenticated, user?._id, loadNotifications]);

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/yaqrd-main.jpeg"
              alt="Yard Hero"
              width={44}
              height={44}
              className="h-11 w-11 rounded-md object-cover"
            />
          </Link>

          <div className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={!isAuthenticated && link.href === "/book" ? guestBookHref : link.href}
                active={pathname === link.href}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex shrink-0 items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {roleToggleOptions.length ? (
                  <div className="inline-flex items-center rounded-full border border-[#d7e0d9] bg-[#f8faf8] p-1">
                    {roleToggleOptions.map((option) => {
                      const isActiveRole = activeToggleRole === option.role;
                      const isBusy = roleSwitching === option.role;

                      return (
                        <button
                          key={option.role}
                          type="button"
                          onClick={() => handleRoleSwitch(option.role, option.href)}
                          disabled={isInitializing || isRoleSwitchPending}
                          className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                            isActiveRole
                              ? "bg-[#0A3019] text-white"
                              : "text-[#334155] hover:bg-white"
                          } disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                          {isBusy ? "Switching..." : option.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <div ref={notificationMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={handleNotificationToggle}
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7e0d9] bg-[#f8faf8] text-[#334155] transition-colors hover:bg-[#f2f6f2]"
                  >
                    <Bell className="h-4 w-4" />
                    {notificationsCount > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[10px] font-semibold text-white">
                        {notificationsCount > 9 ? "9+" : notificationsCount}
                      </span>
                    ) : null}
                  </button>

                  {notificationsOpen ? (
                    <div className="absolute right-0 top-full z-50 mt-3 w-[22rem] rounded-2xl border border-[#d7e0d9] bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
                      <div className="flex items-center justify-between gap-3 border-b border-[#e2e8e3] px-1 pb-3">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">Notifications</p>
                          <p className="mt-1 text-[11px] text-[#6b7280]">
                            {notificationsCount
                              ? `${notificationsCount} unread`
                              : "You're all caught up."}
                          </p>
                        </div>

                        {notificationsCount > 0 ? (
                          <button
                            type="button"
                            onClick={handleMarkAllNotificationsRead}
                            className="inline-flex items-center gap-1 rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-semibold text-[#1d4ed8]"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                          </button>
                        ) : null}
                      </div>

                      <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
                        {isLoadingNotifications ? (
                          <div className="flex items-center justify-center rounded-xl border border-dashed border-[#d7e0d9] px-4 py-8 text-sm text-[#6b7280]">
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Loading notifications...
                          </div>
                        ) : notifications.length ? (
                          notifications.map((notification) => {
                            const Icon = getNotificationIcon(notification);

                            return (
                              <button
                                key={notification._id}
                                type="button"
                                onClick={() => handleNotificationClick(notification)}
                                className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                                  notification.isRead
                                    ? "border-[#ebf0ec] bg-white hover:bg-[#f8fbf8]"
                                    : "border-[#dce8df] bg-[#f5faf6] hover:bg-[#eef7f0]"
                                }`}
                              >
                                <div className="rounded-xl bg-[#eef4ef] p-2 text-[#0A3019]">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-semibold text-[#111827]">
                                      {notification.title}
                                    </p>
                                    {!notification.isRead ? (
                                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#16a34a]" />
                                    ) : null}
                                  </div>
                                  <p className="mt-1 text-sm leading-6 text-[#4b5563]">
                                    {notification.message}
                                  </p>
                                  <p className="mt-2 text-[11px] text-[#6b7280]">
                                    {formatRelativeTime(notification.createdAt)}
                                  </p>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="rounded-xl border border-dashed border-[#d7e0d9] px-4 py-8 text-center text-sm text-[#6b7280]">
                            No notifications yet.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div ref={accountMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen((currentValue) => !currentValue);
                      setNotificationsOpen(false);
                    }}
                    className="inline-flex items-center gap-3 rounded-full border border-[#d7e0d9] bg-[#f8faf8] px-2 py-1.5 text-left transition-colors hover:bg-[#f2f6f2] focus:outline-none"
                  >
                    <Avatar className="size-9">
                      <AvatarImage src={user.profilePhotoUrl || ""} alt={user.name || "Account"} />
                      <AvatarFallback className="bg-[#0A3019] text-xs font-semibold text-white">
                        {getUserShortName(user).slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-2 pr-1">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-none text-[#111827]">
                          {getUserShortName(user)}
                        </span>
                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                          {getRoleLabel(user)}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-[#64748b] transition-transform ${
                          accountMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {accountMenuOpen ? (
                    <div className="absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-[#d7e0d9] bg-white p-2 shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
                      <div className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarImage
                              src={user.profilePhotoUrl || ""}
                              alt={user.name || "Account"}
                            />
                            <AvatarFallback className="bg-[#0A3019] text-xs font-semibold text-white">
                              {getUserShortName(user).slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#111827]">
                              {user.name || "Account"}
                            </p>
                            <p className="truncate text-xs font-medium text-[#6b7280]">
                              {user.email || getRoleLabel(user)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="my-1 h-px bg-[#e2e8e3]" />

                      <button
                        type="button"
                        onClick={() => handleMenuNavigation(profileHref, getPrimaryRole(user))}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f6f8f6]"
                      >
                        <SquareUserRound className="h-4 w-4 text-[#0A3019]" />
                        Profile
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMenuNavigation(accountHref, getPrimaryRole(user))}
                        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f6f8f6]"
                      >
                        <SquareUserRound className="h-4 w-4 text-[#0A3019]" />
                        {getAccountLabel(user)}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleMenuNavigation(getPrimaryActionHref(user), getPrimaryRole(user))
                        }
                        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f6f8f6]"
                      >
                        <SquareUserRound className="h-4 w-4 text-[#0A3019]" />
                        {getPrimaryActionLabel(user)}
                      </button>

                      {dashboardLinks.map((link) => (
                        <button
                          key={link.href}
                          type="button"
                          onClick={() => handleMenuNavigation(link.href, link.role)}
                          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f6f8f6]"
                        >
                          <SquareUserRound className="h-4 w-4 text-[#0A3019]" />
                          {link.label}
                        </button>
                      ))}

                      {canBecomeHero ? (
                        <button
                          type="button"
                          onClick={() => handleMenuNavigation("/registration")}
                          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f6f8f6]"
                        >
                          <SquareUserRound className="h-4 w-4 text-[#0A3019]" />
                          Become a Hero
                        </button>
                      ) : null}

                      <div className="my-1 h-px bg-[#e2e8e3]" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isInitializing}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#b42318] transition-colors hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <LogOut className="h-4 w-4" />
                        {isInitializing ? "Logging Out..." : "Log Out"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : isHeroPage ? (
              <>
                <Link
                  href="/login"
                  className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-green-700"
                >
                  Login
                </Link>

                <Link
                  href="/registration"
                  className="whitespace-nowrap rounded-md bg-green-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  Apply as a Hero
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-green-700"
                >
                  Login
                </Link>

                <Link
                  href="/sign-up"
                  className="whitespace-nowrap rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Sign Up
                </Link>

                <Link
                  href={guestBookHref}
                  className="whitespace-nowrap rounded-md bg-green-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  Book Yard Work
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((currentValue) => !currentValue)}
            className="ml-auto md:hidden text-gray-700"
          >
            {open ? <MdClose size={28} /> : <MdMenu size={28} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden bg-white border-t px-4 py-6 space-y-4 text-sm">
          {navLinks.map((link) => (
            <MobileLink
              key={link.href}
              href={!isAuthenticated && link.href === "/book" ? guestBookHref : link.href}
              setOpen={setOpen}
            >
              {link.label}
            </MobileLink>
          ))}

          <div className="pt-4 border-t space-y-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  href={profileHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-3 rounded-full border border-[#d7e0d9] bg-[#f8faf8] px-3 py-2"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={user.profilePhotoUrl || ""} alt={user.name || "Account"} />
                    <AvatarFallback className="bg-[#0A3019] text-xs font-semibold text-white">
                      {getUserShortName(user).slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#111827]">
                      {getUserShortName(user)}
                    </span>
                    <span className="rounded-full bg-[#0A3019] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                      {getRoleLabel(user)}
                    </span>
                  </div>
                </Link>

                {roleToggleOptions.length ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-[#d7e0d9] bg-[#f8faf8] p-1">
                    {roleToggleOptions.map((option) => {
                      const isActiveRole = activeToggleRole === option.role;
                      const isBusy = roleSwitching === option.role;

                      return (
                        <button
                          key={option.role}
                          type="button"
                          onClick={() => handleRoleSwitch(option.role, option.href)}
                          disabled={isInitializing || isRoleSwitchPending}
                          className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                            isActiveRole
                              ? "bg-[#0A3019] text-white"
                              : "text-[#334155] hover:bg-white"
                          } disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                          {isBusy ? "Switching..." : option.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <MobileLink href={accountHref} setOpen={setOpen}>
                  {getAccountLabel(user)}
                </MobileLink>
                <MobileLink href={getPrimaryActionHref(user)} setOpen={setOpen}>
                  {getPrimaryActionLabel(user)}
                </MobileLink>
                {dashboardLinks.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => handleMenuNavigation(link.href, link.role)}
                    className="block text-left text-gray-700 hover:text-green-700"
                  >
                    {link.label}
                  </button>
                ))}
                {canBecomeHero ? (
                  <button
                    type="button"
                    onClick={() => handleMenuNavigation("/registration")}
                    className="block text-left text-gray-700 hover:text-green-700"
                  >
                    Become a Hero
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isInitializing}
                  className="block text-left text-gray-700 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isInitializing ? "Logging Out..." : "Log Out"}
                </button>
              </>
            ) : isHeroPage ? (
              <>
                <MobileLink href="/login" setOpen={setOpen}>
                  Login
                </MobileLink>
                <MobileLink href="/registration" setOpen={setOpen}>
                  Apply as a Hero
                </MobileLink>
              </>
            ) : (
              <>
                <MobileLink href="/login" setOpen={setOpen}>
                  Login
                </MobileLink>
                <MobileLink href="/sign-up" setOpen={setOpen}>
                  Sign Up
                </MobileLink>
                <MobileLink href={guestBookHref} setOpen={setOpen}>
                  Book Yard Work
                </MobileLink>
              </>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

const NavLink = ({ href, active, children }) => (
  <Link
    href={href}
    className={
      active ? "text-black font-bold" : "text-gray-700 hover:text-green-700"
    }
  >
    {children}
  </Link>
);

const MobileLink = ({ href, children, setOpen }) => (
  <Link
    href={href}
    onClick={() => setOpen(false)}
    className="block text-gray-700 hover:text-green-700"
  >
    {children}
  </Link>
);
