"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  CreditCard,
  LoaderCircle,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings-api";
import { jobsApi } from "@/lib/api/jobs-api";
import { getApiErrorMessage } from "@/lib/api/http";
import {
  buildPathWithSearchParams,
} from "@/lib/auth/auth-redirect";
import JobChatPanel from "@/components/chat/JobChatPanel";
import { resolveApiMediaUrl } from "@/lib/media-url";
import {
  getProofUploadErrorMessage,
  optimizeProofPhotoFile,
  PROOF_PHOTO_REQUIREMENTS,
  PROOF_VIDEO_REQUIREMENTS,
  readProofVideoFile,
  resolveProofMediaUrl,
} from "@/lib/proof-media";
import { formatPrice } from "@/lib/pricing-content";
import { formatDate, formatDateTime } from "@/lib/time";
import { useRequiredRole } from "@/lib/auth/use-required-role";

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
const securedPaymentStatuses = ["authorized", "paid"];

const formatCurrency = (value) => `$${formatPrice(value || 0)}`;
const getPaymentStatusCopy = (paymentStatus = "") => {
  if (paymentStatus === "paid") {
    return "Customer payment was collected through Stripe";
  }

  if (paymentStatus === "authorized") {
    return "In secure hold until Yard Hero approves completion proof";
  }

  if (paymentStatus === "failed") {
    return "Capture failed and needs review";
  }

  if (paymentStatus === "cancelled") {
    return "Authorization was cancelled";
  }

  return "Awaiting payment authorization";
};
const getCompletionFeedback = () => ({
  type: "success",
  message: "Proof submitted. Yard Hero will review the photo and video before payout release.",
});

const formatLocation = (job) =>
  [job?.streetAddress, job?.city, job?.state, job?.zipCode].filter(Boolean).join(", ") ||
  "Address pending";

const formatSchedule = (job) => {
  const dateLabel = formatDate(job?.preferredDate);
  const timeLabel = timeLabels[job?.preferredTime] || job?.preferredTime || "";

  if (dateLabel && timeLabel) {
    return `${dateLabel} • ${timeLabel}`;
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
    label: "Submitted",
    complete: true,
    timestamp: job?.createdAt,
  },
  {
    label: "Accepted",
    complete: job?.status !== "new",
    timestamp: job?.booking?.createdAt || "",
  },
  {
    label: "In Progress",
    complete: ["in_progress", "pending_verification", "completed", "paid"].includes(job?.status),
    timestamp: job?.booking?.startedAt || "",
  },
  {
    label: "Proof Submitted",
    complete: ["pending_verification", "completed", "paid"].includes(job?.status),
    timestamp: job?.booking?.verificationSubmittedAt || job?.booking?.completedAt || "",
  },
  {
    label: "Approved",
    complete: ["completed", "paid"].includes(job?.status),
    timestamp: job?.booking?.verificationApprovedAt || "",
  },
  {
    label: "Customer Payment Secured",
    complete: securedPaymentStatuses.includes(job?.payment?.status),
    timestamp: job?.payment?.paidAt || job?.payment?.authorizedAt || "",
  },
];

function HeroJobDetailsPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId") || "";
  const currentPath = buildPathWithSearchParams(pathname, searchParams);
  const { user, isRoleReady } = useRequiredRole("worker", currentPath);
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [proofPhoto, setProofPhoto] = useState("");
  const [proofVideo, setProofVideo] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [isPreparingProof, setIsPreparingProof] = useState(false);

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

  const runAction = async (actionLabel, request, successMessage) => {
    setPendingAction(actionLabel);
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

      setRequestVersion((currentValue) => currentValue + 1);
    } catch (error) {
      setActionError(getProofUploadErrorMessage(error));
    } finally {
      setPendingAction("");
    }
  };

  const handleAcceptJob = () =>
    runAction("accept", () => jobsApi.acceptJob(jobId), "Job accepted and added to your accepted jobs.");

  const handleStartJob = () => {
    if (!job?.booking?._id) {
      setActionError("This job is missing an active booking record.");
      return;
    }

    runAction(
      "start",
      () => bookingsApi.startBooking(job.booking._id),
      "Job started successfully."
    );
  };

  const handleCompleteJob = () => {
    if (!job?.booking?._id) {
      setActionError("This job is missing an active booking record.");
      return;
    }

    if (!proofPhoto) {
      setActionError("Upload a verification photo before submitting completion.");
      return;
    }

    if (!proofVideo) {
      setActionError("Upload a verification video before submitting completion.");
      return;
    }

    runAction(
      "complete",
      () =>
        bookingsApi.completeBooking(job.booking._id, {
          verificationPhotoUrls: [proofPhoto],
          verificationVideoUrl: proofVideo,
          workerCompletionNotes: proofNotes.trim(),
        }),
      getCompletionFeedback
    );
  };

  const handleProofFileChange = async (kind, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsPreparingProof(true);
    setActionError("");
    setActionMessage("");

    try {
      const dataUrl =
        kind === "photo" ? await optimizeProofPhotoFile(file) : await readProofVideoFile(file);

      if (kind === "photo") {
        setProofPhoto(dataUrl);
      } else {
        setProofVideo(dataUrl);
      }
    } catch (error) {
      setActionError(error?.message || "We could not process that file.");
    } finally {
      setIsPreparingProof(false);
    }
  };

  if (!isRoleReady) {
    return <div className="min-h-screen bg-[#f6f8f6]" />;
  }

  const paymentAmount = job?.payment?.jobSubtotal || job?.estimatedPrice || 0;
  const platformFeePercentage = job?.payment?.platformFeePercentage || 12;
  const platformFee =
    job?.payment?.platformFee ?? Number(((paymentAmount * platformFeePercentage) / 100).toFixed(2));
  const estimatedEarnings =
    job?.payment?.workerPayout ?? Number((paymentAmount - platformFee).toFixed(2));
  const descriptionLines = String(job?.jobDescription || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const timeline = buildTimeline(job);
  const jobPhotoUrls = Array.isArray(job?.photos)
    ? job.photos.map(resolveApiMediaUrl).filter(Boolean)
    : [];
  const verificationPhotoUrls = Array.isArray(job?.booking?.verificationPhotoUrls)
    ? job.booking.verificationPhotoUrls.map(resolveApiMediaUrl).filter(Boolean)
    : [];
  const statusTone =
    job?.status === "completed"
      ? "bg-[#f3f4f6] text-[#4b5563]"
      : job?.status === "in_progress"
        ? "bg-[#ecfdf3] text-[#027a48]"
        : job?.status === "pending_verification"
          ? "bg-[#fff7e6] text-[#b54708]"
        : job?.status === "assigned"
          ? "bg-[#eef7f0] text-[#166534]"
          : "bg-[#eff6ff] text-[#1d4ed8]";

  return (
    <div className="min-h-screen bg-[#f6f8f6] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/all-jobs"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#52606d] transition-colors hover:text-[#0A3019]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to all jobs
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-[#0f172a]">Job Details</h1>
          </div>

          <button
            type="button"
            onClick={() => setRequestVersion((currentValue) => currentValue + 1)}
            className="inline-flex items-center justify-center rounded-full border border-[#d7e0d9] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f9fbf9]"
          >
            Refresh Details
          </button>
        </div>

        {pageError ? (
          <div className="rounded-2xl border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
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

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-[#d8e4db] bg-white">
            <div className="flex items-center gap-3 text-sm text-[#52606d]">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading job details...
            </div>
          </div>
        ) : job ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
                    >
                      {statusLabels[job.status] || job.status}
                    </div>
                    <h2 className="mt-4 text-3xl font-bold text-[#0f172a]">{job.title}</h2>
                    <p className="mt-2 text-sm text-[#52606d]">
                      {job.serviceType || "General yard service"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                      Customer Pays
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[#0f172a]">
                      {formatCurrency(paymentAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                    <Calendar className="mt-0.5 h-5 w-5 text-[#64748b]" />
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">Preferred date</p>
                      <p className="mt-1 text-sm text-[#52606d]">
                        {formatDate(job.preferredDate) || "Flexible"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                    <Clock className="mt-0.5 h-5 w-5 text-[#64748b]" />
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">Preferred time</p>
                      <p className="mt-1 text-sm text-[#52606d]">
                        {timeLabels[job.preferredTime] || job.preferredTime || "Any time"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                  <MapPin className="mt-0.5 h-5 w-5 text-[#64748b]" />
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">Job location</p>
                    <p className="mt-1 text-sm text-[#52606d]">{formatLocation(job)}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                <h3 className="text-xl font-semibold text-[#0f172a]">Customer Information</h3>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf2ed] text-[#0A3019]">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">
                          {job.customer?.name || job.fullName}
                        </p>
                        <p className="text-sm text-[#52606d]">Customer</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-[#64748b]" />
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">
                          {job.customer?.email || job.email || "Email not provided"}
                        </p>
                        <p className="text-sm text-[#52606d]">Email</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <JobChatPanel jobId={job._id} job={job} viewerRole="worker" />

              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                <h3 className="text-xl font-semibold text-[#0f172a]">Job Description</h3>
                <p className="mt-2 text-sm text-[#52606d]">
                  Preferred time: {formatSchedule(job)}
                </p>

                {descriptionLines.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {descriptionLines.map((line, index) => (
                      <div key={`${line}-${index}`} className="flex items-start gap-3">
                        <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0A3019]">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-sm leading-7 text-[#334155]">{line}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-[#52606d]">
                    The customer did not provide a detailed description yet.
                  </p>
                )}

                <div className="mt-6 rounded-2xl border border-[#f0dfaf] bg-[#fffbef] px-4 py-4">
                  <p className="text-sm font-semibold text-[#854d0e]">Hero note</p>
                  <p className="mt-1 text-sm leading-6 text-[#6b7280]">
                    Review the job location and customer description before heading out. If
                    something looks incomplete, confirm with the customer first.
                  </p>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                <h3 className="text-xl font-semibold text-[#0f172a]">Job Photos</h3>

                {jobPhotoUrls.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {jobPhotoUrls.map((photoUrl, index) => (
                      <div
                        key={`${photoUrl}-${index}`}
                        className="overflow-hidden rounded-2xl border border-[#e2e8e3] bg-[#f8faf8]"
                      >
                        <img
                          src={photoUrl}
                          alt={`Job photo ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-[#d8e4db] bg-[#fbfdfb] px-4 py-10 text-center text-sm text-[#52606d]">
                    No photos were uploaded for this job.
                  </div>
                )}
              </section>

              {job.status === "pending_verification" || job.status === "completed" ? (
                <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                  <h3 className="text-xl font-semibold text-[#0f172a]">
                    Completion Proof
                  </h3>

                  {verificationPhotoUrls.length ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {verificationPhotoUrls.map((photoUrl, index) => (
                        <img
                          key={`${photoUrl}-${index}`}
                          src={photoUrl}
                          alt={`Verification photo ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="h-48 w-full rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  ) : null}

                  {job.booking?.verificationVideoUrl ? (
                    <div className="mt-5 rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] p-4">
                      <p className="text-sm font-semibold text-[#111827]">
                        Verification video uploaded
                      </p>
                      <video
                        controls
                        src={resolveProofMediaUrl(job.booking.verificationVideoUrl)}
                        className="mt-4 max-h-[340px] w-full rounded-2xl bg-black"
                      />
                    </div>
                  ) : null}

                  {job.booking?.workerCompletionNotes ? (
                    <div className="mt-5 rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] p-4">
                      <p className="text-sm font-semibold text-[#111827]">Hero notes</p>
                      <p className="mt-2 text-sm leading-6 text-[#52606d]">
                        {job.booking.workerCompletionNotes}
                      </p>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>

            <aside className="space-y-6">
              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6">
                <h3 className="text-xl font-semibold text-[#0f172a]">Payment Breakdown</h3>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm text-[#52606d]">
                    <span>Job subtotal</span>
                    <span className="font-semibold text-[#111827]">
                      {formatCurrency(paymentAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#52606d]">
                    <span>Platform fee ({platformFeePercentage}%)</span>
                    <span className="font-semibold text-[#b42318]">
                      -{formatCurrency(platformFee)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#e2e8e3] pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">Estimated earnings</p>
                      <p className="mt-1 text-xs text-[#6b7280]">
                        Based on the current platform fee setup.
                      </p>
                    </div>
                    <span className="text-3xl font-bold text-[#166534]">
                      {formatCurrency(estimatedEarnings)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 text-[#64748b]" />
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        Customer payment status
                      </p>
                      <p className="mt-1 text-sm text-[#52606d]">
                        {getPaymentStatusCopy(job.payment?.status)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6">
                <h3 className="text-xl font-semibold text-[#0f172a]">Job Status</h3>

                <div className="mt-5 space-y-4">
                  {timeline.map((step) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-4 w-4 rounded-full border ${
                          step.complete
                            ? "border-[#0A3019] bg-[#0A3019]"
                            : "border-[#cbd5e1] bg-white"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            step.complete ? "text-[#111827]" : "text-[#94a3b8]"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.timestamp ? (
                          <p className="mt-1 text-xs text-[#6b7280]">
                            {formatDateTime(step.timestamp)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6">
                <h3 className="text-xl font-semibold text-[#0f172a]">Actions</h3>

                <div className="mt-5 flex flex-col gap-3">
                  {job.status === "new" ? (
                    <button
                      type="button"
                      onClick={handleAcceptJob}
                      disabled={pendingAction === "accept"}
                      className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {pendingAction === "accept" ? (
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
                      onClick={handleStartJob}
                      disabled={pendingAction === "start" || !job?.booking?._id}
                      className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {pendingAction === "start" ? (
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
                    <>
                      <div className="rounded-2xl border border-[#d8e4db] bg-[#fbfdfb] p-4 text-sm text-[#52606d]">
                        Upload both a verification photo and a verification video. Yard Hero will review them before releasing your payout.
                      </div>

                      <label className="text-sm font-medium text-[#334155]">
                        Verification Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleProofFileChange("photo", event)}
                          className="mt-2 block w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm"
                        />
                        <span className="mt-2 block text-xs font-normal text-[#6b7280]">
                          {PROOF_PHOTO_REQUIREMENTS}
                        </span>
                      </label>

                      <label className="text-sm font-medium text-[#334155]">
                        Verification Video
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(event) => handleProofFileChange("video", event)}
                          className="mt-2 block w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm"
                        />
                        <span className="mt-2 block text-xs font-normal text-[#6b7280]">
                          {PROOF_VIDEO_REQUIREMENTS}
                        </span>
                      </label>

                      <label className="text-sm font-medium text-[#334155]">
                        Completion Notes
                        <textarea
                          rows={4}
                          value={proofNotes}
                          onChange={(event) => setProofNotes(event.target.value)}
                          placeholder="Optional notes about what was completed."
                          className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                        />
                      </label>

                      {proofPhoto ? (
                        <img
                          src={proofPhoto}
                          alt="Verification preview"
                          className="rounded-2xl border border-[#d8e4db] object-cover"
                        />
                      ) : null}

                      {proofVideo ? (
                        <video
                          controls
                          src={resolveProofMediaUrl(proofVideo)}
                          className="max-h-[260px] rounded-2xl border border-[#d8e4db] bg-black"
                        />
                      ) : null}

                      <button
                        type="button"
                        onClick={handleCompleteJob}
                        disabled={
                          pendingAction === "complete" ||
                          !job?.booking?._id ||
                          isPreparingProof
                        }
                        className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {pendingAction === "complete" || isPreparingProof ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Completion Proof"
                        )}
                      </button>
                    </>
                  ) : null}

                  {job.status === "pending_verification" ? (
                    <div className="rounded-2xl border border-[#f2dfb5] bg-[#fffaf0] px-4 py-3 text-sm text-[#9a6700]">
                      Your photo and video proof are under Yard Hero review. Payment will stay on hold until approval.
                    </div>
                  ) : null}

                  <Link
                    href="/all-jobs"
                    className="inline-flex items-center justify-center rounded-full border border-[#d5ddd7] px-4 py-3 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8faf8]"
                  >
                    Back to Job List
                  </Link>
                </div>

                {!job?.booking?._id && job?.status !== "new" ? (
                  <div className="mt-4 rounded-2xl border border-[#f2dfb5] bg-[#fffaf0] px-4 py-3 text-sm text-[#9a6700]">
                    This accepted job is missing a booking record, so progress actions are
                    temporarily unavailable.
                  </div>
                ) : null}
              </section>

              <section className="rounded-[28px] border border-[#f1dada] bg-[#fff7f7] p-6">
                <h3 className="text-xl font-semibold text-[#0f172a]">Need Help?</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                  If the address, timing, or job scope looks unsafe or incorrect, contact
                  support before starting the work.
                </p>
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#f0d4d4] bg-white px-4 py-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-[#b42318]" />
                  <p className="text-sm leading-6 text-[#6b7280]">
                    Support contact is not connected yet in this environment.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function HeroJobDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f8f6]" />}>
      <HeroJobDetailsPageContent />
    </Suspense>
  );
}
