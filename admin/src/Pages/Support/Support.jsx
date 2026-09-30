import React, { useEffect, useMemo, useState } from "react";
import { Check, Copy, LoaderCircle, Search, Send } from "lucide-react";
import { adminApi } from "../../lib/api/admin-api";
import { getApiErrorMessage } from "../../lib/api/http";

const ROLE_BADGE_CLASSES = {
  customer: "bg-blue-500 text-white",
  worker: "bg-green-500 text-white",
  admin: "bg-gray-900 text-white",
  guest: "bg-gray-200 text-gray-700",
  system: "bg-amber-100 text-amber-700",
};

const STATUS_CLASSES = {
  open: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  resolved: "bg-green-50 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS = {
  open: "Unread",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const formatRoleLabel = (role) =>
  String(role || "guest")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatRelativeTime = (value) => {
  if (!value) {
    return "Unknown";
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Unknown";
  }

  const elapsedSeconds = Math.max(Math.floor((Date.now() - timestamp) / 1000), 0);

  if (elapsedSeconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(elapsedSeconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
};

const formatMessageTimestamp = (value) => {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getConversationTimestamp = (conversation) =>
  conversation?.lastMessageAt ||
  conversation?.messages?.[conversation.messages.length - 1]?.createdAt ||
  conversation?.updatedAt ||
  conversation?.createdAt ||
  null;

const getConversationPreview = (conversation) => {
  const lastMessage = conversation?.messages?.[conversation.messages.length - 1];
  return lastMessage?.message || "No messages yet";
};

const sortConversations = (items = []) =>
  [...items].sort((left, right) => {
    const leftTime = new Date(getConversationTimestamp(left) || 0).getTime();
    const rightTime = new Date(getConversationTimestamp(right) || 0).getTime();
    return rightTime - leftTime;
  });

const upsertConversation = (items = [], conversation) =>
  sortConversations([conversation, ...items.filter((item) => item._id !== conversation._id)]);

const getDraftKey = (conversationId) => `admin-support-draft:${conversationId}`;

const Support = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [reply, setReply] = useState("");
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [statusAction, setStatusAction] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let ignore = false;

    const loadConversations = async () => {
      setIsLoadingList(true);
      setListError("");

      try {
        const response = await adminApi.listSupportConversations({
          limit: 100,
          ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
        });

        if (ignore) {
          return;
        }

        const nextItems = sortConversations(response.items || []);
        setConversations(nextItems);
        setSelectedConversationId((currentValue) => {
          if (currentValue && nextItems.some((item) => item._id === currentValue)) {
            return currentValue;
          }

          return nextItems[0]?._id || "";
        });

        if (nextItems.length === 0) {
          setSelectedConversation(null);
        }
      } catch (apiError) {
        if (!ignore) {
          setConversations([]);
          setSelectedConversationId("");
          setSelectedConversation(null);
          setListError(getApiErrorMessage(apiError));
        }
      } finally {
        if (!ignore) {
          setIsLoadingList(false);
        }
      }
    };

    loadConversations();

    return () => {
      ignore = true;
    };
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (!selectedConversationId) {
      setSelectedConversation(null);
      setReply("");
      setDetailError("");
      return;
    }

    let ignore = false;

    const loadConversation = async () => {
      setIsLoadingConversation(true);
      setDetailError("");

      try {
        const conversation = await adminApi.getSupportConversation(selectedConversationId);

        if (ignore) {
          return;
        }

        setSelectedConversation(conversation);
        setConversations((currentValue) => upsertConversation(currentValue, conversation));
      } catch (apiError) {
        if (!ignore) {
          setSelectedConversation(null);
          setDetailError(getApiErrorMessage(apiError));
        }
      } finally {
        if (!ignore) {
          setIsLoadingConversation(false);
        }
      }
    };

    setReply(window.localStorage.getItem(getDraftKey(selectedConversationId)) || "");
    loadConversation();

    return () => {
      ignore = true;
    };
  }, [selectedConversationId]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const unreadCount = useMemo(
    () => conversations.filter((conversation) => conversation.status === "open").length,
    [conversations]
  );

  const handleCopyContact = async () => {
    if (!selectedConversation) {
      return;
    }

    const contactDetails = [
      selectedConversation.requesterName,
      selectedConversation.requesterEmail,
      selectedConversation.user?.phone,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(contactDetails);
      setNotice("Contact copied.");
    } catch {
      setDetailError("Unable to copy contact details.");
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedConversationId) {
      return;
    }

    setStatusAction(status);
    setDetailError("");

    try {
      const conversation = await adminApi.updateSupportConversationStatus(
        selectedConversationId,
        status
      );
      setSelectedConversation(conversation);
      setConversations((currentValue) => upsertConversation(currentValue, conversation));
      setNotice(
        status === "resolved"
          ? "Conversation marked as resolved."
          : "Conversation marked as read."
      );
    } catch (apiError) {
      setDetailError(getApiErrorMessage(apiError));
    } finally {
      setStatusAction("");
    }
  };

  const handleSaveDraft = () => {
    if (!selectedConversationId) {
      return;
    }

    window.localStorage.setItem(getDraftKey(selectedConversationId), reply);
    setNotice("Draft saved locally.");
  };

  const handleSendReply = async () => {
    const message = reply.trim();

    if (!selectedConversationId || !message) {
      return;
    }

    setIsSendingReply(true);
    setDetailError("");

    try {
      const conversation = await adminApi.replyToSupportConversation(selectedConversationId, {
        message,
      });

      setSelectedConversation(conversation);
      setConversations((currentValue) => upsertConversation(currentValue, conversation));
      setReply("");
      window.localStorage.removeItem(getDraftKey(selectedConversationId));
      setNotice("Reply sent successfully.");
    } catch (apiError) {
      setDetailError(getApiErrorMessage(apiError));
    } finally {
      setIsSendingReply(false);
    }
  };

  const selectedStatusLabel = STATUS_LABELS[selectedConversation?.status] || "Unread";
  const selectedStatusClasses =
    STATUS_CLASSES[selectedConversation?.status] || "bg-blue-50 text-blue-700";

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-16">
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex min-h-[calc(100vh-8rem)] flex-col xl:flex-row">
          <div className="flex w-full shrink-0 flex-col border-b border-gray-200 xl:w-[380px] xl:border-b-0 xl:border-r">
            <div className="border-b border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white">
                  {unreadCount} unread
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search messages..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingList ? (
                <div className="flex h-full items-center justify-center p-6 text-sm text-gray-500">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Loading messages...
                </div>
              ) : listError ? (
                <div className="p-6 text-sm text-red-600">{listError}</div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">
                  No support conversations found.
                </div>
              ) : (
                conversations.map((conversation) => {
                  const role = conversation.requesterRole || conversation.user?.role || "guest";

                  return (
                    <button
                      key={conversation._id}
                      type="button"
                      onClick={() => setSelectedConversationId(conversation._id)}
                      className={`w-full border-b border-gray-200 p-4 text-left transition hover:bg-gray-50 ${
                        selectedConversationId === conversation._id ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            ROLE_BADGE_CLASSES[role] || ROLE_BADGE_CLASSES.guest
                          }`}
                        >
                          {formatRoleLabel(role)}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-gray-900">
                                {conversation.requesterName}
                              </span>
                              {conversation.status === "open" ? (
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                              ) : null}
                            </div>
                            <span className="shrink-0 text-xs text-gray-500">
                              {formatRelativeTime(getConversationTimestamp(conversation))}
                            </span>
                          </div>

                          <div className="mb-1 truncate text-xs text-gray-500">
                            {conversation.requesterEmail}
                          </div>
                          <div className="mb-1 truncate text-sm font-medium text-gray-900">
                            {conversation.subject}
                          </div>
                          <div className="truncate text-xs text-gray-500">
                            {getConversationPreview(conversation)}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col bg-white">
            {!selectedConversationId && !isLoadingList ? (
              <div className="flex h-full items-center justify-center p-10 text-center text-sm text-gray-500">
                Select a support conversation to review the thread and reply.
              </div>
            ) : isLoadingConversation && !selectedConversation ? (
              <div className="flex h-full items-center justify-center p-10 text-sm text-gray-500">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Loading conversation...
              </div>
            ) : selectedConversation ? (
              <>
                <div className="border-b border-gray-200 p-6">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`rounded px-3 py-1 text-xs font-medium ${
                          ROLE_BADGE_CLASSES[
                            selectedConversation.requesterRole ||
                              selectedConversation.user?.role ||
                              "guest"
                          ] || ROLE_BADGE_CLASSES.guest
                        }`}
                      >
                        {formatRoleLabel(
                          selectedConversation.requesterRole ||
                            selectedConversation.user?.role ||
                            "guest"
                        )}
                      </span>

                      <div className="min-w-0">
                        <h3 className="truncate text-2xl font-semibold text-gray-900">
                          {selectedConversation.requesterName}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span>{selectedConversation.requesterEmail}</span>
                          <span className="text-gray-300">|</span>
                          <span>
                            Received {formatRelativeTime(getConversationTimestamp(selectedConversation))}
                          </span>
                          {selectedConversation.user?.phone ? (
                            <>
                              <span className="text-gray-300">|</span>
                              <span>{selectedConversation.user.phone}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${selectedStatusClasses}`}
                    >
                      {selectedStatusLabel}
                    </span>
                  </div>

                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    {selectedConversation.subject}
                  </h2>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("in_progress")}
                      disabled={
                        !selectedConversationId ||
                        statusAction === "in_progress" ||
                        selectedConversation.status !== "open"
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {statusAction === "in_progress" ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Mark as Read
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("resolved")}
                      disabled={
                        !selectedConversationId ||
                        statusAction === "resolved" ||
                        selectedConversation.status === "resolved"
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {statusAction === "resolved" ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Mark as Resolved
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyContact}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Contact
                    </button>
                  </div>

                  {detailError ? (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {detailError}
                    </div>
                  ) : null}

                  {notice ? (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {notice}
                    </div>
                  ) : null}
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50/70 p-6">
                  <div className="mx-auto flex max-w-4xl flex-col gap-4">
                    {selectedConversation.messages?.map((message, index) => {
                      const isAdminMessage = message.senderRole === "admin";
                      const role = message.senderRole || "guest";

                      return (
                        <div
                          key={`${message.createdAt || "message"}-${index}`}
                          className={`flex ${isAdminMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-2xl rounded-2xl border px-4 py-4 shadow-sm ${
                              isAdminMessage
                                ? "border-[#0A3019] bg-[#0A3019] text-white"
                                : "border-gray-200 bg-white text-gray-900"
                            }`}
                          >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded px-2 py-1 text-[11px] font-medium ${
                                  isAdminMessage
                                    ? "bg-white/15 text-white"
                                    : ROLE_BADGE_CLASSES[role] || ROLE_BADGE_CLASSES.guest
                                }`}
                              >
                                {isAdminMessage ? "Admin" : formatRoleLabel(role)}
                              </span>
                              <span
                                className={`text-xs ${
                                  isAdminMessage ? "text-white/80" : "text-gray-500"
                                }`}
                              >
                                {message.senderName}
                              </span>
                              <span
                                className={`text-xs ${
                                  isAdminMessage ? "text-white/70" : "text-gray-400"
                                }`}
                              >
                                {formatMessageTimestamp(message.createdAt)}
                              </span>
                            </div>

                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {message.message}
                            </p>

                            {message.attachments?.length ? (
                              <div className="mt-3 space-y-2">
                                {message.attachments.map((attachment) => (
                                  <a
                                    key={attachment}
                                    href={attachment}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`block text-xs underline ${
                                      isAdminMessage ? "text-white/90" : "text-blue-600"
                                    }`}
                                  >
                                    {attachment}
                                  </a>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-200 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Send Reply</h3>
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Type your response..."
                    className="h-40 w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={!selectedConversationId}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={!reply.trim() || isSendingReply}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-6 py-2 text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingReply ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send Reply
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-sm text-gray-500">
                {detailError || "Select a support conversation to review the thread and reply."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
