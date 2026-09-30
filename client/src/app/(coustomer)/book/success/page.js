"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  LoaderCircle,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildPathWithSearchParams,
} from "@/lib/auth/auth-redirect";
import { getApiErrorMessage } from "@/lib/api/http";
import { paymentApi } from "@/lib/api/payment-api";
import { formatPrice } from "@/lib/pricing-content";
import { formatDate, formatTime } from "@/lib/time";
import { useRequiredRole } from "@/lib/auth/use-required-role";

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 6;

const timeLabels = {
  anytime: "Any time",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const workflowSteps = [
  {
    number: "1",
    title: "Secure Payment",
    description: "Your payment is collected securely through Stripe right away.",
    icon: Search,
    tone: {
      number: "bg-[#143f22] text-white",
      iconWrap: "bg-[#eef4ff] text-[#5277ff]",
    },
  },
  {
    number: "2",
    title: "Hero Matched",
    description: "A nearby Hero is matched to your job and completes the work.",
    icon: UserRoundCheck,
    tone: {
      number: "bg-[#e5e7eb] text-[#6b7280]",
      iconWrap: "bg-[#e9fbf0] text-[#22c55e]",
    },
  },
  {
    number: "3",
    title: "Proof Submitted",
    description: "The Hero uploads a verification photo and video after finishing.",
    icon: Wrench,
    tone: {
      number: "bg-[#e5e7eb] text-[#9ca3af]",
      iconWrap: "bg-[#f4ebff] text-[#a855f7]",
    },
  },
  {
    number: "4",
    title: "Approval and Release",
    description: "Yard Hero reviews the proof and then releases payment to the worker.",
    icon: CircleDollarSign,
    tone: {
      number: "bg-[#e5e7eb] text-[#9ca3af]",
      iconWrap: "bg-[#fff7db] text-[#d4a80b]",
    },
  },
];

const peaceOfMindItems = [
  {
    title: "Secure Payment",
    description: "Your payment is collected securely and tracked until the job passes verification.",
    icon: ShieldCheck,
    tone: "bg-[#dcfce7] text-[#16a34a]",
  },
  {
    title: "Stay Informed",
    description: "You'll be notified when a Hero accepts and when proof is submitted.",
    icon: Bell,
    tone: "bg-[#dbeafe] text-[#2563eb]",
  },
  {
    title: "Safe & Transparent",
    description: "Fixed pricing, proof review, and no negotiation.",
    icon: CreditCard,
    tone: "bg-[#f3e8ff] text-[#a855f7]",
  },
];

const formatPreferredDate = (value) => {
  if (!value) {
    return "Flexible";
  }

  return (
    formatDate(value, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }) || value
  );
};

const formatPreferredDateTime = (job) => {
  const dateLabel = formatPreferredDate(job?.preferredDate);
  const rawTimeValue = String(job?.preferredTime || "").trim();
  const timeLabel = timeLabels[rawTimeValue.toLowerCase()] || formatTime(rawTimeValue);

  if (dateLabel === "Flexible" && !rawTimeValue) {
    return "Flexible timing";
  }

  if (!rawTimeValue) {
    return dateLabel;
  }

  return `${dateLabel} at ${timeLabel}`;
};

const formatLocation = (job) =>
  [job?.streetAddress, job?.city].filter(Boolean).join(", ") || "Address pending";

const formatBudget = (payment, job) => {
  const amount = Number(payment?.amount || job?.estimatedPrice || 0);
  return amount > 0 ? `$${formatPrice(amount)}` : "To be confirmed";
};

const getJobTitle = (job) => job?.title || job?.serviceType || "Service request";

function JobSummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#9ca3af]">{label}</p>
      <p className="mt-1 text-[13px] font-medium leading-5 text-[#111827]">{value}</p>
    </div>
  );
}

