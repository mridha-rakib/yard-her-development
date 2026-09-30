"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  LoaderCircle,
  MapPin,
  Plus,
  User,
} from "lucide-react";
import { jobsApi } from "@/lib/api/jobs-api";
import { getApiErrorMessage } from "@/lib/api/http";
import { useRequiredRole } from "@/lib/auth/use-required-role";
import { formatPrice } from "@/lib/pricing-content";
import { formatDate } from "@/lib/time";

const PAGE_LIMIT = 100;
const fullDateFormat = {
  month: "long",
  day: "numeric",
  year: "numeric",
};

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

const formatCurrency = (value) => `$${formatPrice(value || 0)}`;

const formatLocation = (job) =>
  [job?.streetAddress, job?.city, job?.state, job?.zipCode]
    .filter(Boolean)
    .join(", ") || "Address pending";

const formatSubmittedDate = (value) =>
  formatDate(value, fullDateFormat) || "Recently submitted";

const getTotalAmount = (job) => job?.payment?.amount || job?.estimatedPrice || 0;

const getHeroLabel = (job) => {
  if (!job?.assignedWorker?.name) {
    return "";
  }

  const skillLabel = Array.isArray(job.assignedWorker.skills) && job.assignedWorker.skills.length
    ? ` - ${job.assignedWorker.skills[0]}`
    : "";

  return `${job.assignedWorker.name}${skillLabel}`;
};

const getPendingNote = (job) => {
  if (job?.status === "new") {
    return "We are finding the first available Hero for this job.";
  }

  if (job?.status === "cancelled") {
    return job?.cancelReason || "This request has been cancelled.";
  }

  if (job?.status === "pending_verification") {
    return "The Hero submitted photo and video proof. Yard Hero is reviewing the job before payment release.";
  }

  return "";
};

function JobCard({ job }) {
  const status = statusConfig[job.status] || statusConfig.new;
  const workerLabel = getHeroLabel(job);
  const pendingNote = getPendingNote(job);

  return (
    <article className="rounded-[24px] border border-[#d8e4db] bg-white p-6 transition-colors hover:border-[#c6d8cb]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-[#0f172a]">{job.title}</h2>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClassName}`}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-2 text-sm text-[#52606d]">
            {job.serviceType || "General yard service"}
          </p>

          <div className="mt-5 space-y-3 text-sm text-[#52606d]">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formatLocation(job)}</span>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Submitted on {formatSubmittedDate(job.createdAt)}</span>
            </div>
          </div>

          {workerLabel ? (
            <div className="mt-5 flex items-center gap-3 border-t border-[#edf2ed] pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2f0] text-[#4b5563]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">{workerLabel}</p>
                <p className="text-xs text-[#6b7280]">Hero</p>
              </div>
            </div>
          ) : pendingNote ? (
            <div className="mt-5 rounded-2xl border border-[#e8eee9] bg-[#fbfdfb] px-4 py-3 text-sm text-[#52606d]">
              {pendingNote}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="w-full rounded-2xl border border-[#e1e8e3] bg-[#fbfdfb] px-5 py-4 md:w-auto md:min-w-[170px]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              Total
            </p>
            <p className="mt-2 text-3xl font-bold text-[#0f172a]">
              {formatCurrency(getTotalAmount(job))}
            </p>
          </div>

          <Link
            href={`/booking-details?jobId=${job._id}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d3d20]"
          >
            View Job Details
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function MyJobsPage() {
  const pathname = usePathname();
  const { user, isAuthenticated, isRoleReady } = useRequiredRole("customer", pathname);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!isRoleReady) {
      return;
    }

    let isActive = true;

    const loadJobs = async () => {
      setIsLoading(true);

      try {
        const result = await jobsApi.listMyJobs({
          limit: PAGE_LIMIT,
          includeSummary: false,
          includeOperational: false,
          includeTotal: false,
        });

        if (!isActive) {
          return;
        }

        setJobs(result.items || []);
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

  if (!isRoleReady) {
    return <div className="min-h-screen bg-[#f6f8f6]" />;
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6]">
      <header className="border-b border-[#d8e4db] bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <h1 className="text-3xl font-bold text-[#0f172a]">My Jobs</h1>
          <p className="mt-2 text-sm text-[#52606d]">
            Track your requests, Hero acceptance, and job progress in one place.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {pageError ? (
          <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-[#f2d0d0] bg-[#fff8f8] px-5 py-4 text-sm text-[#b42318] md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{pageError}</p>
            </div>
            <button
              type="button"
              onClick={() => setRequestVersion((currentValue) => currentValue + 1)}
              className="inline-flex items-center justify-center rounded-full border border-[#f2d0d0] bg-white px-4 py-2 font-semibold text-[#b42318] transition-colors hover:bg-[#fff1f1]"
            >
              Try Again
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-[28px] border border-[#d8e4db] bg-white">
            <div className="flex items-center gap-3 text-sm text-[#52606d]">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading your jobs...
            </div>
          </div>
        ) : jobs.length ? (
          <div className="space-y-5">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[#c9d7cd] bg-white px-6 py-14 text-center">
            <h2 className="text-2xl font-semibold text-[#0f172a]">No jobs yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#52606d]">
              Once you book a yard service, it will appear here with Hero acceptance and
              status updates.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 rounded-full bg-[#0A3019] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0d3d20]"
          >
            <Plus className="h-5 w-5" />
            Book New Yard Work
          </Link>
        </div>
      </main>
    </div>
  );
}
