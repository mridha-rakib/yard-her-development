"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  CreditCard,
  LoaderCircle,
  Mail,
  MapPin,
  RefreshCw,
  User,
} from "lucide-react";
import { jobsApi } from "@/lib/api/jobs-api";
import { getApiErrorMessage } from "@/lib/api/http";
import {
  buildPathWithSearchParams,
} from "@/lib/auth/auth-redirect";
import JobChatPanel from "@/components/chat/JobChatPanel";
import { resolveApiMediaUrl } from "@/lib/media-url";
import { useRequiredRole } from "@/lib/auth/use-required-role";
import { formatPrice } from "@/lib/pricing-content";
import { formatDate, formatDateTime } from "@/lib/time";

const statusConfig = {
  new: {
    label: "Pending",
    badgeClassName: "bg-[#fff7e6] text-[#b54708]",
  },
  assigned: {
    label: "Accepted",
    badgeClassName: "bg-[#f3e8ff] text-[#7c3aed]",
  },
  in_progress: {
    label: "In Progress",
    badgeClassName: "bg-[#e8f1ff] text-[#1d4ed8]",
  },
  pending_verification: {
    label: "Under Review",
    badgeClassName: "bg-[#fff7e6] text-[#b54708]",
  },
  completed: {
    label: "Completed",
    badgeClassName: "bg-[#e8f7ee] text-[#166534]",
  },
  paid: {
    label: "Paid",
    badgeClassName: "bg-[#eef2f7] text-[#475467]",
  },
  cancelled: {
    label: "Cancelled",
    badgeClassName: "bg-[#fdecec] text-[#b42318]",
  },
};

const timeLabels = {
  anytime: "Any time",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};
const securedPaymentStatuses = ["authorized", "paid"];
const fullDateFormat = {
  month: "long",
  day: "numeric",
  year: "numeric",
};

const formatCurrency = (value) => `$${formatPrice(value || 0)}`;
const formatPaymentStatus = (value = "") =>
  String(value || "pending")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
const getPaymentSummaryCopy = (paymentStatus = "") => {
  if (paymentStatus === "paid") {
    return "Your payment was collected securely through Stripe. Hero payout is released only after Yard Hero approves completion proof.";
  }

  if (paymentStatus === "authorized") {
    return "Your payment method is in a secure hold. Funds are released only after the Hero submits proof and Yard Hero approves the job.";
  }

  if (paymentStatus === "failed") {
    return "We could not capture the payment automatically. Support will need to review it.";
  }

  if (paymentStatus === "cancelled") {
    return "This payment session was cancelled before the card could be authorized.";
  }

  return "We are still waiting for Stripe to authorize the payment method for this booking.";
};

const formatLocation = (job) =>
  [job?.streetAddress, job?.city, job?.state, job?.zipCode].filter(Boolean).join(", ") ||
  "Address pending";

const formatSchedule = (job) => {
  const dateLabel = formatDate(job?.preferredDate, fullDateFormat);
  const timeLabel = timeLabels[job?.preferredTime] || job?.preferredTime || "";

  if (dateLabel && timeLabel) {
    return `${dateLabel} - ${timeLabel}`;
  }

  if (dateLabel) {
    return dateLabel;
  }

  if (timeLabel) {
    return timeLabel;
  }

  return "Flexible timing";
};

