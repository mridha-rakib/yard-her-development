"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LoaderCircle,
  Lock,
  MapPin,
  MessageSquareText,
  Quote,
  Shield,
  Star,
} from "lucide-react";
import { buildLoginPath, buildSignUpPath } from "@/lib/auth/auth-redirect";
import { hasRole, ROLES } from "@/lib/auth/user-roles";
import { getApiErrorMessage } from "@/lib/api/http";
import { testimonialApi } from "@/lib/api/testimonial-api";
import { useAuthStore } from "@/stores/use-auth-store";

const EMPTY_FORM = {
  rating: 5,
  text: "",
  location: "",
};

const formatReviewDate = (value) => {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const buildSuggestedLocation = (user) =>
  [user?.location?.city, user?.location?.state].filter(Boolean).join(", ");

const getAverageRating = (testimonials = []) => {
  if (!testimonials.length) {
    return "0.0";
  }

  const totalRating = testimonials.reduce(
    (sum, testimonial) => sum + Number(testimonial.rating || 0),
    0
  );

  return (totalRating / testimonials.length).toFixed(1);
};

const StarRating = ({
  rating = 0,
  interactive = false,
  onChange,
  sizeClassName = "h-4 w-4",
}) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= rating;
      const iconClassName = `${sizeClassName} transition-colors ${
        isActive ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"
      }`;

      if (!interactive) {
        return <Star key={starValue} className={iconClassName} />;
      }

      return (
        <button
          key={starValue}
          type="button"
          onClick={() => onChange?.(starValue)}
          className="rounded-full p-1 transition hover:bg-white/10"
          aria-label={`Set rating to ${starValue} stars`}
        >
          <Star className={iconClassName} />
        </button>
      );
    })}
  </div>
);

const ReviewCard = ({ testimonial }) => (
  <article className="group flex h-full flex-col rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_30px_90px_-42px_rgba(5,150,105,0.32)]">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 text-lg font-semibold text-white shadow-lg">
          {testimonial.name?.charAt(0) || "C"}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{testimonial.name}</h3>
          <p className="text-sm text-slate-500">{testimonial.role}</p>
        </div>
      </div>

      {testimonial.isOwn ? (
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Your review
        </span>
      ) : null}
    </div>

    <div className="mb-4 flex items-center justify-between gap-4">
      <StarRating rating={testimonial.rating} />
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
        {formatReviewDate(testimonial.updatedAt || testimonial.createdAt)}
      </p>
    </div>

    <div className="relative mb-5 flex-1 rounded-[24px] bg-slate-50 px-5 py-4 text-[15px] leading-7 text-slate-700">
      <Quote className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
      <p className="pl-5">{testimonial.text}</p>
    </div>

    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
      <MapPin className="h-4 w-4 text-emerald-600" />
      <span>{testimonial.location || "Verified customer"}</span>
    </div>
  </article>
);

const ReviewSkeleton = () => (
  <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]">
    <div className="mb-5 flex items-center gap-3">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
      <div className="space-y-2">
        <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
    <div className="mb-4 h-4 w-28 animate-pulse rounded-full bg-slate-100" />
    <div className="space-y-3 rounded-[24px] bg-slate-50 p-5">
      <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
      <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-100" />
      <div className="h-3 w-4/6 animate-pulse rounded-full bg-slate-100" />
    </div>
  </div>
);

