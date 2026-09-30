import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  CreditCard,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../lib/api/admin-api";
import { getApiErrorMessage } from "../../lib/api/http";
import {
  formatBookingDateTime,
  getBookingStatusClasses,
  getBookingStatusLabel,
  getBookingHeroName,
} from "../../lib/bookings";
import {
  formatCurrency,
  formatCustomerDateTime,
  formatCustomerStatus,
  formatFullAddress,
  formatMemberSince,
  formatPaymentMethod,
  getCustomerStatusClasses,
} from "../../lib/customers";
import { getInitials } from "../../lib/workers";

const PAYMENT_STATUS_CLASSES = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const getPaymentStatusClasses = (status = "") =>
  PAYMENT_STATUS_CLASSES[status] || "bg-gray-100 text-gray-700";

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError("A customer id is missing from the URL.");
      return;
    }

    let ignore = false;

    const loadCustomer = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await adminApi.getCustomerById(id);

        if (!ignore) {
          setCustomerData(data);
        }
      } catch (apiError) {
        if (!ignore) {
          setError(getApiErrorMessage(apiError));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadCustomer();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 mt-16">
        <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading customer details...
        </div>
      </div>
    );
  }

  if (error || !customerData?.customer) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 mt-16">
        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="mb-6 flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Customers
        </button>

        <div className="rounded-lg bg-white p-10 text-center text-red-600 shadow-sm">
          {error || "Customer not found."}
        </div>
      </div>
    );
  }

  const { customer, summary, recentBookings = [] } = customerData;
  const summaryCards = [
    {
      title: "Total Bookings",
      value: Number(summary?.totalBookings || 0).toLocaleString(),
      icon: CalendarDays,
      iconClasses: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Jobs",
      value: Number(summary?.activeBookings || 0).toLocaleString(),
      icon: User,
      iconClasses: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Completed Jobs",
      value: Number(summary?.completedBookings || 0).toLocaleString(),
      icon: CreditCard,
      iconClasses: "bg-green-100 text-green-600",
    },
    {
      title: "Total Spent",
      value: formatCurrency(summary?.totalSpent || 0),
      icon: DollarSign,
      iconClasses: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-16">
      <div className="mx-auto">
        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Customers
        </button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{formatMemberSince(customer.createdAt)}</p>
          </div>

          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getCustomerStatusClasses(
              customer.status
            )}`}
          >
            {formatCustomerStatus(customer.status)}
          </span>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.title} className="rounded-lg bg-white p-6 shadow-sm">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${card.iconClasses}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">{card.value}</div>
                <div className="text-sm text-gray-500">{card.title}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>

              <div className="mt-5 flex items-center gap-4">
                {customer.profilePhotoUrl ? (
                  <img
                    src={customer.profilePhotoUrl}
                    alt={customer.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-xl font-semibold text-white">
                    {getInitials(customer.name)}
                  </div>
                )}

                <div>
                  <div className="text-lg font-semibold text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500">{formatMemberSince(customer.createdAt)}</div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">{customer.email || "No email"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium text-gray-900">{customer.phone || "No phone"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium text-gray-900">{formatFullAddress(customer)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Last Login</div>
                    <div className="font-medium text-gray-900">
                      {formatCustomerDateTime(customer.lastLoginAt)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Payment Summary</h2>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(summary?.totalSpent || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Outstanding Balance</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(summary?.outstandingBalance || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 text-sm">
                  <span className="text-gray-600">Average Order</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(summary?.averageOrder || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Payment</span>
                  <span className="font-medium text-gray-900">
                    {formatCustomerDateTime(summary?.lastPaymentAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-900">
                    {formatPaymentMethod(summary?.lastPaymentMethod)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Booking History</h2>
              <p className="mt-1 text-sm text-gray-500">
                Showing the latest {recentBookings.length} jobs for this customer.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Hero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No bookings found for this customer.
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking) => {
                      const amount = booking.payment?.amount || booking.estimatedPrice || 0;
                      const paymentStatus = booking.payment?.status || booking.paymentStatus || "pending";

                      return (
                        <tr key={booking._id} className="transition hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatBookingDateTime(
                              booking.payment?.paidAt ||
                                booking.booking?.completedAt ||
                                booking.createdAt
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.title || booking.serviceType || "Service request"}
                            </div>
                            <div className="text-xs text-gray-500">{booking.serviceType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getBookingHeroName(booking)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBookingStatusClasses(
                                booking.status
                              )}`}
                            >
                              {getBookingStatusLabel(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                                paymentStatus
                              )}`}
                            >
                              {paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => navigate(`/booking/${booking._id}`)}
                              className="text-sm font-medium text-gray-900 transition hover:text-gray-700"
                            >
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
