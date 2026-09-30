import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdNotifications } from "react-icons/io";
import {
  Bell,
  BriefcaseBusiness,
  CheckCheck,
  CreditCard,
  LifeBuoy,
  UserPlus,
} from "lucide-react";
import { notificationsApi } from "../../lib/api/notifications-api";
import { useAuthStore } from "../../stores/use-auth-store";

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("") || "A";

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

  if (notification?.category === "job" || notification?.category === "booking") {
    return BriefcaseBusiness;
  }

  if (notification?.category === "account" || notification?.type?.includes("worker")) {
    return UserPlus;
  }

  return Bell;
};

const Header = ({ showDrawer }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const adminProfile = useAuthStore((state) => state.user);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const loadNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!adminProfile?._id) {
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
  }, [adminProfile?._id]);

  useEffect(() => {
    loadNotifications({ silent: false });

    if (!adminProfile?._id) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadNotifications({ silent: true });
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [adminProfile?._id, loadNotifications]);

  useEffect(() => {
    if (!showNotifications) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [showNotifications]);

  const handleNotificationOpen = async () => {
    const nextOpenValue = !showNotifications;
    setShowNotifications(nextOpenValue);

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
        // Keep navigation even if the notification API is temporarily unavailable.
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

    setShowNotifications(false);

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
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

  return (
    <div ref={dropdownRef} className="relative">
      <div className="flex min-h-20 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <RxHamburgerMenu
            className="cursor-pointer text-2xl text-blue-800 lg:hidden"
            onClick={showDrawer}
          />
          <div>
            <h2 className="text-2xl font-bold text-[#202326]">Admin Dashboard</h2>
            <p className="text-sm text-gray-500">Platform Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative rounded-full p-2 transition hover:bg-blue-50"
            onClick={handleNotificationOpen}
          >
            <IoMdNotifications className="text-xl" />
            {notificationsCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {notificationsCount > 9 ? "9+" : notificationsCount}
              </span>
            )}
          </button>

          <Link to="/settings">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-500 p-2 text-blue-700 transition hover:bg-blue-50">
              {adminProfile?.profilePhotoUrl ? (
                <img
                  src={adminProfile.profilePhotoUrl}
                  alt={adminProfile?.name || "Admin"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {getInitials(adminProfile?.name || "Admin")}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {showNotifications && (
        <div className="absolute right-4 top-[72px] z-50 w-96 rounded-2xl border border-[#dbe4ea] bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-[#edf1f4] pb-3">
            <div>
              <h2 className="text-lg font-semibold text-[#2c3e50]">Notifications</h2>
              <p className="text-xs text-gray-500">
                {notificationsCount
                  ? `${notificationsCount} unread notification${notificationsCount === 1 ? "" : "s"}`
                  : "You're all caught up."}
              </p>
            </div>

            {notificationsCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-semibold text-[#1d4ed8] transition hover:bg-[#e1efff]"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
            {isLoadingNotifications ? (
              <div className="rounded-xl border border-dashed border-[#d9e2e8] px-4 py-8 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length ? (
              notifications.map((item) => {
                const Icon = getNotificationIcon(item);

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      item.isRead
                        ? "border-[#edf1f4] bg-white hover:bg-[#f8fafc]"
                        : "border-[#d8e7ff] bg-[#f7fbff] hover:bg-[#eff6ff]"
                    }`}
                  >
                    <div className="rounded-xl bg-[#f1f5f9] p-2 text-[#1e293b]">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-[#1e293b]">{item.title}</p>
                        {!item.isRead ? (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2563eb]" />
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[#475569]">{item.message}</p>
                      <p className="mt-2 text-xs text-gray-500">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-[#d9e2e8] px-4 py-8 text-center text-sm text-gray-500">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
