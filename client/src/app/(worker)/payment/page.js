"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Landmark,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  WalletMinimal,
} from "lucide-react";
import { FaWallet } from "react-icons/fa";
import { paymentApi } from "@/lib/api/payment-api";
import { usersApi } from "@/lib/api/users-api";
import { getApiErrorMessage } from "@/lib/api/http";
import { useRequiredRole } from "@/lib/auth/use-required-role";
import {
  createEmptyPaymentSummary,
  formatCurrency,
  formatShortDate,
  getCompletedDate,
  getJobTitle,
  getPaymentDetailSummary,
  getPaymentStatusDetails,
} from "@/lib/worker-payments";

const PAGE_LIMIT = 50;
const STRIPE_CONNECT_BUSINESS_TYPE_OPTIONS = [
  { label: "Individual", value: "individual" },
  { label: "Company", value: "company" },
  { label: "Non-profit", value: "non_profit" },
  { label: "Government entity", value: "government_entity" },
];

export default function HeroPaymentsPage() {
  const pathname = usePathname();
  const { user, isRoleReady } = useRequiredRole("worker", pathname);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(createEmptyPaymentSummary());
  const [payoutAccount, setPayoutAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [payoutActionError, setPayoutActionError] = useState("");
  const [payoutActionLoading, setPayoutActionLoading] = useState("");
  const [payoutCountry, setPayoutCountry] = useState("US");
  const [payoutBusinessType, setPayoutBusinessType] = useState("individual");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    if (!isRoleReady) {
      return;
    }

    let isActive = true;

    const loadPayments = async () => {
      setIsLoading(true);

      try {
        const [paymentsResult, payoutAccountResult] = await Promise.allSettled([
          paymentApi.listPayments({
            limit: PAGE_LIMIT,
          }),
          usersApi.getWorkerPayoutAccountStatus(),
        ]);

        if (!isActive) {
          return;
        }

        if (paymentsResult.status === "fulfilled") {
          setPayments(paymentsResult.value.items || []);
          setSummary(paymentsResult.value.summary || createEmptyPaymentSummary());
        } else {
          throw paymentsResult.reason;
        }

        if (payoutAccountResult.status === "fulfilled") {
          setPayoutAccount(payoutAccountResult.value || null);
          setPayoutActionError("");
        } else {
          setPayoutAccount(null);
          setPayoutActionError(getApiErrorMessage(payoutAccountResult.reason));
        }

        setPageError("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPayments([]);
        setSummary(createEmptyPaymentSummary());
        setPayoutAccount(null);
        setPageError(getApiErrorMessage(error));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadPayments();

    return () => {
      isActive = false;
    };
  }, [isRoleReady, reloadVersion, user]);

  useEffect(() => {
    if (payoutAccount?.country) {
      setPayoutCountry(String(payoutAccount.country).toUpperCase().slice(0, 2));
    }

    if (payoutAccount?.businessType) {
      setPayoutBusinessType(payoutAccount.businessType);
    }
  }, [payoutAccount]);

  const breakdown = useMemo(() => {
    if (!payments.length) {
      return {
        amount: 100,
        platformFee: 12,
        workerPayout: 88,
        platformFeePercentage: 12,
      };
    }

    return getPaymentDetailSummary(payments[0]);
  }, [payments]);

  const keepPercentage = Math.max(0, 100 - Number(breakdown.platformFeePercentage || 12));
  const payoutReady = Boolean(payoutAccount?.isReady);
  const payoutRequirementsDue = Array.isArray(payoutAccount?.requirementsDue)
    ? payoutAccount.requirementsDue
    : [];

  const handleStripeOnboarding = async () => {
    setPayoutActionLoading("onboarding");
    setPayoutActionError("");

    try {
      const result = await usersApi.createWorkerPayoutOnboardingLink({
        refreshUrl: window.location.href,
        returnUrl: window.location.href,
        country: payoutCountry,
        businessType: payoutBusinessType,
      });

      if (!result?.url) {
        throw new Error("Stripe onboarding URL is missing.");
      }

      window.location.assign(result.url);
    } catch (error) {
      setPayoutActionError(getApiErrorMessage(error));
      setPayoutActionLoading("");
    }
  };

  const handleStripeDashboard = async () => {
    setPayoutActionLoading("dashboard");
    setPayoutActionError("");

    try {
      const result = await usersApi.createWorkerPayoutDashboardLink();

      if (!result?.url) {
        throw new Error("Stripe dashboard URL is missing.");
      }

      window.location.assign(result.url);
    } catch (error) {
      setPayoutActionError(getApiErrorMessage(error));
      setPayoutActionLoading("");
    }
  };

  if (!isRoleReady) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900">Earnings & Payments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your earnings and review completed jobs.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
        {pageError ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 md:flex-row md:items-center md:justify-between">
            <p>{pageError}</p>
            <button
              type="button"
              onClick={() => setReloadVersion((currentValue) => currentValue + 1)}
              className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7ebe8]">
                <FaWallet className="h-4 w-4 text-[#0A3019]" />
              </div>
              <span className="text-sm text-gray-600">Released Earnings</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(summary.totalPaidHeroPayout)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Transferred to your Stripe balance</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#dcfce7]">
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm text-gray-600">Pending Balance</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency(summary.pendingHeroPayout)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Being processed</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#fef3c7]">
                <Clock3 className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm text-gray-600">This Month</span>
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(summary.currentMonthHeroPayout)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Earned this month</p>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #0A3019 0%, rgba(10, 48, 25, 0.9) 70.71%)",
          }}
          className="rounded-xl p-6 text-white shadow-lg"
        >
          <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="mb-1 text-lg font-semibold">
                You keep {keepPercentage}% of every job
              </h3>
              <p className="text-sm text-emerald-100">
                Platform fees are deducted automatically before your payout is released.
              </p>
            </div>
            <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center self-start rounded-full border-2 border-[#5a7465] bg-[#335340] text-center sm:h-36 sm:w-36 md:h-48 md:w-48">
              <p className="text-2xl font-bold sm:text-3xl md:text-5xl">{keepPercentage}%</p>
              <p className="mt-1 text-sm text-emerald-200">Your earnings</p>
            </div>
          </div>

          <div className="w-full rounded-lg bg-[#335340] p-4 sm:max-w-md">
            <p className="text-sm text-emerald-100">
              {payments.length ? "Latest breakdown:" : "Sample breakdown:"}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between">
                <span>Job Payment</span>
                <span className="font-semibold">{formatCurrency(breakdown.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee ({breakdown.platformFeePercentage}%)</span>
                <span className="font-semibold">-{formatCurrency(breakdown.platformFee)}</span>
              </div>
              <div className="mt-2 border-t border-emerald-700 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">You Receive</span>
                  <span className="text-lg font-bold text-emerald-300">
                    {formatCurrency(breakdown.workerPayout)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Stripe Payout Account</h3>
              <p className="text-sm text-gray-500">
                Your 88% earnings are transferred to your Stripe Express balance and then
                automatically paid out to your connected bank account on Stripe&apos;s payout
                schedule.
              </p>
              <div className="mt-4 grid max-w-xl gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                <label className="text-sm font-medium text-gray-700">
                  Country
                  <input
                    type="text"
                    value={payoutCountry}
                    onChange={(event) =>
                      setPayoutCountry(event.target.value.toUpperCase().slice(0, 2))
                    }
                    disabled={Boolean(payoutAccount?.connectedAccountId)}
                    maxLength={2}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm uppercase outline-none transition focus:border-[#0A3019] disabled:bg-gray-100"
                    placeholder="US"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Business type
                  <select
                    value={payoutBusinessType}
                    onChange={(event) => setPayoutBusinessType(event.target.value)}
                    disabled={Boolean(payoutAccount?.connectedAccountId)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0A3019] disabled:bg-gray-100"
                  >
                    {STRIPE_CONNECT_BUSINESS_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {payoutAccount?.connectedAccountId ? (
                <p className="mt-2 text-xs text-gray-500">
                  Stripe account country and business type cannot be changed after the account is
                  created.
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  Use the two-letter country code where your Stripe payout account is legally
                  based, for example US, CA, GB, or AU.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleStripeOnboarding}
                disabled={Boolean(payoutActionLoading)}
                className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#124225] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {payoutActionLoading === "onboarding" ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : payoutReady ? (
                  <RefreshCw className="mr-2 h-4 w-4" />
                ) : (
                  <Landmark className="mr-2 h-4 w-4" />
                )}
                {payoutReady ? "Update Stripe Account" : "Connect Bank Account"}
              </button>
              {payoutAccount?.connectedAccountId ? (
                <button
                  type="button"
                  onClick={handleStripeDashboard}
                  disabled={Boolean(payoutActionLoading)}
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {payoutActionLoading === "dashboard" ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Open Stripe Dashboard
                </button>
              ) : null}
            </div>
          </div>

          <div
            className={`mt-6 rounded-2xl border px-5 py-5 ${
              payoutReady
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${
                    payoutReady ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {payoutReady ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <ShieldAlert className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {payoutReady
                      ? "Automatic bank payouts are active"
                      : payoutAccount?.connectedAccountId
                        ? "Finish Stripe onboarding to receive payouts"
                        : "Create your Stripe payout account"}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {payoutReady
                      ? payoutAccount?.bankAccount?.bankName
                        ? `${payoutAccount.bankAccount.bankName} ending in ${payoutAccount.bankAccount.last4 || "0000"} is ready for Stripe automatic payouts.`
                        : "Your Stripe Express account is connected and ready for automatic payouts."
                      : "Workers must finish Stripe Express onboarding before they can accept jobs and receive automatic bank payouts."}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:min-w-[280px]">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2">
                  <span>Connected account</span>
                  <span className="font-medium text-gray-900">
                    {payoutAccount?.connectedAccountId ? "Created" : "Not created"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2">
                  <span>Bank account</span>
                  <span className="font-medium text-gray-900">
                    {payoutAccount?.bankAccount?.last4
                      ? `•••• ${payoutAccount.bankAccount.last4}`
                      : "Not connected"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2">
                  <span>Payouts</span>
                  <span className="font-medium text-gray-900">
                    {payoutAccount?.payoutsEnabled ? "Enabled" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {payoutRequirementsDue.length ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-amber-900">
                <p className="font-semibold">Stripe still needs:</p>
                <p className="mt-1">
                  {payoutRequirementsDue.slice(0, 3).join(", ")}
                  {payoutRequirementsDue.length > 3 ? "..." : ""}
                </p>
              </div>
            ) : null}

            {payoutAccount?.lastPayout?.status ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Latest Stripe payout</p>
                <p className="mt-1">
                  Status: {payoutAccount.lastPayout.status}
                  {payoutAccount.lastPayout.arrivalDate
                    ? ` • Expected arrival ${formatShortDate(
                        payoutAccount.lastPayout.arrivalDate
                      )}`
                    : ""}
                </p>
                {payoutAccount.lastPayout.failureMessage ? (
                  <p className="mt-1 text-red-600">
                    {payoutAccount.lastPayout.failureMessage}
                  </p>
                ) : null}
              </div>
            ) : null}

            {payoutActionError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {payoutActionError}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Earnings History</h3>
            <p className="text-sm text-gray-500">
              View completed jobs and payout status.
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-[220px] items-center justify-center px-6 py-10 text-sm text-gray-600">
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
              Loading payment history...
            </div>
          ) : payments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <WalletMinimal className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No earnings yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Completed jobs and payouts will appear here once customer payments are
                processed.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-12 gap-4 bg-gray-50 px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 md:grid">
                <div className="col-span-4">Job Type</div>
                <div className="col-span-2">Date Completed</div>
                <div className="col-span-2">Job Payment</div>
                <div className="col-span-2">Your Earnings</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1" />
              </div>

              <div className="divide-y divide-gray-200">
                {payments.map((payment) => {
                  const statusDetails = getPaymentStatusDetails(payment.status);
                  const detailHref = `/payment/payment-details?paymentId=${payment._id}`;
                  const payout = getPaymentDetailSummary(payment);

                  return (
                    <div
                      key={payment._id}
                      className="px-6 py-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="space-y-2 md:hidden">
                        <Link href={detailHref} className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-gray-900">{getJobTitle(payment)}</p>
                            <p className="text-xs text-gray-500">
                              {formatShortDate(getCompletedDate(payment))}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </Link>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Payment:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(payout.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Your earnings:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(payout.workerPayout)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusDetails.tone}`}
                          >
                            {statusDetails.label}
                          </span>
                        </div>
                      </div>

                      <div className="hidden grid-cols-12 items-center gap-4 md:grid">
                        <div className="col-span-4 font-medium text-gray-900">
                          {getJobTitle(payment)}
                        </div>
                        <div className="col-span-2 text-sm text-gray-600">
                          {formatShortDate(getCompletedDate(payment))}
                        </div>
                        <div className="col-span-2 font-medium text-gray-900">
                          {formatCurrency(payout.amount)}
                        </div>
                        <div className="col-span-2 font-medium text-gray-900">
                          {formatCurrency(payout.workerPayout)}
                        </div>
                        <div className="col-span-1">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusDetails.tone}`}
                          >
                            {statusDetails.label}
                          </span>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Link
                            href={detailHref}
                            className="text-gray-400 transition-colors hover:text-gray-600"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
