"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  Info,
  LoaderCircle,
  MapPin,
  User,
} from "lucide-react";
import { paymentApi } from "@/lib/api/payment-api";
import { getApiErrorMessage } from "@/lib/api/http";
import { useRequiredRole } from "@/lib/auth/use-required-role";
import {
  formatCurrency,
  formatLongDateTime,
  formatShortDate,
  getCompletedDate,
  getJobTitle,
  getLocationLabel,
  getPaymentDate,
  getPaymentDetailSummary,
  getPaymentIdLabel,
  getPaymentMethodLabel,
  getPaymentStatusDetails,
  getHeroInitials,
} from "@/lib/worker-payments";

function HeroPaymentDetailsFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading payment details...
      </div>
    </div>
  );
}

function HeroPaymentDetailsPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId") || "";
  const { user, isRoleReady } = useRequiredRole("worker", pathname);
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (!isRoleReady) {
      return;
    }

    if (!paymentId) {
      setPageError("A payment ID is required to view this page.");
      setPayment(null);
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadPayment = async () => {
      setIsLoading(true);

      try {
        const result = await paymentApi.getPaymentById(paymentId);

        if (!isActive) {
          return;
        }

        setPayment(result);
        setPageError("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPayment(null);
        setPageError(getApiErrorMessage(error));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadPayment();

    return () => {
      isActive = false;
    };
  }, [isRoleReady, paymentId, user]);

  const summary = useMemo(() => getPaymentDetailSummary(payment || {}), [payment]);
  const statusDetails = getPaymentStatusDetails(payment?.status);
  const workerName = payment?.worker?.name || "No Hero connected";
  const workerInitials = getHeroInitials(workerName);
  const paymentDate = getPaymentDate(payment || {});
  const completedDate = getCompletedDate(payment || {});
  const detailIdLabel = getPaymentIdLabel(payment || {});

  if (!isRoleReady) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading payment details...
        </div>
      </div>
    );
  }

  if (pageError || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => router.push("/payment")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Earnings
          </button>

          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Unable to load payment</h1>
            <p className="mt-3 text-sm text-gray-600">{pageError || "Payment not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => router.push("/payment")}
            className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Earnings
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{getJobTitle(payment)}</h2>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusDetails.cardTone}`}
                >
                  {statusDetails.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {detailIdLabel} | Completed on {formatShortDate(completedDate)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.workerPayout)}
              </p>
              <p className="text-sm text-gray-500">Your earnings</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{statusDetails.label}</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Earnings Breakdown</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Job Total Amount</p>
                    <p className="text-xs text-gray-500">
                      Customer payment for this booking
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(summary.amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <span className="text-sm font-bold">%</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Platform Fee</p>
                    <p className="text-xs text-gray-500">
                      {summary.platformFeePercentage}% service fee
                    </p>
                  </div>
                  <p className="font-semibold text-red-600">
                    -{formatCurrency(summary.platformFee)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">Your Earnings</p>
                    <p className="text-xs text-emerald-700">
                      Net payout after platform fees
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(summary.workerPayout)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <p className="text-sm text-blue-900">
                <span className="font-medium">Simple breakdown:</span> The job paid{" "}
                {formatCurrency(summary.amount)} and your payout was{" "}
                {formatCurrency(summary.workerPayout)} after the platform fee.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Information</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Payment Date</span>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {formatLongDateTime(paymentDate)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Based on the latest payment status timestamp
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-gray-600">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Payment Method</span>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {getPaymentMethodLabel(payment.paymentMethod)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Processed through {payment.gateway || "the platform"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-medium text-emerald-900">
              {payment.status === "paid"
                ? "Customer payment successfully processed"
                : payment.status === "authorized"
                  ? "Customer payment is in secure hold"
                  : "Payment status updated"}
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              {payment.status === "paid"
                ? "Customer payment has been collected through Stripe. Hero payout is released after Yard Hero approves completion proof."
                : payment.status === "authorized"
                  ? "The customer payment is secured and will be released after Yard Hero approves the completion proof."
                  : "Check the status label above for the current payout state."}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Additional Job Details</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">
                  {payment.customer?.name || "Unknown customer"}
                </p>
                <p className="text-sm text-gray-500">
                  {payment.customer?.email || "No email available"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{getLocationLabel(payment)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Hero</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-semibold text-white">
                    {workerInitials}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{workerName}</p>
                    <p className="text-sm text-gray-500">
                      {payment.worker?.email || "No Hero email available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="font-medium text-gray-900 break-all">
                  {payment.stripePaymentIntentId ||
                    payment.stripeCheckoutSessionId ||
                    payment._id}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/payment")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Earnings History
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Download className="h-5 w-5" />
            Download Summary
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeroPaymentDetailsPage() {
  return (
    <Suspense fallback={<HeroPaymentDetailsFallback />}>
      <HeroPaymentDetailsPageContent />
    </Suspense>
  );
}