const buildTimeline = (job) => [
  {
    label: "Payment secured",
    complete: securedPaymentStatuses.includes(job?.payment?.status),
    detail:
      job?.payment?.status === "paid"
        ? formatDateTime(job?.payment?.paidAt) || "Payment collected through Stripe"
        : job?.payment?.status === "authorized"
          ? formatDateTime(job?.payment?.authorizedAt) ||
            "Card authorized for capture after completion"
          : "Waiting for payment authorization",
  },
  {
    label: "Request submitted",
    complete: true,
    detail: formatDateTime(job?.createdAt) || "Submitted recently",
  },
  {
    label: "Hero accepted",
    complete: Boolean(job?.assignedWorker),
    detail:
      formatDateTime(job?.booking?.createdAt) ||
      (job?.assignedWorker ? "Hero accepted" : "We are finding a Hero"),
  },
  {
    label: "Work started",
    complete: ["in_progress", "pending_verification", "completed", "paid"].includes(job?.status),
    detail:
      formatDateTime(job?.booking?.startedAt) ||
      (job?.status === "in_progress" ? "In progress" : "Not started yet"),
  },
  {
    label: "Proof submitted",
    complete: ["pending_verification", "completed", "paid"].includes(job?.status),
    detail:
      formatDateTime(job?.booking?.verificationSubmittedAt || job?.booking?.completedAt) ||
      (["pending_verification", "completed", "paid"].includes(job?.status)
        ? "Hero proof submitted for review"
        : "Pending"),
  },
  {
    label: "Yard Hero approval",
    complete: ["completed", "paid"].includes(job?.status),
    detail:
      formatDateTime(job?.booking?.verificationApprovedAt) ||
      (["completed", "paid"].includes(job?.status)
        ? "Approved"
        : "Waiting for Yard Hero review"),
  },
];

