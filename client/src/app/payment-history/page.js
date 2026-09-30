"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  LoaderCircle,
  Search,
} from "lucide-react";
import { paymentApi } from "@/lib/api/payment-api";
import { getApiErrorMessage } from "@/lib/api/http";
import { useRequiredRole } from "@/lib/auth/use-required-role";
import { formatPrice } from "@/lib/pricing-content";
import { formatDate } from "@/lib/time";

const PAGE_LIMIT = 100;

const dateFilters = [
  { value: "all", label: "All Dates" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_year", label: "Last Year" },
];

const statusFilters = [
  { value: "all", label: "All Status" },
  { value: "completed", label: "Completed" },
  { value: "authorized", label: "Secure Hold" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const methodFilters = [
  { value: "all", label: "Payment Method" },
  { value: "card", label: "Credit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
];

const paymentStatusConfig = {
  paid: {
    label: "Completed",
    statusColor: "bg-green-100 text-green-700",
  },
  authorized: {
    label: "Secure Hold",
    statusColor: "bg-blue-100 text-blue-700",
  },
  pending: {
    label: "Pending",
    statusColor: "bg-yellow-100 text-yellow-700",
  },
  failed: {
    label: "Failed",
    statusColor: "bg-red-100 text-red-700",
  },
  refunded: {
    label: "Refunded",
    statusColor: "bg-blue-100 text-blue-700",
  },
  cancelled: {
    label: "Cancelled",
    statusColor: "bg-gray-100 text-gray-700",
  },
};

const createEmptySummary = () => ({
  totalPaid: 0,
  pendingPayments: 0,
  lastPaymentAmount: 0,
  lastPaymentDate: "",
});

const formatCurrency = (value) => `$${formatPrice(value || 0)}`;
const getPaymentDate = (payment) => payment?.paidAt || payment?.authorizedAt || payment?.createdAt;

const formatPaymentDate = (value) =>
  formatDate(value, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) || "N/A";

const formatCardDate = (value) =>
  formatDate(value, {
    month: "short",
    day: "numeric",
  }) || "N/A";

const getMethodLabel = (value = "") => {
  const labels = {
    card: "Credit Card",
    cash: "Cash",
    paypal: "PayPal",
    bank_transfer: "Bank Transfer",
    unknown: "Unknown",
  };

  return labels[value] || "Unknown";
};

const getHeroInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "YH";

const getJobIdLabel = (payment) => {
  const sourceId = payment?.job?._id || payment?._id || "";
  return sourceId ? `#${String(sourceId).slice(-6).toUpperCase()}` : "#------";
};

const getPaymentHeadline = (payment) =>
  payment?.job?.title || payment?.description || "Yard Service";

export default function PaymentHistoryPage() {
  const pathname = usePathname();
  const { user, isAuthenticated, isRoleReady } = useRequiredRole("customer", pathname);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(createEmptySummary());
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  useEffect(() => {
    if (!isRoleReady) {
      return;
    }

    let isActive = true;

    const loadPayments = async () => {
      setIsLoading(true);

      try {
        const params = { limit: PAGE_LIMIT };

        if (deferredSearchTerm.trim()) {
          params.search = deferredSearchTerm.trim();
        }

        if (dateFilter !== "all") {
          params.dateRange = dateFilter;
        }

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        if (methodFilter !== "all") {
          params.paymentMethod = methodFilter;
        }

        const result = await paymentApi.listPayments(params);

        if (!isActive) {
          return;
        }

        setPayments(result.items || []);
        setSummary(result.summary || createEmptySummary());
        setPageError("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPageError(getApiErrorMessage(error));
        setPayments([]);
        setSummary(createEmptySummary());
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
  }, [
    dateFilter,
    deferredSearchTerm,
    isAuthenticated,
    isRoleReady,
    methodFilter,
    reloadVersion,
    statusFilter,
    user,
  ]);

  if (!isRoleReady) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600">
            Track all your yard work service payments and transaction details
          </p>
        </div>

        {pageError ? (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{pageError}</p>
            </div>
            <button
              type="button"
              onClick={() => setReloadVersion((currentValue) => currentValue + 1)}
              className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        ) : null}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-2 text-sm text-gray-600">Total Paid</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(summary.totalPaid)}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <DollarSign className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-2 text-sm text-gray-600">Secure Hold / Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(summary.pendingPayments)}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-2 text-sm text-gray-600">Last Payment</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(summary.lastPaymentAmount)}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <CreditCard className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-2 text-sm text-gray-600">Last Payment Date</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCardDate(summary.lastPaymentDate)}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Calendar className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job ID or Hero name..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="relative">
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500"
              >
                {dateFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500"
              >
                {statusFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={methodFilter}
                onChange={(event) => setMethodFilter(event.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500"
              >
                {methodFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
          </div>

          {isLoading ? (
            <div className="flex min-h-[280px] items-center justify-center px-6 py-10 text-sm text-gray-600">
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
              Loading payment history...
            </div>
          ) : payments.length ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      {[
                        "Job Details",
                        "Hero",
                        "Date",
                        "Payment Method",
                        "Amount",
                        "Status",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => {
                      const status =
                        paymentStatusConfig[payment.status] || paymentStatusConfig.pending;
                      const viewHref = payment?.job?._id
                        ? `/booking-details?jobId=${payment.job._id}`
                        : "";

                      return (
                        <tr key={payment._id} className="transition-colors hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {getPaymentHeadline(payment)}
                              </div>
                              <div className="text-sm text-gray-500">{getJobIdLabel(payment)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                                {getHeroInitials(payment?.worker?.name)}
                              </div>
                              <span className="font-medium text-gray-900">
                                {payment?.worker?.name || "No Hero connected"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {formatPaymentDate(getPaymentDate(payment))}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2 text-gray-700">
                              <CreditCard className="h-4 w-4" />
                              <span>{getMethodLabel(payment?.paymentMethod)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {formatCurrency(payment?.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.statusColor}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {viewHref ? (
                              <Link
                                href={viewHref}
                                className="text-gray-600 transition-colors hover:text-green-700"
                                aria-label="View payment booking"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                            ) : (
                              <span className="inline-flex text-gray-300">
                                <Eye className="h-5 w-5" />
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-gray-200 md:hidden">
                {payments.map((payment) => {
                  const status =
                    paymentStatusConfig[payment.status] || paymentStatusConfig.pending;
                  const viewHref = payment?.job?._id
                    ? `/booking-details?jobId=${payment.job._id}`
                    : "";

                  return (
                    <div key={payment._id} className="p-6 transition-colors hover:bg-gray-50">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="mb-1 font-semibold text-gray-900">
                            {getPaymentHeadline(payment)}
                          </h3>
                          <p className="text-sm text-gray-500">{getJobIdLabel(payment)}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.statusColor}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                          {getHeroInitials(payment?.worker?.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment?.worker?.name || "No Hero connected"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPaymentDate(getPaymentDate(payment))}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <CreditCard className="h-4 w-4" />
                          <span>{getMethodLabel(payment?.paymentMethod)}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(payment?.amount)}
                          </span>
                          {viewHref ? (
                            <Link
                              href={viewHref}
                              className="text-gray-600 transition-colors hover:text-green-700"
                              aria-label="View payment booking"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                          ) : (
                            <span className="inline-flex text-gray-300">
                              <Eye className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="px-6 py-16 text-center">
              <h3 className="text-xl font-semibold text-gray-900">Payment History</h3>
              <p className="mt-3 text-sm text-gray-600">
                No payments match your current filters yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
