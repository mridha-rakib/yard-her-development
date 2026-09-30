"use client";

import { useEffect, useState } from "react";
import {
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  SendHorizontal,
} from "lucide-react";
import { jobChatApi } from "@/lib/api/job-chat-api";
import { getApiErrorMessage } from "@/lib/api/http";
import { formatDateTime } from "@/lib/time";

const POLL_INTERVAL_MS = 15000;

const getParticipant = (viewerRole, job) =>
  viewerRole === "customer" ? job?.assignedWorker || null : job?.customer || null;

const getEmptyStateCopy = (viewerRole, job) => {
  if (!job?.assignedWorker) {
    return viewerRole === "customer"
      ? "Chat unlocks as soon as a Hero accepts your request."
      : "Accept this job first to message the customer.";
  }

  return "Messages for this job will appear here.";
};

export default function JobChatPanel({ jobId = "", job = null, viewerRole = "customer" }) {
  const participant = getParticipant(viewerRole, job);
  const hasAssignedWorker = Boolean(job?.assignedWorker?._id || job?.assignedWorker);
  const isEnabled = Boolean(jobId) && hasAssignedWorker;
  const [conversation, setConversation] = useState(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(isEnabled));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!isEnabled) {
      setConversation(null);
      setLoadError("");
      setIsLoading(false);
      return undefined;
    }

    let isActive = true;

    const loadConversation = async ({ silent = false } = {}) => {
      if (!silent && isActive) {
        setIsLoading(true);
      }

      if (silent && isActive) {
        setIsRefreshing(true);
      }

      try {
        const nextConversation = await jobChatApi.getConversation(jobId);

        if (!isActive) {
          return;
        }

        setConversation(nextConversation);
        setLoadError("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(getApiErrorMessage(error));
      } finally {
        if (!isActive) {
          return;
        }

        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    loadConversation();
    const intervalId = window.setInterval(() => {
      loadConversation({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [isEnabled, jobId]);

  const handleRefresh = async () => {
    if (!isEnabled) {
      return;
    }

    setIsRefreshing(true);
    setLoadError("");

    try {
      const nextConversation = await jobChatApi.getConversation(jobId);
      setConversation(nextConversation);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    const message = draftMessage.trim();

    if (!message || !isEnabled) {
      return;
    }

    setIsSending(true);
    setLoadError("");

    try {
      const nextConversation = await jobChatApi.addMessage(jobId, {
        message,
      });
      setConversation(nextConversation);
      setDraftMessage("");
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef6ef] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0A3019]">
            <MessageCircle className="h-3.5 w-3.5" />
            Job Chat
          </div>
          <h3 className="mt-4 text-xl font-semibold text-[#0f172a]">
            Message {viewerRole === "customer" ? "your Hero" : "the customer"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#52606d]">
            Keep every question and update tied to this job so both sides stay aligned.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={!isEnabled || isRefreshing || isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7e0d9] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f9fbf9] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRefreshing ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh chat
        </button>
      </div>

      {participant ? (
        <div className="mt-5 rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
          <p className="text-sm font-semibold text-[#111827]">
            {participant.name || (viewerRole === "customer" ? "Assigned Hero" : "Customer")}
          </p>
          {participant.email ? (
            <p className="mt-1 text-sm text-[#52606d]">{participant.email}</p>
          ) : null}
        </div>
      ) : null}

      {!isEnabled ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#d8e4db] bg-[#fbfdfb] px-4 py-10 text-center text-sm leading-7 text-[#52606d]">
          {getEmptyStateCopy(viewerRole, job)}
        </div>
      ) : isLoading ? (
        <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb]">
          <div className="flex items-center gap-3 text-sm text-[#52606d]">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading chat...
          </div>
        </div>
      ) : (
        <>
          {loadError ? (
            <div className="mt-6 rounded-2xl border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
              {loadError}
            </div>
          ) : null}

          <div className="mt-6 space-y-4 rounded-[24px] border border-[#e2e8e3] bg-[#fbfdfb] p-4">
            {(conversation?.messages || []).length ? (
              conversation.messages.map((message, index) => {
                const isOwnMessage = message?.senderRole === viewerRole;

                return (
                  <div
                    key={`${message?.createdAt || "message"}-${index}`}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[24px] px-4 py-3 ${
                        isOwnMessage
                          ? "bg-[#0A3019] text-white"
                          : "border border-[#dce6de] bg-white text-[#111827]"
                      }`}
                    >
                      <div
                        className={`flex flex-wrap items-center gap-2 text-xs ${
                          isOwnMessage ? "text-white/80" : "text-[#6b7280]"
                        }`}
                      >
                        <span className="font-semibold">
                          {message?.senderName || "Yard Hero user"}
                        </span>
                        <span>{formatDateTime(message?.createdAt) || "Just now"}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                        {message?.message}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d8e4db] bg-white px-4 py-10 text-center text-sm leading-7 text-[#52606d]">
                Start the conversation when you need to confirm arrival time, property details, or
                job-specific questions.
              </div>
            )}
          </div>

          <div className="mt-5 space-y-3">
            <label className="block text-sm font-medium text-[#334155]">
              Message
              <textarea
                rows={4}
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder={
                  viewerRole === "customer"
                    ? "Ask about timing, access instructions, or anything specific to the job."
                    : "Update the customer about arrival, questions, or anything you need confirmed."
                }
                className="mt-2 w-full rounded-[24px] border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#6b7280]">
                Messages stay attached to this job for accountability and review if needed.
              </p>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={isSending || !draftMessage.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A3019] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d3d20] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="h-4 w-4" />
                    Send message
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
