"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { paymentApi } from "@/lib/api/payment-api";
import {
  clonePricingCategories,
  normalizePricingCategories,
  calculateServiceQuote,
  formatPrice,
  requiresSquareFootage,
  isMulchingService,
  isFixedPriceService,
} from "@/lib/pricing-content";
import { buildBookServicePath } from "@/lib/booking-service";
import { CUSTOMER_BOOKING_FEE, getCustomerCheckoutTotal } from "@/lib/payment-fees";

const DEPTH_OPTIONS = ["2", "3", "4"];

const InstantPriceCalculator = () => {
  const router = useRouter();
  const [categories, setCategories] = useState(() => clonePricingCategories());
  const [optionValue, setOptionValue] = useState("");
  const [sqft, setSqft] = useState("1500");
  const [depthIn, setDepthIn] = useState("3");

  // Load the live, admin-configured rates so the homepage never drifts from the
  // pricing engine. Falls back to the bundled defaults if the request fails.
  useEffect(() => {
    let isActive = true;

    paymentApi
      .getPricingRules()
      .then((data) => {
        if (isActive && data?.categories) {
          setCategories(normalizePricingCategories(data.categories));
        }
      })
      .catch(() => {
        // Keep the bundled defaults already in state.
      });

    return () => {
      isActive = false;
    };
  }, []);

  const flattenedServices = useMemo(
    () =>
      categories.flatMap((category) =>
        category.services
          .filter((service) => service.isActive !== false)
          .map((service) => ({
            ...service,
            categoryId: category.id,
            categoryLabel: category.label,
            optionValue: `${category.id}::${service.id}`,
          }))
      ),
    [categories]
  );

  // Default to the first available service once rates load.
  useEffect(() => {
    if (!optionValue && flattenedServices.length) {
      setOptionValue(flattenedServices[0].optionValue);
    }
  }, [flattenedServices, optionValue]);

  const selectedService = useMemo(
    () => flattenedServices.find((service) => service.optionValue === optionValue) || null,
    [flattenedServices, optionValue]
  );

  const quote = useMemo(() => {
    if (!selectedService) {
      return null;
    }

    return calculateServiceQuote(selectedService, {
      sqft: Number(sqft || 0),
      depthIn: Number(depthIn || 0),
    });
  }, [selectedService, sqft, depthIn]);

  const needsSqft = selectedService ? requiresSquareFootage(selectedService) : false;
  const isMulch = selectedService ? isMulchingService(selectedService) : false;
  const isFixed = selectedService ? isFixedPriceService(selectedService) : false;

  const finalPrice = quote?.finalPrice ?? 0;
  const checkoutTotal = getCustomerCheckoutTotal(finalPrice);

  const handleBook = () => {
    if (!selectedService) {
      return;
    }

    const category = {
      id: selectedService.categoryId,
      label: selectedService.categoryLabel,
    };
    let path = buildBookServicePath(selectedService, category);

    // Carry the measurement forward so /book can pre-fill it (optional to read).
    const extra = [];
    if (needsSqft && Number(sqft) > 0) {
      extra.push(`sqft=${encodeURIComponent(sqft)}`);
    }
    if (isMulch && Number(depthIn) > 0) {
      extra.push(`depthIn=${encodeURIComponent(depthIn)}`);
    }
    if (extra.length) {
      path = `${path}&${extra.join("&")}`;
    }

    router.push(path);
  };

  return (
    <section className="bg-[#0f1a14] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            See your price before you book
          </h2>
          <p className="mx-auto max-w-2xl text-[#9db0a3]">
            No quotes, no waiting. Pick a service, enter your yard size, and get a fixed
            price in seconds.
          </p>
        </div>

        <div className="mx-auto max-w-md rounded-2xl border border-[#24352b] bg-[#0b1510] p-6 text-left shadow-xl">
          <p className="mb-4 text-[13px] tracking-wide text-[#9db0a3]">Instant Price</p>

          <label className="text-xs text-[#9db0a3]" htmlFor="ipc-service">
            Service
          </label>
          <select
            id="ipc-service"
            value={optionValue}
            onChange={(event) => setOptionValue(event.target.value)}
            className="mb-4 mt-1.5 block w-full min-h-[46px] rounded-lg border border-[#2b3f33] bg-[#0b1510] px-3.5 py-3 text-sm leading-normal text-[#eaf1ea] outline-none focus:border-[#8bad8f]"
          >
            {categories.map((category) => {
              const activeServices = category.services.filter(
                (service) => service.isActive !== false
              );

              if (!activeServices.length) {
                return null;
              }

              return (
                <optgroup key={category.id} label={category.label}>
                  {activeServices.map((service) => (
                    <option key={service.id} value={`${category.id}::${service.id}`}>
                      {service.title}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>

          {needsSqft ? (
            <div className="mb-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#9db0a3]" htmlFor="ipc-sqft">
                  Square feet
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="ipc-sqft"
                    type="number"
                    min="0"
                    step="50"
                    value={sqft}
                    onChange={(event) => setSqft(event.target.value)}
                    className="w-24 rounded-lg border border-[#2b3f33] bg-[#0b1510] px-2.5 py-1.5 text-right text-sm text-[#eaf1ea] outline-none focus:border-[#8bad8f]"
                  />
                  <span className="text-xs text-[#9db0a3]">sq ft</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="8000"
                step="50"
                value={Math.min(8000, Number(sqft || 0))}
                onChange={(event) => setSqft(event.target.value)}
                className="mt-3 w-full accent-[#8bad8f]"
              />
              <div className="mt-1 flex justify-between text-[11px] text-[#5f7268]">
                <span>0</span>
                <span>8,000 sq ft</span>
              </div>
            </div>
          ) : null}

          {isMulch ? (
            <div className="mb-3.5">
              <label className="text-xs text-[#9db0a3]">Mulch depth</label>
              <div className="mt-1.5 flex gap-2">
                {DEPTH_OPTIONS.map((option) => {
                  const active = depthIn === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDepthIn(option)}
                      className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
                        active
                          ? "border-[#8bad8f] bg-[#14231a] text-[#a7c9aa]"
                          : "border-[#2b3f33] bg-[#0b1510] text-[#aebfb2]"
                      }`}
                    >
                      {option}&quot;
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {isFixed ? (
            <div className="mb-3.5 rounded-lg border border-[#2b3f33] bg-[#14231a] px-3.5 py-3 text-[12.5px] text-[#9db0a3]">
              Flat rate — no measurement needed.
            </div>
          ) : null}

          <p className="mb-3 text-[11.5px] text-[#6f8377]">
            {quote?.summary || selectedService?.pricingSummary || ""}
          </p>

          <div className="mb-4 flex items-baseline justify-between border-t border-[#24352b] pt-3.5">
            <span className="text-[13px] text-[#9db0a3]">Your fixed price</span>
            <span className="text-3xl font-medium text-white">${formatPrice(finalPrice)}</span>
          </div>

          <button
            type="button"
            onClick={handleBook}
            disabled={!selectedService}
            className="w-full rounded-lg bg-white py-3 text-[15px] font-semibold text-[#0d1a12] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Book this job
          </button>
          <p className="mt-3 text-center text-[11px] text-[#6f8377]">
            Free to join · ${formatPrice(checkoutTotal)} total incl. ${CUSTOMER_BOOKING_FEE}{" "}
            booking fee
          </p>
        </div>
      </div>
    </section>
  );
};

export default InstantPriceCalculator;
