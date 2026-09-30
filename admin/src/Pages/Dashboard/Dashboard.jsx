import React, { useEffect, useState } from "react";
import { Calendar, Clock, DollarSign, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin-api";
import { getApiErrorMessage } from "../../lib/api/http";
import {
  getBookingCustomerName,
  getBookingStatusClasses,
  getBookingStatusLabel,
} from "../../lib/bookings";
import {
  formatLocation,
  formatHeroStatus,
  getInitials,
  getHeroStatusClasses,
} from "../../lib/workers";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(Number(value || 0)) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await adminApi.getDashboardStats();

        if (!ignore) {
          setDashboard(data);
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

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = [
    {
      title: "Total Bookings",
      value: Number(dashboard?.totalBookings || 0).toLocaleString(),
      change: "All booking records",
      icon: Calendar,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Heroes",
      value: Number(dashboard?.activeHeroes || 0).toLocaleString(),
      change: "Approved and active accounts",
      icon: Users,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Pending Jobs",
      value: Number(dashboard?.pendingJobs || 0).toLocaleString(),
      change: "Awaiting assignment",
      icon: Clock,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      changeColor: "text-orange-600",
    },
    {
      title: "Platform Earnings",
      value: formatCurrency(dashboard?.totalPlatformFee || 0),
      change: "Commission plus booking fees collected",
      icon: DollarSign,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 mt-16">
        <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 mt-16">
        <div className="rounded-lg bg-white p-10 text-center text-red-600 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-16">
      <div className="mx-auto">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.title} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm text-gray-600">{stat.title}</p>
                  <h3 className="mb-2 text-3xl font-bold text-gray-900">{stat.value}</h3>
                  <p className={`text-sm ${stat.changeColor || "text-gray-600"}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} rounded-lg p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Latest Bookings</h2>
              <button
                type="button"
                onClick={() => navigate("/booking")}
                className="text-sm text-gray-600 transition hover:text-gray-900"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {dashboard?.recentBookings?.length ? (
                dashboard.recentBookings.map((booking) => (
                  <button
                    key={booking._id}
                    type="button"
                    onClick={() => navigate(`/booking/${booking._id}`)}
                    className="flex w-full items-center justify-between gap-4 rounded-lg p-2 text-left transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                        {getInitials(getBookingCustomerName(booking))}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getBookingCustomerName(booking)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.title || booking.serviceType || "Service request"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getBookingStatusClasses(
                        booking.status
                      )}`}
                    >
                      {getBookingStatusLabel(booking.status)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                  No recent bookings available.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Hero Applications</h2>
              <button
                type="button"
                onClick={() => navigate("/workers")}
                className="text-sm text-gray-600 transition hover:text-gray-900"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {dashboard?.recentHeroApplications?.length ? (
                dashboard.recentHeroApplications.map((worker) => (
                  <button
                    key={worker._id}
                    type="button"
                    onClick={() => navigate(`/workers/${worker._id}`)}
                    className="flex w-full items-center justify-between gap-4 rounded-lg p-2 text-left transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                        {getInitials(worker.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{worker.name}</p>
                        <p className="text-sm text-gray-600">{formatLocation(worker.location)}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getHeroStatusClasses(
                        worker.workerStatus
                      )}`}
                    >
                      {formatHeroStatus(worker.workerStatus)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                  No Hero applications found.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate("/booking")}
              className="flex items-center justify-center gap-3 rounded-lg bg-[#0A3019] px-6 py-4 font-semibold text-white transition hover:bg-[#114026]"
            >
              <Calendar className="h-5 w-5" />
              View All Bookings
            </button>
            <button
              type="button"
              onClick={() => navigate("/workers")}
              className="flex items-center justify-center gap-3 rounded-lg bg-[#0A3019] px-6 py-4 font-semibold text-white transition hover:bg-[#114026]"
            >
              <User className="h-5 w-5" />
              Review Hero Applications
            </button>
            <button
              type="button"
              onClick={() => navigate("/payments")}
              className="flex items-center justify-center gap-3 rounded-lg bg-[#0A3019] px-6 py-4 font-semibold text-white transition hover:bg-[#114026]"
            >
              <DollarSign className="h-5 w-5" />
              View Payments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
