import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MessageSquareQuote,
  Search,
  Star,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin-api";
import { getApiErrorMessage } from "../../lib/api/http";
import {
  TESTIMONIAL_PAGE_SIZE,
  TESTIMONIAL_SORT_OPTIONS,
  buildVisiblePages,
  formatReviewDate,
  getPublicDisplayName,
  getReviewerEmail,
  getReviewerName,
  getReviewerPhone,
} from "../../lib/testimonials";
import { getInitials } from "../../lib/workers";

const RatingStars = ({ rating }) => {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating || 0)));

  return (
    <div className="flex items-center gap-1" aria-label={`${normalizedRating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < normalizedRating;

        return (
          <Star
            key={index}
            className={`h-4 w-4 ${
              isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        );
      })}
      <span className="ml-1 text-sm font-semibold text-gray-900">{normalizedRating}</span>
    </div>
  );
};

const Testimonials = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const [testimonials, setTestimonials] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: TESTIMONIAL_PAGE_SIZE,
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

    const loadTestimonials = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = {
          page: currentPage,
          limit: TESTIMONIAL_PAGE_SIZE,
          sort: sortValue,
        };

        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        const response = await adminApi.listTestimonials(params);

        if (!ignore) {
          setTestimonials(response.items || []);
          setPagination(response.pagination);
        }
      } catch (apiError) {
        if (!ignore) {
          setTestimonials([]);
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

    loadTestimonials();

    return () => {
      ignore = true;
    };
  }, [currentPage, debouncedSearchTerm, sortValue]);

  const summary = useMemo(() => {
    const ratingValues = testimonials
      .map((testimonial) => Number(testimonial.rating || 0))
      .filter((rating) => rating > 0);
    const averageRating =
      ratingValues.length > 0
        ? ratingValues.reduce((total, rating) => total + rating, 0) / ratingValues.length
        : 0;

    return {
      total: pagination.total || 0,
      averageRating,
      currentPageCount: testimonials.length,
    };
  }, [pagination.total, testimonials]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortValue(event.target.value);
    setCurrentPage(1);
  };

  const handleViewCustomer = (customerId) => {
    if (customerId) {
      navigate(`/customer/${customerId}`);
    }
  };

  const totalPages = pagination.totalPages || 1;
  const visiblePages = buildVisiblePages(currentPage, totalPages);
  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);
  const statCards = [
    {
      title: "Total Reviews",
      value: Number(summary.total || 0).toLocaleString(),
      icon: MessageSquareQuote,
      iconClasses: "bg-green-100 text-green-700",
    },
    {
      title: "Page Average",
      value: summary.averageRating ? summary.averageRating.toFixed(1) : "0.0",
      icon: Star,
      iconClasses: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Visible On Page",
      value: Number(summary.currentPageCount || 0).toLocaleString(),
      icon: UserRound,
      iconClasses: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-16">
      <div className="mx-auto">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Review Management</h1>
        <p className="mb-6 text-sm text-gray-500">
          See each public testimonial with the full customer account and login email connected to it.
        </p>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.title} className="rounded-lg bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.iconClasses}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                    <div className="text-sm text-gray-500">{card.title}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by reviewer name, email, phone, or review text..."
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <select
              value={sortValue}
              onChange={handleSortChange}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {TESTIMONIAL_SORT_OPTIONS.map((option) => (
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
                    Posted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Public Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading reviews...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : testimonials.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  testimonials.map((testimonial) => {
                    const reviewerName = getReviewerName(testimonial);
                    const reviewerEmail = getReviewerEmail(testimonial);
                    const customerId = testimonial.customer?.id || testimonial.customerId;

                    return (
                      <tr key={testimonial._id || testimonial.id} className="transition hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {testimonial.customer?.profilePhotoUrl ? (
                              <img
                                src={testimonial.customer.profilePhotoUrl}
                                alt={reviewerName}
                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800">
                                {getInitials(reviewerName)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-gray-900">
                                {reviewerName}
                              </div>
                              <div className="flex min-w-0 items-center gap-1 text-xs text-gray-500">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{reviewerEmail}</span>
                              </div>
                              <div className="truncate text-xs text-gray-400">
                                {getReviewerPhone(testimonial)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {getPublicDisplayName(testimonial)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <RatingStars rating={testimonial.rating} />
                        </td>

                        <td className="px-6 py-4">
                          <p className="max-w-md break-words text-sm leading-6 text-gray-700">
                            {testimonial.text || "No review text"}
                          </p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {testimonial.location || "Not provided"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatReviewDate(testimonial.updatedAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Posted {formatReviewDate(testimonial.createdAt)}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleViewCustomer(customerId)}
                            disabled={!customerId}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Eye className="h-4 w-4" />
                            Customer
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

export default Testimonials;
