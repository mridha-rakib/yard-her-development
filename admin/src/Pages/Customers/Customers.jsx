import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  Search,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin-api";
import { getApiErrorMessage } from "../../lib/api/http";
import {
  buildVisiblePages,
  CUSTOMER_PAGE_SIZE,
  CUSTOMER_SORT_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  formatCurrency,
  formatCustomerStatus,
  formatMemberSince,
  getCustomerStatusClasses,
} from "../../lib/customers";
import { getInitials } from "../../lib/workers";

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortValue, setSortValue] = useState("newest");
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: CUSTOMER_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let ignore = false;

    const loadDashboardStats = async () => {
      setIsStatsLoading(true);
      setStatsError("");

      try {
        const stats = await adminApi.getDashboardStats();

        if (!ignore) {
          setDashboardStats(stats);
        }
      } catch (apiError) {
        if (!ignore) {
          setStatsError(getApiErrorMessage(apiError));
        }
      } finally {
        if (!ignore) {
          setIsStatsLoading(false);
        }
      }
    };

    loadDashboardStats();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadCustomers = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = {
          page: currentPage,
          limit: CUSTOMER_PAGE_SIZE,
          sort: sortValue,
        };

        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        const response = await adminApi.listCustomers(params);

        if (!ignore) {
          setCustomers(response.items || []);
          setPagination(response.pagination);
        }
      } catch (apiError) {
        if (!ignore) {
          setCustomers([]);
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

    loadCustomers();

    return () => {
      ignore = true;
    };
  }, [currentPage, debouncedSearchTerm, statusFilter, sortValue]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortValue(event.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = (customerId) => {
    navigate(`/customer/${customerId}`);
  };

  const totalPages = pagination.totalPages || 1;
  const visiblePages = buildVisiblePages(currentPage, totalPages);
  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);
  const statCards = [
    {
      title: "Total Customers",
      value: dashboardStats?.totalCustomers || 0,
      icon: Users,
      iconClasses: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Customers",
      value: dashboardStats?.activeCustomers || 0,
      icon: CheckCircle2,
      iconClasses: "bg-green-100 text-green-600",
    },
    {
      title: "Total Bookings",
      value: dashboardStats?.totalBookings || 0,
      icon: CalendarDays,
      iconClasses: "bg-purple-100 text-purple-600",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardStats?.totalRevenue || 0),
      icon: DollarSign,
      iconClasses: "bg-yellow-100 text-yellow-600",
      isCurrency: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-16">
      <div className="mx-auto">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Customer Management</h1>
        <p className="mb-6 text-sm text-gray-500">
          Review customer accounts, booking activity, and spending history from one place.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const displayValue =
              isStatsLoading && !dashboardStats
                ? "--"
                : card.isCurrency
                  ? card.value
                  : Number(card.value || 0).toLocaleString();

            return (
              <div key={card.title} className="rounded-lg bg-white p-6 shadow-sm">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${card.iconClasses}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">{displayValue}</div>
                <div className="text-sm text-gray-500">{card.title}</div>
              </div>
            );
          })}
        </div>

        {statsError ? (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {statsError}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by name, email or phone..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {CUSTOMER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={sortValue}
                onChange={handleSortChange}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {CUSTOMER_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Spent
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
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading customers...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {customer.profilePhotoUrl ? (
                            <img
                              src={customer.profilePhotoUrl}
                              alt={customer.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-sm font-semibold text-white">
                              {getInitials(customer.name)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="truncate text-xs text-gray-500">
                              {formatMemberSince(customer.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email || "No email"}</div>
                        <div className="text-xs text-gray-500">{customer.phone || "No phone"}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {Number(customer.totalBookings || 0).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent || 0)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getCustomerStatusClasses(
                            customer.status
                          )}`}
                        >
                          {formatCustomerStatus(customer.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(customer._id)}
                          className="text-gray-600 transition hover:text-gray-900"
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

              <div className="flex items-center gap-1">
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
                      {shouldRenderGap ? <span className="px-2 text-sm text-gray-400">...</span> : null}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 min-w-9 rounded-lg px-3 text-sm transition ${
                          currentPage === page
                            ? "bg-gray-900 font-medium text-white"
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

export default Customers;