function TimelineStep({ item }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
          item.complete ? "bg-[#0A3019] text-white" : "bg-[#eef2f0] text-[#98a2b3]"
        }`}
      >
        {item.complete ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
      </div>
      <div>
        <p className={`text-sm font-semibold ${item.complete ? "text-[#111827]" : "text-[#475467]"}`}>
          {item.label}
        </p>
        <p className="mt-1 text-sm text-[#6b7280]">{item.detail}</p>
      </div>
    </div>
  );
}

function BookingDetailsPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId") || "";
  const currentPath = buildPathWithSearchParams(pathname, searchParams);
  const { user, isAuthenticated, isRoleReady } = useRequiredRole("customer", currentPath);
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!isRoleReady) {
      return;
    }

    if (!jobId) {
      setPageError("A job id is missing from this page URL.");
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadJob = async () => {
      setIsLoading(true);

      try {
        const nextJob = await jobsApi.getJobById(jobId);

        if (!isActive) {
          return;
        }

        setJob(nextJob);
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

    loadJob();

    return () => {
      isActive = false;
    };
  }, [isRoleReady, jobId, requestVersion, user]);

  if (!isRoleReady) {
    return <div className="min-h-screen bg-[#f6f8f6]" />;
  }

  const status = statusConfig[job?.status] || statusConfig.new;
  const amount = job?.payment?.amount || job?.estimatedPrice || 0;
  const jobSubtotal = job?.payment?.jobSubtotal || job?.estimatedPrice || amount;
  const bookingFee = Number(job?.payment?.bookingFee || 0);
  const timeline = buildTimeline(job);
  const jobPhotoUrls = Array.isArray(job?.photos)
    ? job.photos.map(resolveApiMediaUrl).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#f6f8f6] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/myjobs"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#52606d] transition-colors hover:text-[#0A3019]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to my jobs
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-[#0f172a]">Job Details</h1>
          </div>

          <button
            type="button"
            onClick={() => setRequestVersion((currentValue) => currentValue + 1)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7e0d9] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f9fbf9]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Details
          </button>
        </div>

        {pageError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{pageError}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-[#d8e4db] bg-white">
            <div className="flex items-center gap-3 text-sm text-[#52606d]">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading job details...
            </div>
          </div>
        ) : job ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClassName}`}
                    >
                      {status.label}
                    </span>
                    <h2 className="mt-4 text-3xl font-bold text-[#0f172a]">{job.title}</h2>
                    <p className="mt-2 text-sm text-[#52606d]">
                      {job.serviceType || "General yard service"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                      Checkout Total
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[#0f172a]">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 text-[#64748b]" />
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">Submitted</p>
                        <p className="mt-1 text-sm text-[#52606d]">
                          {formatDate(job.createdAt, fullDateFormat) || "Recently submitted"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-5 w-5 text-[#64748b]" />
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">Preferred time</p>
                        <p className="mt-1 text-sm text-[#52606d]">{formatSchedule(job)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-[#64748b]" />
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">Service address</p>
                      <p className="mt-1 text-sm text-[#52606d]">{formatLocation(job)}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                <h3 className="text-xl font-semibold text-[#0f172a]">Job Description</h3>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#475467]">
                  {job.jobDescription || "No job description was provided."}
                </p>

                {jobPhotoUrls.length ? (
                  <div className="mt-8">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                      Uploaded Photos
                    </h4>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {jobPhotoUrls.map((photoUrl, index) => (
                        <img
                          key={`${photoUrl}-${index}`}
                          src={photoUrl}
                          alt={`Job photo ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="h-40 w-full rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <JobChatPanel jobId={job._id} job={job} viewerRole="customer" />
            </div>

            <aside className="space-y-6">
              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6">
                <h3 className="text-xl font-semibold text-[#0f172a]">Accepted Hero</h3>

                {job.assignedWorker ? (
                  <div className="mt-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2f0] text-[#334155]">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#111827]">{job.assignedWorker.name}</p>
                        <p className="mt-1 text-sm text-[#52606d]">
                          {Array.isArray(job.assignedWorker.skills) &&
                          job.assignedWorker.skills.length
                            ? job.assignedWorker.skills.join(", ")
                            : "Yard service professional"}
                        </p>
                      </div>
                    </div>

                  {job.assignedWorker.email ? (
                    <div className="flex items-center gap-3 text-sm text-[#52606d]">
                      <Mail className="h-4 w-4" />
                      <span>{job.assignedWorker.email}</span>
                    </div>
                  ) : null}

                  {Array.isArray(job.assignedWorker.portfolioItems) &&
                  job.assignedWorker.portfolioItems.length ? (
                    <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] p-4">
                      <p className="text-sm font-semibold text-[#111827]">
                        Portfolio highlights
                      </p>
                      <div className="mt-4 grid gap-3">
                        {job.assignedWorker.portfolioItems.slice(0, 3).map((item) => (
                          <div
                            key={item.id || item.imageUrl}
                            className="overflow-hidden rounded-2xl border border-[#d8e4db] bg-white"
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title || "Portfolio item"}
                                className="h-36 w-full object-cover"
                              />
                            ) : null}
                            <div className="p-3">
                              <p className="text-sm font-semibold text-[#111827]">
                                {item.title || item.serviceType || "Completed project"}
                              </p>
                              {item.description ? (
                                <p className="mt-1 text-xs leading-5 text-[#52606d]">
                                  {item.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-[#e8eee9] bg-[#fbfdfb] px-4 py-4 text-sm leading-7 text-[#52606d]">
                    Your request is in the queue. The first available Hero who accepts it will
                    appear here automatically.
                  </div>
                )}
              </section>

              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6">
                <h3 className="text-xl font-semibold text-[#0f172a]">Payment</h3>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#52606d]">Job subtotal</span>
                    <span className="text-sm font-semibold text-[#111827]">
                      {formatCurrency(jobSubtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#52606d]">Service Fee</span>
                    <span className="text-sm font-semibold text-[#111827]">
                      {formatCurrency(bookingFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#e2e8e3] pt-4">
                    <span className="text-sm font-semibold text-[#52606d]">Total paid</span>
                    <span className="text-sm font-semibold text-[#111827]">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#52606d]">Status</span>
                    <span className="text-sm font-semibold text-[#111827]">
                      {formatPaymentStatus(job.payment?.status || job.paymentStatus || "pending")}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                    <CreditCard className="mt-0.5 h-5 w-5 text-[#64748b]" />
                    <p className="text-sm text-[#52606d]">
                      {getPaymentSummaryCopy(job.payment?.status || job.paymentStatus || "pending")}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6">
                <h3 className="text-xl font-semibold text-[#0f172a]">Timeline</h3>
                <div className="mt-5 space-y-5">
                  {timeline.map((item) => (
                    <TimelineStep key={item.label} item={item} />
                  ))}
                </div>
              </section>

              <div className="flex flex-col gap-3">
                <Link
                  href="/myjobs"
                  className="inline-flex items-center justify-center rounded-full border border-[#d7e0d9] bg-white px-4 py-3 font-semibold text-[#0f172a] transition-colors hover:bg-[#f9fbf9]"
                >
                  Back to My Jobs
                </Link>
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#0d3d20]"
                >
                  Book Another Job
                </Link>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f8f6]" />}>
      <BookingDetailsPageContent />
    </Suspense>
  );
}
