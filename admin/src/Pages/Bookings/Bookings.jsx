import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin-api";
import { getApiErrorMessage } from "../../lib/api/http";
import {
  BOOKING_PAGE_SIZE,
  BOOKING_STATUS_OPTIONS,
  BOOKING_URGENCY_OPTIONS,
  formatBookingLocation,
  getBookingCustomerEmail,
  getBookingCustomerName,
  getBookingIdLabel,
  getBookingStatusClasses,
  getBookingStatusLabel,
  getBookingHeroName,
  getUrgencyClasses,
  getUrgencyLabel,
} from "../../lib/bookings";
import { getInitials } from "../../lib/workers";

const buildVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
};

const Bookings = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: BOOKING_PAGE_SIZE,
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

    const loadBookings = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = {
          page: currentPage,
          limit: BOOKING_PAGE_SIZE,
        };

        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        if (urgencyFilter !== "all") {
          params.urgency = urgencyFilter;
        }

        const response = await adminApi.listBookings(params);

        if (!ignore) {
          setBookings(response.items || []);
          setPagination(response.pagination);
        }
      } catch (apiError) {
        if (!ignore) {
          setBookings([]);
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

    loadBookings();

    return () => {
      ignore = true;
    };
  }, [currentPage, debouncedSearchTerm, statusFilter, urgencyFilter]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleUrgencyChange = (event) => {
    setUrgencyFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = (jobId) => {
    navigate(`/booking/${jobId}`);
  };

  const totalPages = pagination.totalPages || 1;
  const visiblePages = buildVisiblePages(currentPage, totalPages);
  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-16">
      <div className="mx-auto">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Bookings Management</h1>
        <p className="mb-6 text-sm text-gray-500">
          Review incoming job requests, track assignment progress, and open the full booking
          record.
        </p>

        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="min-w-64 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or full job ID..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              {BOOKING_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={urgencyFilter}
              onChange={handleUrgencyChange}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              {BOOKING_URGENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
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
                    Job Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Hero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      Loading bookings...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((job) => {
                    const customerName = getBookingCustomerName(job);
                    const customerEmail = getBookingCustomerEmail(job);
                    const workerName = getBookingHeroName(job);

                    return (
                      <tr key={job._id} className="transition hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            title={job._id}
                            className="text-sm font-semibold text-gray-900"
                          >
                            {getBookingIdLabel(job._id)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                              {getInitials(customerName)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-gray-900">
                                {customerName}
                              </div>
                              <div className="truncate text-xs text-gray-500">
                                {customerEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {job.title || job.serviceType || "Service request"}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {formatBookingLocation(job)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${getUrgencyClasses(
                              job.urgency
                            )}`}
                          >
                            {getUrgencyLabel(job.urgency)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm ${
                              workerName === "No Hero connected"
                                ? "font-semibold text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {workerName}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${getBookingStatusClasses(
                              job.status
                            )}`}
                          >
                            {getBookingStatusLabel(job.status)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(job._id)}
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 transition hover:text-gray-700"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination.total > 0 ? (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <div className="text-sm text-gray-600">
                Showing {showingFrom} to {showingTo} of {pagination.total} results
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>

                {visiblePages.map((page, index) => {
                  const previousPage = visiblePages[index - 1];
                  const shouldRenderGap = previousPage && page - previousPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {shouldRenderGap ? <span className="px-2">...</span> : null}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 min-w-9 rounded-md text-sm transition ${
                          currentPage === page
                            ? "bg-green-700 font-medium text-white hover:bg-green-800"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
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
                  className="rounded-md border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
