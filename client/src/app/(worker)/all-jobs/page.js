"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Car,
  Droplets,
  Home,
  Leaf,
  LoaderCircle,
  MapPin,
  Scissors,
  Sparkles,
  Wind,
} from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings-api";
import { jobsApi } from "@/lib/api/jobs-api";
import { getApiErrorMessage } from "@/lib/api/http";
import { useRequiredRole } from "@/lib/auth/use-required-role";
import { formatPrice } from "@/lib/pricing-content";
import { formatDate } from "@/lib/time";

const PAGE_LIMIT = 100;

const tabs = [
  { id: "new", label: "New Jobs" },
  { id: "assigned", label: "Accepted" },
  { id: "in_progress", label: "In Progress" },
  { id: "pending_verification", label: "Awaiting Approval" },
  { id: "completed", label: "Completed" },
];

const statusLabels = {
  new: "New",
  assigned: "Accepted",
  in_progress: "In Progress",
  pending_verification: "Awaiting Approval",
  completed: "Completed",
};

const timeLabels = {
  anytime: "Any time",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const getServiceIcon = (serviceType = "") => {
  const normalizedValue = String(serviceType).toLowerCase();

  if (normalizedValue.includes("leaf") || normalizedValue.includes("lawn")) {
    return Leaf;
  }

  if (normalizedValue.includes("weed") || normalizedValue.includes("snow")) {
    return Wind;
  }

  if (normalizedValue.includes("trim")) {
    return Scissors;
  }

  if (
    normalizedValue.includes("wash") ||
    normalizedValue.includes("pressure") ||
    normalizedValue.includes("sanit")
  ) {
    return Droplets;
  }

  if (normalizedValue.includes("car") || normalizedValue.includes("vehicle")) {
    return Car;
  }

  if (normalizedValue.includes("home") || normalizedValue.includes("patio")) {
    return Home;
  }

  return Sparkles;
};

const getStatusTone = (status = "new") => {
  if (status === "assigned") {
    return "bg-[#eef7f0] text-[#166534]";
  }

  if (status === "in_progress") {
    return "bg-[#ecfdf3] text-[#027a48]";
  }

  if (status === "completed") {
    return "bg-[#f3f4f6] text-[#4b5563]";
  }

  if (status === "pending_verification") {
    return "bg-[#fff7e6] text-[#b54708]";
  }

  return "bg-[#eff6ff] text-[#1d4ed8]";
};

const formatCurrency = (value) => `$${formatPrice(value || 0)}`;
const formatLocation = (job) =>
  [job?.city, job?.state, job?.zipCode].filter(Boolean).join(", ") || "Location pending";

const formatPreferredDate = (value) => {
  return formatDate(value);
};

const formatSchedule = (job) => {
  if (job?.status === "completed") {
    return "Completed";
  }

  const dateLabel = formatPreferredDate(job?.preferredDate);
  const timeLabel = timeLabels[job?.preferredTime] || job?.preferredTime || "";

  if (dateLabel && timeLabel) {
    return `${dateLabel}, ${timeLabel}`;
  }

  if (dateLabel) {
    return dateLabel;
  }

  if (timeLabel) {
    return timeLabel;
  }

  return "Flexible timing";
};

export default function AllJobsPage() {
  const pathname = usePathname();
  const { user, isRoleReady } = useRequiredRole("worker", pathname);
  const [activeTab, setActiveTab] = useState("new");
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [counts, setCounts] = useState({
    new: 0,
    assigned: 0,
    in_progress: 0,
    pending_verification: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [pendingActionKey, setPendingActionKey] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!isRoleReady) {
      return;
    }

    let isActive = true;

    const loadJobs = async () => {
      setIsLoading(true);

      try {
        const [availableResult, myJobsResult] = await Promise.all([
          jobsApi.listAvailableJobs({
            limit: PAGE_LIMIT,
            includeBooking: false,
            includePayment: false,
            includeTotal: false,
          }),
          jobsApi.listMyJobs({
            limit: PAGE_LIMIT,
            includeSummary: false,
            includeTotal: false,
          }),
        ]);

        if (!isActive) {
          return;
        }

        setAvailableJobs(availableResult.items);
        setMyJobs(myJobsResult.items);
        setCounts({
          new: availableResult.items.length,
          assigned: myJobsResult.items.filter((job) => job.status === "assigned").length,
          in_progress: myJobsResult.items.filter((job) => job.status === "in_progress").length,
          pending_verification: myJobsResult.items.filter(
            (job) => job.status === "pending_verification"
          ).length,
          completed: myJobsResult.items.filter((job) => job.status === "completed").length,
        });
        setPageError("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPageError(getApiErrorMessage(error));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isActive = false;
    };
  }, [isRoleReady, requestVersion, user]);

  const acceptedJobs = myJobs.filter((job) => job.status === "assigned");
  const inProgressJobs = myJobs.filter((job) => job.status === "in_progress");
  const pendingVerificationJobs = myJobs.filter(
    (job) => job.status === "pending_verification"
  );
  const completedJobs = myJobs.filter((job) => job.status === "completed");

  const jobsByTab = {
    new: availableJobs,
    assigned: acceptedJobs,
    in_progress: inProgressJobs,
    pending_verification: pendingVerificationJobs,
    completed: completedJobs,
  };

  const displayedJobs = jobsByTab[activeTab] || [];

  const runAction = async (actionKey, request, successMessage, nextTab) => {
    setPendingActionKey(actionKey);
    setActionError("");
    setActionMessage("");

    try {
      const result = await request();
      const feedback =
        typeof successMessage === "function"
          ? successMessage(result)
          : { type: "success", message: successMessage };

      if (feedback?.type === "warning") {
        setActionError(feedback.message);
      } else {
        setActionMessage(feedback?.message || "Action completed successfully.");
      }

      if (nextTab) {
        setActiveTab(nextTab);
      }

      setRequestVersion((currentValue) => currentValue + 1);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setPendingActionKey("");
    }
  };

  const handleAcceptJob = (jobId) =>
    runAction(
      `accept:${jobId}`,
      () => jobsApi.acceptJob(jobId),
      "Job accepted. It is now in your accepted jobs.",
      "assigned"
    );

  const handleStartJob = (job) => {
    if (!job?.booking?._id) {
      setActionError("This job is missing an active booking record.");
      return;
    }

    runAction(
      `start:${job._id}`,
      () => bookingsApi.startBooking(job.booking._id),
      "Job started successfully.",
      "in_progress"
    );
  };

  if (!isRoleReady) {
    return <div className="min-h-screen bg-[#f6f8f6]" />;
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0f172a]">All Jobs</h1>
            <p className="mt-2 text-sm text-[#52606d]">
              Review open requests, accept new work, and manage the jobs already accepted
              to you.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRequestVersion((currentValue) => currentValue + 1)}
            className="inline-flex items-center justify-center rounded-full border border-[#d7e0d9] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f9fbf9]"
          >
            Refresh Jobs
          </button>
        </div>

        {pageError ? (
          <div className="mb-6 rounded-2xl border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
            {pageError}
          </div>
        ) : null}

        {actionMessage ? (
          <div className="mb-6 rounded-2xl border border-[#cfe5d5] bg-[#f7fbf8] px-4 py-3 text-sm text-[#166534]">
            {actionMessage}
          </div>
        ) : null}

        {actionError ? (
          <div className="mb-6 rounded-2xl border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
            {actionError}
          </div>
        ) : null}

        <div className="mb-8 grid gap-3 rounded-[28px] border border-[#d8e4db] bg-white p-3 md:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-[22px] px-4 py-4 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#0A3019] text-white"
                  : "bg-[#f8faf8] text-[#475569] hover:bg-[#f1f5f2]"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.id ? "bg-white text-[#0A3019]" : "bg-white text-[#475569]"
                }`}
              >
                {counts[tab.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-[#d8e4db] bg-white">
            <div className="flex items-center gap-3 text-sm text-[#52606d]">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading jobs...
            </div>
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="rounded-[28px] border border-[#d8e4db] bg-white px-8 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f7f4]">
              <Sparkles className="h-8 w-8 text-[#7c8a84]" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-[#0f172a]">No jobs here right now</h2>
            <p className="mt-2 text-sm text-[#52606d]">
              {activeTab === "new"
                ? "New customer requests will appear here as soon as they are available."
                : "This tab is empty at the moment."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedJobs.map((job) => {
              const JobIcon = getServiceIcon(job.serviceType);

              return (
                <article
                  key={job._id}
                  className="rounded-[28px] border border-[#d8e4db] bg-white p-6"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f3f7f3] text-[#0A3019]">
                        <JobIcon className="h-6 w-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-semibold text-[#0f172a]">{job.title}</h2>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                              job.status
                            )}`}
                          >
                            {statusLabels[job.status] || job.status}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#52606d]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-[#94a3b8]" />
                            <span>{formatLocation(job)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-[#94a3b8]" />
                            <span>{formatSchedule(job)}</span>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-end gap-5">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                              Job Subtotal
                            </p>
                            <p className="mt-2 text-4xl font-bold text-[#0f172a]">
                              {formatCurrency(job.payment?.jobSubtotal || job.estimatedPrice)}
                            </p>
                          </div>

                          {job.payment?.workerPayout ? (
                            <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                                Estimated Earnings
                              </p>
                              <p className="mt-1 text-lg font-semibold text-[#166534]">
                                {formatCurrency(job.payment.workerPayout)}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 xl:justify-end">
                      <Link
                        href={`/all-jobs/job-details?jobId=${job._id}`}
                        className="inline-flex items-center justify-center rounded-full border border-[#d5ddd7] px-5 py-3 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8faf8]"
                      >
                        Job Details
                      </Link>

                      {job.status === "new" ? (
                        <button
                          type="button"
                          onClick={() => handleAcceptJob(job._id)}
                          disabled={pendingActionKey === `accept:${job._id}`}
                          className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {pendingActionKey === `accept:${job._id}` ? (
                            <>
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                              Accepting...
                            </>
                          ) : (
                            "Accept Job"
                          )}
                        </button>
                      ) : null}

                      {job.status === "assigned" ? (
                        <button
                          type="button"
                          onClick={() => handleStartJob(job)}
                          disabled={
                            pendingActionKey === `start:${job._id}` || !job?.booking?._id
                          }
                          className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {pendingActionKey === `start:${job._id}` ? (
                            <>
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            "Start Job"
                          )}
                        </button>
                      ) : null}

                      {job.status === "in_progress" ? (
                        <Link
                          href={`/all-jobs/job-details?jobId=${job._id}`}
                          className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221]"
                        >
                          Submit Proof
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
