import React, { useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Search,
} from "lucide-react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin-api";
import { getApiErrorMessage } from "../../lib/api/http";
import {
  buildVisiblePages,
  formatCurrency,
  getPaymentMethodLabel,
  getPaymentStatusClasses,
  mapPaymentRecord,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_PAGE_SIZE,
  PAYMENT_STATUS_OPTIONS,
} from "../../lib/payments";

const statCardConfig = [
  {
    key: "totalAmount",
    title: "Total Payments",
    iconClasses: "bg-blue-100 text-blue-600",
    iconPath:
      "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    subtitle: (summary) => `${Number(summary?.totalCount || 0).toLocaleString()} records in current view`,
  },
  {
    key: "totalPlatformFee",
    title: "Platform Earnings",
    iconClasses: "bg-green-100 text-green-600",
    iconPath:
      "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    subtitle: (summary) =>
      `${Number(summary?.paidCount || 0).toLocaleString()} completed payments`,
  },
  {
    key: "totalHeroPayout",
    title: "Hero Payouts",
    iconClasses: "bg-purple-100 text-purple-600",
    iconPath:
      "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    subtitle: () => "Projected Hero payout amount",
  },
  {
    key: "pendingPayments",
    title: "Pending Payments",
    iconClasses: "bg-orange-100 text-orange-600",
    iconPath:
      "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    subtitle: (summary) => `${Number(summary?.pendingCount || 0).toLocaleString()} transactions pending`,
  },
];

const createCsvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const Payments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAYMENT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let ignore = false;

    const loadPayments = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = {
          page: currentPage,
          limit: PAYMENT_PAGE_SIZE,
        };

        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        if (methodFilter !== "all") {
          params.paymentMethod = methodFilter;
        }

        if (selectedDate) {
          params.date = selectedDate;
        }

        const response = await adminApi.listPayments(params);

        if (!ignore) {
          setPayments((response.items || []).map(mapPaymentRecord));
          setPagination(response.pagination);
          setSummary(response.summary || {});
        }
      } catch (apiError) {
        if (!ignore) {
          setPayments([]);
          setSummary({});
          setPagination((currentValue) => ({
            ...currentValue,
            total: 0,
            totalPages: 1,
          }));
          setError(getApiErrorMessage(apiError));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadPayments();

    return () => {
      ignore = true;
    };
  }, [currentPage, debouncedSearchTerm, methodFilter, selectedDate, statusFilter]);

  const handleViewDetails = (record) => {
    navigate("/payment-details", { state: { record } });
  };

  const handleExportReport = () => {
    if (!payments.length) {
      message.info("There are no payment records to export.");
      return;
    }

    const headers = [
      "Job ID",
      "Customer Name",
      "Customer Email",
      "Hero Name",
      "Hero Email",
      "Total Amount",
      "Platform Fee",
      "Hero Payout",
      "Payment Method",
      "Status",
      "Processed At",
    ];

    const rows = payments.map((record) => [
      record.jobId,
      record.customer.name,
      record.customer.email,
      record.worker.name,
      record.worker.email,
      record.totalAmount.toFixed(2),
      record.platformFee.toFixed(2),
      record.workerPayout.toFixed(2),
      record.paymentMethod,
      record.status,
      record.processedAt,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(createCsvValue).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    const activeDateLabel = selectedDate || "all-dates";

    downloadLink.href = downloadUrl;
    downloadLink.setAttribute("download", `payments-report-${activeDateLabel}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUrl);
  };

  const totalPages = pagination.totalPages || 1;
  const visiblePages = buildVisiblePages(currentPage, totalPages);
  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-16">
      <div className="mx-auto">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mb-6 text-sm text-gray-500">
          Monitor transaction history, payout splits, and current payment states in one place.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCardConfig.map((card) => (
            <div key={card.key} className="rounded-lg bg-white p-6 shadow-sm">
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${card.iconClasses}`}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={card.iconPath}
                  />
                </svg>
              </div>
              <div className="mb-1 text-3xl font-bold text-gray-900">
                {formatCurrency(summary?.[card.key] || 0)}
              </div>
              <div className="mb-1 text-sm text-gray-500">{card.title}</div>
              <div className="text-sm text-gray-500">{card.subtitle(summary)}</div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Payment Records</h2>
              <button
                type="button"
                onClick={handleExportReport}
                className="flex items-center rounded-lg bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by job ID, customer, or Hero..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={methodFilter}
                onChange={(event) => {
                  setMethodFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent outline-none"
                />
              </label>
            </div>
          </div>

          {error ? (
            <div className="border-b border-red-100 bg-red-50 px-6 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Job ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Hero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Platform Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Hero Payout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      Loading payment records...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No payment records found
                    </td>
                  </tr>
                ) : (
                  payments.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.jobId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.customer.name}
                        </div>
                        <div className="text-sm text-gray-500">{record.customer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.worker.name}
                        </div>
                        <div className="text-sm text-gray-500">{record.worker.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(record.totalAmount, record.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(record.platformFee, record.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ({record.platformFeePercentage || 0}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(record.workerPayout, record.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ({record.payoutPercentage || 0}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getPaymentMethodLabel(record.paymentMethodCode)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                            record.statusCode
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(record)}
                          className="text-gray-600 transition-colors hover:text-gray-900"
                          title="View details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.total > 0 ? (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <div className="text-sm text-gray-500">
                Showing {showingFrom} to {showingTo} of {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {visiblePages.map((page, index) => {
                  const previousPage = visiblePages[index - 1];
                  const shouldRenderGap = previousPage && page - previousPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {shouldRenderGap ? (
                        <span className="px-2 text-sm text-gray-400">...</span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-3 py-2 text-sm transition ${
                          currentPage === page
                            ? "bg-gray-900 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Payments;