const TestimonialsPage = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isReady = useAuthStore((state) => state.isReady);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [isLoadingOwnReview, setIsLoadingOwnReview] = useState(false);
  const [listError, setListError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [existingReviewId, setExistingReviewId] = useState("");

  const loginHref = buildLoginPath("/testimonials");
  const signUpHref = buildSignUpPath("/testimonials");
  const canLeaveReview =
    isAuthenticated && Boolean(user) && user.role !== ROLES.ADMIN && hasRole(user, ROLES.CUSTOMER);
  const reviewCount = testimonials.length;
  const averageRating = getAverageRating(testimonials);
  const latestReviewDate =
    testimonials[0]?.updatedAt || testimonials[0]?.createdAt || null;

  useEffect(() => {
    let ignore = false;

    const loadTestimonials = async () => {
      setIsLoadingTestimonials(true);
      setListError("");

      try {
        const items = await testimonialApi.listTestimonials({ limit: 24 });

        if (!ignore) {
          setTestimonials(Array.isArray(items) ? items : []);
        }
      } catch (error) {
        if (!ignore) {
          setListError(getApiErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setIsLoadingTestimonials(false);
        }
      }
    };

    loadTestimonials();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!canLeaveReview) {
      setExistingReviewId("");
      setForm((current) =>
        current.text || current.location
          ? current
          : {
              ...EMPTY_FORM,
              location: buildSuggestedLocation(user),
            }
      );
      return;
    }

    let ignore = false;

    const loadOwnReview = async () => {
      setIsLoadingOwnReview(true);
      setSubmitError("");

      try {
        const testimonial = await testimonialApi.getMyTestimonial();

        if (ignore) {
          return;
        }

        if (testimonial) {
          setExistingReviewId(testimonial.id);
          setForm({
            rating: testimonial.rating,
            text: testimonial.text,
            location: testimonial.location,
          });
        } else {
          setExistingReviewId("");
          setForm({
            ...EMPTY_FORM,
            location: buildSuggestedLocation(user),
          });
        }
      } catch (error) {
        if (!ignore) {
          setSubmitError(getApiErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setIsLoadingOwnReview(false);
        }
      }
    };

    loadOwnReview();

    return () => {
      ignore = true;
    };
  }, [canLeaveReview, isReady, user]);

  const handleFieldChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (submitError) {
      setSubmitError("");
    }

    if (submitSuccess) {
      setSubmitSuccess("");
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!canLeaveReview) {
      setSubmitError("Please sign in as a customer to leave a review.");
      return;
    }

    if (String(form.text || "").trim().length < 20) {
      setSubmitError("Please share at least 20 characters about your experience.");
      return;
    }

    if (String(form.location || "").trim().length > 80) {
      setSubmitError("Location must be 80 characters or fewer.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const savedReview = await testimonialApi.upsertMyTestimonial({
        rating: form.rating,
        text: form.text,
        location: form.location,
      });

      setExistingReviewId(savedReview.id);
      setTestimonials((current) => {
        const nextTestimonials = current.filter((item) => item.id !== savedReview.id);
        return [{ ...savedReview, isOwn: true }, ...nextTestimonials];
      });
      setForm({
        rating: savedReview.rating,
        text: savedReview.text,
        location: savedReview.location,
      });
      setSubmitSuccess(
        existingReviewId
          ? "Your review has been updated."
          : "Your review is now live on the page."
      );
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#f8faf8] px-4 py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 shadow-sm">
            <Shield className="h-4 w-4" />
            Customer Reviews
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Let Customers Tell the Story
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Signed-in customers can now leave a review right from this page. Every
            review comes from a real account, so new visitors can see honest feedback
            before they book.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="rounded-[32px] bg-[#0d2c1d] p-8 text-white shadow-[0_36px_120px_-55px_rgba(10,48,25,0.8)]">
            <div className="mb-8 space-y-3">
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                Leave a review
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">
                {existingReviewId ? "Update your review" : "Share your experience"}
              </h2>
              <p className="text-sm leading-7 text-emerald-50/85">
                Reviews help future customers book with confidence and help the platform
                understand what is working well.
              </p>
            </div>

            {!isReady ? (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-emerald-50/80">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Preparing your review form...
              </div>
            ) : canLeaveReview ? (
              <form onSubmit={handleSubmitReview} className="space-y-6">
                {submitError ? (
                  <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {submitError}
                  </div>
                ) : null}

                {submitSuccess ? (
                  <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                    {submitSuccess}
                  </div>
                ) : null}

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
                    Rating
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <StarRating
                      rating={form.rating}
                      interactive
                      onChange={(value) => handleFieldChange("rating", value)}
                      sizeClassName="h-6 w-6"
                    />
                    <span className="text-sm text-emerald-100/80">
                      {form.rating} out of 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-emerald-50">
                    Your review
                  </label>
                  <textarea
                    rows={6}
                    value={form.text}
                    onChange={(event) => handleFieldChange("text", event.target.value)}
                    placeholder="What stood out during your booking or service experience?"
                    className="w-full rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white outline-none transition placeholder:text-emerald-50/40 focus:border-emerald-300 focus:bg-white/10"
                  />
                  <p className="mt-2 text-xs text-emerald-100/70">
                    Minimum 20 characters. Keep it specific and helpful.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-emerald-50">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) => handleFieldChange("location", event.target.value)}
                    placeholder="City or neighborhood"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none transition placeholder:text-emerald-50/40 focus:border-emerald-300 focus:bg-white/10"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-black/10 px-4 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{user?.name || "Customer"}</p>
                    <p className="text-xs text-emerald-100/70">
                      Signed in customers can publish one review and update it anytime.
                    </p>
                  </div>
                  {isLoadingOwnReview ? (
                    <LoaderCircle className="h-5 w-5 animate-spin text-emerald-200" />
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingOwnReview}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-[#0d2c1d] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving review...
                    </>
                  ) : existingReviewId ? (
                    "Update Review"
                  ) : (
                    "Publish Review"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="inline-flex rounded-2xl bg-white/10 p-3">
                  <Lock className="h-6 w-6 text-emerald-100" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-white">
                    Sign in to leave a review
                  </h3>
                  <p className="text-sm leading-7 text-emerald-50/80">
                    Reviews are tied to real customer accounts so the feedback on this page
                    stays trustworthy and useful.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={loginHref}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0d2c1d] transition hover:bg-emerald-50"
                  >
                    Log In
                  </Link>
                  <Link
                    href={signUpHref}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Average Rating
                </p>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">
                    {averageRating}
                  </span>
                  <StarRating rating={Math.round(Number(averageRating) || 0)} />
                </div>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Live Reviews
                </p>
                <div className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
                  {reviewCount}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Real reviews submitted from customer accounts.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Latest Activity
                </p>
                <div className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
                  {latestReviewDate ? formatReviewDate(latestReviewDate) : "Waiting for the first review"}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  New submissions show up here after they are saved.
                </p>
              </div>
            </div>

            <div className="rounded-[32px] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                    <MessageSquareText className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                    Verified, account-based reviews
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Every review on this page comes from a signed-in customer account.
                    That keeps the feedback real, easy to trust, and directly connected to
                    actual platform users.
                  </p>
                </div>

                <div className="rounded-[24px] border border-emerald-100 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
                  <p className="font-semibold text-slate-900">Helpful review tips</p>
                  <p className="mt-2 leading-6">
                    Mention what was smooth, what could be better, and what other customers
                    should know before booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Latest Reviews
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              What customers are saying right now
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-500">
            Newly saved reviews appear here immediately, so the page stays fresh and
            useful for future customers.
          </p>
        </div>

        {listError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {listError}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoadingTestimonials
            ? Array.from({ length: 6 }, (_, index) => <ReviewSkeleton key={index} />)
            : testimonials.map((testimonial) => (
                <ReviewCard key={testimonial.id} testimonial={testimonial} />
              ))}
        </div>

        {!isLoadingTestimonials && !testimonials.length ? (
          <div className="mt-10 rounded-[32px] border border-dashed border-slate-300 bg-white/90 px-6 py-12 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              No reviews yet
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900">
              Be the first customer to leave feedback
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Once a customer submits a review, it will appear here for everyone visiting
              the testimonials page.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default TestimonialsPage;
