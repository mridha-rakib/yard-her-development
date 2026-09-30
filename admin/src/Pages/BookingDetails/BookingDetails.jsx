import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  CreditCard,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
import { message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../lib/api/admin-api";
import { API_ORIGIN } from "../../lib/api/config";
import { getApiErrorMessage } from "../../lib/api/http";
import {
  BOOKING_STATUS_UPDATE_OPTIONS,
  formatBookingDate,
  formatBookingDateTime,
  formatBookingLocation,
  formatPreferredSchedule,
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

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;
const resolveProofMediaUrl = (value = "") => {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "";
  }

  if (
    normalizedValue.startsWith("data:") ||
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://")
  ) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith("/")) {
    return `${API_ORIGIN}${normalizedValue}`;
  }

  return normalizedValue;
};

const BookingDetails = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [statusDraft, setStatusDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isApprovingCompletion, setIsApprovingCompletion] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      setError("A booking id is missing from the URL.");
      return;
    }

    let ignore = false;

    const loadBooking = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await adminApi.getBookingById(jobId);

        if (!ignore) {
          setJob(data);
          setStatusDraft(data.booking?.status || "");
          setReviewNotes(data.booking?.verificationNotes || "");
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

    loadBooking();

    return () => {
      ignore = true;
    };
  }, [jobId, requestVersion]);

  const handleRefresh = () => {
    setRequestVersion((currentValue) => currentValue + 1);
  };

  const handleStatusUpdate = async () => {
    if (!job?.booking?._id || !statusDraft) {
      return;
    }

    setIsUpdatingStatus(true);

    try {
      await adminApi.updateBookingStatus(job.booking._id, statusDraft);
      message.success("Booking status updated successfully.");
      setRequestVersion((currentValue) => currentValue + 1);
    } catch (apiError) {
      message.error(getApiErrorMessage(apiError));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleApproveCompletion = async () => {
    if (!job?.booking?._id) {
      return;
    }

    setIsApprovingCompletion(true);

    try {
      await adminApi.approveBookingCompletion(job.booking._id, reviewNotes);
      message.success("Completion approved and payment release triggered.");
      setRequestVersion((currentValue) => currentValue + 1);
    } catch (apiError) {
      message.error(getApiErrorMessage(apiError));
    } finally {
      setIsApprovingCompletion(false);
    }
  };

  const timelineItems = useMemo(() => {
    if (!job) {
      return [];
    }

    return [
      {
        label: "Job submitted",
        value: formatBookingDateTime(job.createdAt),
        complete: true,
      },
      {
        label: "Hero accepted",
        value: job.booking?.createdAt ? formatBookingDateTime(job.booking.createdAt) : "Pending",
        complete: Boolean(job.booking?._id),
      },
      {
        label: "Work started",
        value: job.booking?.startedAt ? formatBookingDateTime(job.booking.startedAt) : "Pending",
        complete: Boolean(job.booking?.startedAt),
      },
      {
        label: "Proof submitted",
        value: job.booking?.verificationSubmittedAt
          ? formatBookingDateTime(job.booking.verificationSubmittedAt)
          : "Pending",
        complete: Boolean(job.booking?.verificationSubmittedAt),
      },
      {
        label: "Approved",
        value: job.booking?.verificationApprovedAt
          ? formatBookingDateTime(job.booking.verificationApprovedAt)
          : "Pending",
        complete: Boolean(job.booking?.verificationApprovedAt),
      },
      {
        label: "Payment received",
        value: job.payment?.paidAt ? formatBookingDateTime(job.payment.paidAt) : "Pending",
        complete: job.payment?.status === "paid",
      },
    ];
  }, [job]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 mt-16">
        <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading booking details...
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 mt-16">
        <button
          type="button"
          onClick={() => navigate("/booking")}
          className="mb-6 flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Bookings
        </button>

        <div className="rounded-lg bg-white p-10 text-center text-red-600 shadow-sm">
          {error || "Booking not found."}
        </div>
      </div>
    );
  }

  const customerName = getBookingCustomerName(job);
  const customerEmail = getBookingCustomerEmail(job);
  const workerName = getBookingHeroName(job);
  const paymentAmount = job.payment?.jobSubtotal || job.estimatedPrice || 0;
  const bookingFee = Number(job.payment?.bookingFee || 0);
  const customerTotal = job.payment?.amount || paymentAmount + bookingFee;
  const platformFee = job.payment?.platformFee || 0;
  const workerPayout =
    job.payment?.workerPayout ?? Number((paymentAmount - platformFee).toFixed(2));
  const canUpdateStatus = Boolean(job.booking?._id);

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-16">
      <div className="mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/booking")}
              className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Bookings
            </button>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">
              Booking {getBookingIdLabel(job._id)}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review the customer request, assignment state, and payment details.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBookingStatusClasses(
                        job.status
                      )}`}
                    >
                      {getBookingStatusLabel(job.status)}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getUrgencyClasses(
                        job.urgency
                      )}`}
                    >
                      {getUrgencyLabel(job.urgency)}
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">
                    {job.title || job.serviceType || "Service request"}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    {job.serviceType || "General yard work"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Total Amount
                  </div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    {formatCurrency(paymentAmount)}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Preferred date</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {formatBookingDate(job.preferredDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Preferred time</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {formatPreferredSchedule(job)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Service address</p>
                    <p className="mt-1 text-sm text-gray-600">{formatBookingLocation(job)}</p>
                    {job.streetAddress ? (
                      <p className="mt-1 text-sm text-gray-500">{job.streetAddress}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                      {getInitials(customerName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{customerName}</p>
                      <p className="text-sm text-gray-500">Customer</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {job.customer?.phone || job.phoneNumber || "Phone not provided"}
                      </p>
                      <p className="text-sm text-gray-500">Phone</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{customerEmail}</p>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Job Description</h3>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {job.jobDescription || "No description was provided for this booking."}
              </p>

              {job.booking?.notes ? (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-4">
                  <p className="text-sm font-semibold text-blue-900">Booking Notes</p>
                  <p className="mt-1 text-sm text-blue-800">{job.booking.notes}</p>
                </div>
              ) : null}

              {job.booking?.cancelReason ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-4">
                  <p className="text-sm font-semibold text-red-900">Cancel Reason</p>
                  <p className="mt-1 text-sm text-red-800">{job.booking.cancelReason}</p>
                </div>
              ) : null}
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Uploaded Photos</h3>
              {Array.isArray(job.photos) && job.photos.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {job.photos.map((photo, index) => (
                    <div
                      key={`${photo}-${index}`}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <img
                        src={resolveProofMediaUrl(photo)}
                        alt={`Booking photo ${index + 1}`}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                  No photos were uploaded for this booking.
                </div>
              )}
            </section>

            {(Array.isArray(job.booking?.verificationPhotoUrls) &&
              job.booking.verificationPhotoUrls.length > 0) ||
            job.booking?.verificationVideoUrl ? (
              <section className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">Completion Verification</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Review the worker proof before approving payout release.
                </p>

                {Array.isArray(job.booking?.verificationPhotoUrls) &&
                job.booking.verificationPhotoUrls.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {job.booking.verificationPhotoUrls.map((photo, index) => (
                      <div
                        key={`${photo}-${index}`}
                        className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <img
                          src={resolveProofMediaUrl(photo)}
                          alt={`Verification photo ${index + 1}`}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                {job.booking?.verificationVideoUrl ? (
                  <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">Verification video</p>
                    <video
                      controls
                      src={resolveProofMediaUrl(job.booking.verificationVideoUrl)}
                      className="mt-4 max-h-[360px] w-full rounded-lg bg-black"
                    />
                  </div>
                ) : null}

                {job.booking?.workerCompletionNotes ? (
                  <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900">Hero notes</p>
                    <p className="mt-2 text-sm text-gray-700">
                      {job.booking.workerCompletionNotes}
                    </p>
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Hero Information</h3>
              {job.assignedWorker ? (
                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                      {getInitials(workerName)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{workerName}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {Array.isArray(job.assignedWorker.skills) &&
                        job.assignedWorker.skills.length
                          ? job.assignedWorker.skills.join(", ")
                          : "No skills listed"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{job.assignedWorker.email || "Email not provided"}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{job.assignedWorker.phone || "Phone not provided"}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-7 text-gray-600">
                  This request has not been accepted by a Hero yet.
                </div>
              )}
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Job subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(paymentAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Booking fee</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(bookingFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Customer total</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(customerTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Platform fee</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(platformFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm">
                  <span className="text-gray-600">Hero payout</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(workerPayout)}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Payment status</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {job.payment?.status || job.paymentStatus || "pending"}
                    </p>
                    {job.payment?.paidAt ? (
                      <p className="mt-1 text-xs text-gray-500">
                        Paid on {formatBookingDateTime(job.payment.paidAt)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
              <div className="mt-5 space-y-5">
                {timelineItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                        item.complete ? "bg-green-700 text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {item.complete ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock3 className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="mt-1 text-sm text-gray-600">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Admin Actions</h3>

              <div className="mt-5 space-y-4">
                {job.booking?.status === "pending_verification" ? (
                  <>
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                      This booking is waiting for proof review. Approving it will attempt to capture the held customer payment and release payout.
                    </div>

                    <label className="block text-sm font-medium text-gray-700">
                      Review notes
                      <textarea
                        rows={4}
                        value={reviewNotes}
                        onChange={(event) => setReviewNotes(event.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-700"
                        placeholder="Optional notes for approval or internal record."
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleApproveCompletion}
                      disabled={isApprovingCompletion}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A3019] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#0d3d20] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isApprovingCompletion ? "Approving..." : "Approve and Release Payout"}
                    </button>
                  </>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Update booking status
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(event) => setStatusDraft(event.target.value)}
                    disabled={!canUpdateStatus || isUpdatingStatus}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="">Select a status</option>
                    {BOOKING_STATUS_UPDATE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={!canUpdateStatus || !statusDraft || isUpdatingStatus}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A3019] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#0d3d20] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingStatus ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Status"
                  )}
                </button>

                {!canUpdateStatus ? (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                    This job has not been accepted yet, so there is no booking record to update.
                  </div>
                ) : null}

                <a
                  href={`tel:${job.customer?.phone || job.phoneNumber || ""}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300 transition hover:bg-gray-50"
                >
                  <Phone className="h-4 w-4" />
                  Call Customer
                </a>

                <a
                  href={`mailto:${customerEmail}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300 transition hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4" />
                  Email Customer
                </a>
              </div>
            </section>

            <section className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-700" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Internal note</p>
                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    Use this page to monitor job progress. Operational status updates work only
                    after a Hero has accepted the request and a booking record exists.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