function WorkflowStep({ item }) {
  const Icon = item.icon;

  return (
    <div className="flex flex-col items-center text-center">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${item.tone.number}`}>
        {item.number}
      </div>
      <div className={`mt-4 flex h-8 w-8 items-center justify-center rounded-full ${item.tone.iconWrap}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-[13px] font-semibold text-[#111827]">{item.title}</p>
      <p className="mt-2 max-w-[150px] text-[11px] leading-4 text-[#6b7280]">{item.description}</p>
    </div>
  );
}

function PeaceOfMindItem({ item }) {
  const Icon = item.icon;

  return (
    <div className="flex flex-col items-center text-center">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-[13px] font-semibold text-[#111827]">{item.title}</p>
      <p className="mt-2 max-w-[180px] text-[11px] leading-4 text-[#6b7280]">{item.description}</p>
    </div>
  );
}

function BookingSuccessScreen({ payment, job }) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="px-4 py-12 md:py-14">
        <div className="mx-auto max-w-[760px]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dcfce7]">
              <Check className="h-9 w-9 text-[#16a34a]" strokeWidth={2.5} />
            </div>

            <h1 className="mt-7 text-[26px] font-bold leading-tight text-[#252b37] md:text-[40px]">
              Job Request Submitted Successfully
            </h1>
            <p className="mt-3 text-sm text-[#6b7280] md:text-[15px]">
              We&apos;ve received your request and are matching you with a local Hero.
            </p>
          </div>

          <div className="mt-10 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:p-6">
            <h2 className="text-lg font-semibold text-[#111827]">Job Summary</h2>

            <div className="mt-5 grid gap-y-5 md:grid-cols-2 md:gap-x-12">
              <JobSummaryItem label="Job Type" value={getJobTitle(job)} />
              <JobSummaryItem label="Preferred Date & Time" value={formatPreferredDateTime(job)} />
              <JobSummaryItem label="Location" value={formatLocation(job)} />
              <JobSummaryItem label="Budget" value={formatBudget(payment, job)} />
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#fff5cf] px-3 py-1.5 text-xs font-medium text-[#8b6a06]">
              <span className="h-2 w-2 rounded-full bg-[#c58b00]" />
              Secure payment received - finding a Hero
            </div>
          </div>

          <div className="mt-7 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:p-6">
            <h2 className="text-center text-[24px] font-semibold text-[#252b37]">
              What Happens Next
            </h2>

            <div className="mt-8 grid gap-8 md:grid-cols-4 md:gap-4">
              {workflowSteps.map((item) => (
                <WorkflowStep key={item.number} item={item} />
              ))}
            </div>
          </div>

          <div className="mt-7 rounded-xl bg-[#eefcf3] p-5 md:p-6">
            <h2 className="text-center text-[24px] font-semibold text-[#252b37]">Peace of Mind</h2>

            <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-4">
              {peaceOfMindItems.map((item) => (
                <PeaceOfMindItem key={item.title} item={item} />
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/myjobs"
              className="inline-flex w-full items-center justify-center rounded-md bg-[#143f22] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f311b] sm:w-auto sm:min-w-[168px]"
            >
              View My Jobs
            </Link>
            <Link
              href="/book"
              className="inline-flex w-full items-center justify-center rounded-md border border-[#143f22] bg-white px-6 py-3 text-sm font-semibold text-[#143f22] transition-colors hover:bg-[#f7faf8] sm:w-auto sm:min-w-[168px]"
            >
              Book Another Job
            </Link>
          </div>

          <div className="mt-7 rounded-xl border border-[#e5e7eb] bg-white p-6 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h2 className="text-[24px] font-semibold text-[#252b37]">Need Help?</h2>
            <p className="mt-3 text-sm text-[#6b7280]">
              Contact us anytime if you have questions about the payment and verification process.
            </p>

            <div className="mt-5 flex items-center justify-center text-sm font-medium text-[#374151]">
              <a href="mailto:yardheroinfo@gmail.com" className="inline-flex items-center gap-2 hover:text-[#143f22]">
                <Mail className="h-4 w-4 text-[#143f22]" />
                yardheroinfo@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingOrFailedBookingScreen({
  isLoading,
  loadError,
  isVerifying,
  job,
  payment,
  paymentConfirmed,
  paymentFailed,
  requestVersion,
  setRequestVersion,
  sessionId,
}) {
  const statusTone = paymentConfirmed
    ? {
        badge: "bg-[#e7f6ec] text-[#166534]",
        iconWrap: "bg-[#d9f2e2] text-[#0A3019]",
        panel: "border-[#cfe5d5] bg-[#f7fbf8]",
      }
    : paymentFailed
      ? {
          badge: "bg-[#fdecec] text-[#b42318]",
          iconWrap: "bg-[#fce4e4] text-[#b42318]",
          panel: "border-[#f2d0d0] bg-[#fff8f8]",
        }
      : {
          badge: "bg-[#fff4df] text-[#9a6700]",
          iconWrap: "bg-[#ffedc2] text-[#9a6700]",
          panel: "border-[#f2dfb5] bg-[#fffaf0]",
        };
  const statusTitle = !sessionId
    ? "Missing payment session"
    : paymentConfirmed
      ? "Payment received"
      : paymentFailed
        ? "Payment was not completed"
        : "Confirming your payment";
  const statusDescription = !sessionId
    ? "We could not find a valid payment session on this return URL."
    : paymentConfirmed
      ? "Your payment has been verified and your yard work request is now in the queue."
      : paymentFailed
        ? "Stripe did not complete this payment. You can return to booking and try again."
        : "Stripe redirected you back successfully. We are waiting for the webhook confirmation now.";
  const steps = [
    {
      title: "Payment verified",
      description:
        "We confirm the payment through Stripe webhooks before finalizing the request.",
    },
    {
      title: "Job request queued",
      description:
        "Your service request is saved and ready for Hero matching and review.",
    },
    {
      title: "Track progress",
      description:
        "You can return to My Jobs at any time to follow updates and assignment status.",
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f8f5_0%,#ffffff_30%,#f7faf7_100%)] px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-[#d8e4db] bg-white">
          <div className="h-1 w-full bg-[#0A3019]" />
          <div className="p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${statusTone.iconWrap}`}
                >
                  {paymentConfirmed ? (
                    <CheckCircle2 className="h-8 w-8" />
                  ) : paymentFailed ? (
                    <AlertCircle className="h-8 w-8" />
                  ) : (
                    <Clock3 className="h-8 w-8" />
                  )}
                </div>
                <div className="max-w-2xl">
                  <div
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusTone.badge}`}
                  >
                    Booking Update
                  </div>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#0f172a] md:text-4xl">
                    {statusTitle}
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-[#52606d] md:text-base">
                    {statusDescription}
                  </p>
                </div>
              </div>

              {isVerifying && sessionId ? (
                <button
                  type="button"
                  onClick={() => setRequestVersion((currentValue) => currentValue + 1)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d5ddd7] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8faf8]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </button>
              ) : null}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#dfe8e1] bg-[#fbfdfb] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                  Service
                </p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">
                  {getJobTitle(job)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#dfe8e1] bg-[#fbfdfb] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                  Amount
                </p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">
                  {formatBudget(payment, job)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#dfe8e1] bg-[#fbfdfb] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                  Preferred date
                </p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">
                  {formatPreferredDate(job?.preferredDate)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_320px]">
          <section className="rounded-[28px] border border-[#d8e4db] bg-white p-8 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">Booking Summary</h2>
                <p className="mt-2 text-sm text-[#6b7280]">
                  A clean confirmation of your paid request.
                </p>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone.badge}`}
              >
                {payment?.status || "pending"}
              </div>
            </div>

            {isLoading ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#dfe5df] bg-[#f8faf8] px-4 py-4 text-sm text-[#52606d]">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Checking Stripe and webhook status...
              </div>
            ) : null}

            {loadError ? (
              <div className="mt-6 rounded-2xl border border-[#f2d0d0] bg-[#fff8f8] px-4 py-4 text-sm text-[#b42318]">
                {loadError}
              </div>
            ) : null}

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[#6b7280]">Service</p>
                <p className="mt-2 text-base font-semibold text-[#111827]">
                  {getJobTitle(job)}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#6b7280]">Amount paid</p>
                <p className="mt-2 text-base font-semibold text-[#111827]">
                  {formatBudget(payment, job)}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-sm text-[#6b7280]">Location</p>
                <div className="mt-2 flex items-start gap-2 text-[#111827]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6b7280]" />
                  <p className="text-base font-semibold">
                    {[job?.streetAddress, job?.city, job?.zipCode]
                      .filter(Boolean)
                      .join(", ") || "Address pending"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#6b7280]">Preferred date</p>
                <p className="mt-2 text-base font-semibold text-[#111827]">
                  {formatPreferredDate(job?.preferredDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#6b7280]">Preferred time</p>
                <p className="mt-2 text-base font-semibold text-[#111827]">
                  {job?.preferredTime || "Any time"}
                </p>
              </div>
            </div>

            <div className={`mt-8 rounded-3xl border px-5 py-5 ${statusTone.panel}`}>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#334155]">
                <CreditCard className="h-4 w-4" />
                Payment confirmation
              </div>
              <p className="mt-3 text-lg font-bold text-[#111827]">
                {paymentConfirmed
                  ? "Paid securely through Stripe"
                  : paymentFailed
                    ? "Payment not completed"
                    : "Waiting for final confirmation"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#52606d]">
                The technical Stripe session reference is stored internally. It does not need to
                be shown to customers on this page.
              </p>
            </div>
          </section>

          <aside className="rounded-[28px] border border-[#d8e4db] bg-white p-8">
            <h2 className="text-2xl font-bold text-[#111827]">What Happens Next</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              No extra action is needed right now.
            </p>

            <div className="mt-8 space-y-5">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A3019] text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#52606d]">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/myjobs"
                className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221]"
              >
                View My Jobs
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-[#d5ddd7] px-4 py-3 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8faf8]"
              >
                Book Another Job
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function BookingSuccessContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const returnPath = useMemo(
    () => buildPathWithSearchParams(pathname, searchParams),
    [pathname, searchParams]
  );
  const { user, isAuthenticated, isReady, isRoleReady } = useRequiredRole(
    "customer",
    returnPath
  );
  const [sessionData, setSessionData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (
      !isRoleReady ||
      !sessionId ||
      !user
    ) {
      if (isReady && !sessionId) {
        setIsLoading(false);
      }

      return;
    }

    let isActive = true;
    let timeoutId = null;

    const loadCheckoutStatus = async (attempt = 0) => {
      if (!isActive) {
        return;
      }

      if (attempt === 0) {
        setIsLoading(true);
      }

      try {
        const nextSessionData = await paymentApi.getCheckoutSessionStatus(sessionId);

        if (!isActive) {
          return;
        }

        setSessionData(nextSessionData);
        setLoadError("");

        const shouldPoll =
          nextSessionData.payment?.status === "pending" && attempt < MAX_POLL_ATTEMPTS;

        if (shouldPoll) {
          timeoutId = setTimeout(() => {
            loadCheckoutStatus(attempt + 1);
          }, POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(getApiErrorMessage(error));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadCheckoutStatus();

    return () => {
      isActive = false;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isRoleReady, isReady, requestVersion, sessionId, user]);

  if (!isRoleReady) {
    return <div className="min-h-screen bg-[#f6f8f6] px-4 py-12" />;
  }

  const payment = sessionData?.payment || null;
  const job = sessionData?.job || sessionData?.draftJob || null;
  const paymentSecured = ["authorized", "paid"].includes(payment?.status || "");
  const paymentConfirmed = payment?.status === "paid";
  const paymentFailed = ["failed", "cancelled"].includes(payment?.status || "");
  const isVerifying = Boolean(sessionId) && !paymentSecured && !paymentFailed;

  if (paymentSecured) {
    return <BookingSuccessScreen payment={payment} job={job} />;
  }

  return (
    <PendingOrFailedBookingScreen
      isLoading={isLoading}
      loadError={loadError}
      isVerifying={isVerifying}
      job={job}
      payment={payment}
      paymentConfirmed={paymentConfirmed}
      paymentFailed={paymentFailed}
      requestVersion={requestVersion}
      setRequestVersion={setRequestVersion}
      sessionId={sessionId}
    />
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f8f6] px-4 py-12" />}>
      <BookingSuccessContent />
    </Suspense>
  );
}
