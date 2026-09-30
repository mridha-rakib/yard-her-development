"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Check, PackageCheck, Upload, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildPathWithSearchParams } from "@/lib/auth/auth-redirect";
import { getApiErrorMessage } from "@/lib/api/http";
import { paymentApi } from "@/lib/api/payment-api";
import { useRequiredRole } from "@/lib/auth/use-required-role";
import {
  buildBookServiceQuery,
  getSelectedServiceFromSearchParams,
} from "@/lib/booking-service";
import { optimizeProfilePhotoFile } from "@/lib/profile-photo";
import {
  calculateServiceQuote,
  clonePricingCategories,
  formatPrice,
  isFixedPriceService,
  isMulchingService,
  normalizePricingCategories,
  requiresSquareFootage,
} from "@/lib/pricing-content";
import { CUSTOMER_BOOKING_FEE, getCustomerCheckoutTotal } from "@/lib/payment-fees";

const createInitialFormData = () => ({
  fullName: null,
  email: null,
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  jobDescription: "",
  urgency: "flexible",
  preferredDate: "",
  preferredTime: "anytime",
  sqft: "",
  depthIn: "3",
});

function BookYardWorkFormContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedServiceFromQuery = useMemo(
    () => getSelectedServiceFromSearchParams(searchParams),
    [searchParams]
  );
  const [categories, setCategories] = useState(() => clonePricingCategories());
  const [pricingConfig, setPricingConfig] = useState({
    bundlingEnabled: false,
    defaultBundleDiscountPercent: 0,
  });
  const [isBundleMode, setIsBundleMode] = useState(false);
  const [selectedBundleServiceIds, setSelectedBundleServiceIds] = useState([]);
  const [bundleMeasurements, setBundleMeasurements] = useState({});
  const flattenedServices = useMemo(
    () =>
      categories.flatMap((category) =>
        category.services.map((service) => ({
          ...service,
          categoryId: category.id,
          categoryLabel: category.label,
          categoryBundleEligible: Boolean(category.bundleEligible),
          categoryBundleDiscountPercent: category.bundleDiscountPercent,
          optionValue: `${category.id}::${service.id}`,
        }))
      ),
    [categories]
  );
  const bundleAvailableServices = useMemo(
    () =>
      flattenedServices.filter(
        (service) => service.bundleEligible && service.categoryBundleEligible
      ),
    [flattenedServices]
  );
  const selectedBundleServices = useMemo(
    () =>
      selectedBundleServiceIds
        .map((serviceId) => flattenedServices.find((service) => service.id === serviceId))
        .filter(Boolean),
    [flattenedServices, selectedBundleServiceIds]
  );
  const matchedService = useMemo(() => {
    const normalizedId = String(selectedServiceFromQuery.id || "").trim();
    const normalizedTitle = String(selectedServiceFromQuery.title || "").trim().toLowerCase();

    return (
      flattenedServices.find((service) => normalizedId && service.id === normalizedId) ||
      flattenedServices.find(
        (service) => normalizedTitle && service.title.toLowerCase() === normalizedTitle
      ) ||
      null
    );
  }, [flattenedServices, selectedServiceFromQuery.id, selectedServiceFromQuery.title]);
  const effectiveSelectedService = useMemo(() => {
    if (!matchedService) {
      return null;
    }

    return {
      ...matchedService,
      categoryId: matchedService.categoryId || selectedServiceFromQuery.categoryId || "",
      categoryLabel:
        matchedService.categoryLabel || selectedServiceFromQuery.categoryLabel || "Pricing",
    };
  }, [
    matchedService,
    selectedServiceFromQuery.categoryId,
    selectedServiceFromQuery.categoryLabel,
  ]);
  const serviceSelectValue = effectiveSelectedService
    ? `${effectiveSelectedService.categoryId}::${effectiveSelectedService.id}`
    : "";
  const bookingPath = useMemo(
    () => buildPathWithSearchParams(pathname, searchParams),
    [pathname, searchParams]
  );
  const { user, isRoleReady } = useRequiredRole("customer", bookingPath);
  const [formData, setFormData] = useState(createInitialFormData);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingFiles, setIsPreparingFiles] = useState(false);

  useEffect(() => {
    let isMounted = true;

    paymentApi
      .getPricingRules()
      .then((pricingRules) => {
        if (isMounted && Array.isArray(pricingRules?.categories)) {
          setCategories(normalizePricingCategories(pricingRules.categories));
          setPricingConfig({
            bundlingEnabled: Boolean(pricingRules.bundlingEnabled),
            defaultBundleDiscountPercent: Number(
              pricingRules.defaultBundleDiscountPercent || 0
            ),
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategories(clonePricingCategories());
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const contactDetails = useMemo(
    () => ({
      fullName: (formData.fullName ?? user?.name ?? "").trim(),
      email: (formData.email ?? user?.email ?? "").trim(),
    }),
    [formData.email, formData.fullName, user]
  );

  const numericSqft = Number(formData.sqft || 0);
  const numericDepthIn = Number(formData.depthIn || 0);
  const bundleServiceInputs = useMemo(
    () =>
      Object.fromEntries(
        selectedBundleServices.map((service) => {
          const measurement = bundleMeasurements[service.id] || {};
          const rawDepthIn = measurement.depthIn;

          return [
            service.id,
            {
              sqft: Number(measurement.sqft || 0),
              depthIn:
                rawDepthIn === undefined || rawDepthIn === null || rawDepthIn === ""
                  ? Number(service.defaultDepthIn || 3)
                  : Number(rawDepthIn || 0),
            },
          ];
        })
      ),
    [bundleMeasurements, selectedBundleServices]
  );
  const singleServiceQuote = useMemo(() => {
    if (!effectiveSelectedService) {
      return null;
    }

    return calculateServiceQuote(effectiveSelectedService, {
      sqft: numericSqft,
      depthIn: numericDepthIn || effectiveSelectedService.defaultDepthIn || 3,
    });
  }, [effectiveSelectedService, numericDepthIn, numericSqft]);
  const bundleQuote = useMemo(() => {
    if (!isBundleMode || selectedBundleServices.length < 2 || !pricingConfig.bundlingEnabled) {
      return null;
    }

    const serviceQuotes = selectedBundleServices.map((service) => ({
      service,
      quote: calculateServiceQuote(service, {
        sqft: bundleServiceInputs[service.id]?.sqft || 0,
        depthIn: bundleServiceInputs[service.id]?.depthIn || service.defaultDepthIn || 3,
      }),
    }));
    const subtotalBeforeDiscount = serviceQuotes.reduce(
      (sum, item) => sum + Number(item.quote?.finalPrice || 0),
      0
    );
    const selectedCategoryIds = [
      ...new Set(selectedBundleServices.map((service) => service.categoryId)),
    ];
    const selectedCategoryDiscountPercent =
      selectedCategoryIds.length === 1
        ? selectedBundleServices.find(
            (service) =>
              service.categoryBundleDiscountPercent !== undefined &&
              service.categoryBundleDiscountPercent !== null &&
              service.categoryBundleDiscountPercent !== ""
          )?.categoryBundleDiscountPercent
        : null;
    const discountPercent = Math.min(
      100,
      Math.max(
        0,
        Number(
          selectedCategoryDiscountPercent !== null &&
            selectedCategoryDiscountPercent !== undefined &&
            selectedCategoryDiscountPercent !== ""
            ? selectedCategoryDiscountPercent
            : pricingConfig.defaultBundleDiscountPercent || 0
        )
      )
    );
    const discountAmount = Number(
      ((subtotalBeforeDiscount * discountPercent) / 100).toFixed(2)
    );
    const finalPrice = Number((subtotalBeforeDiscount - discountAmount).toFixed(2));

    return {
      pricingType: "bundle",
      input: {
        serviceInputs: Object.fromEntries(
          serviceQuotes.map((item) => [item.service.id, item.quote?.input || {}])
        ),
      },
      services: serviceQuotes.map((item) => ({
        serviceId: item.service.id,
        serviceTitle: item.service.title,
        categoryId: item.service.categoryId,
        categoryLabel: item.service.categoryLabel,
        ...item.quote,
      })),
      bundleServiceIds: selectedBundleServices.map((service) => service.id),
      bundleServiceTitles: selectedBundleServices.map((service) => service.title),
      subtotalBeforeDiscount,
      discountPercent,
      discountAmount,
      finalPrice,
      summary:
        discountPercent > 0
          ? `${selectedBundleServices.length} bundled services with ${discountPercent}% bundle discount`
          : `${selectedBundleServices.length} bundled services`,
    };
  }, [
    bundleServiceInputs,
    isBundleMode,
    pricingConfig.bundlingEnabled,
    pricingConfig.defaultBundleDiscountPercent,
    selectedBundleServices,
  ]);
  const quote = isBundleMode ? bundleQuote : singleServiceQuote;

  const hasSelectedService = isBundleMode
    ? selectedBundleServices.length >= 2
    : Boolean(effectiveSelectedService?.id);
  const sqftRequired = isBundleMode
    ? selectedBundleServices.some((service) => requiresSquareFootage(service))
    : requiresSquareFootage(effectiveSelectedService);
  const mulchService = isBundleMode
    ? selectedBundleServices.some((service) => isMulchingService(service))
    : isMulchingService(effectiveSelectedService);
  const fixedPriceService = isBundleMode
    ? selectedBundleServices.length > 0 &&
      selectedBundleServices.every((service) => isFixedPriceService(service))
    : isFixedPriceService(effectiveSelectedService);
  const finalPrice = Number(
    quote?.finalPrice || (!isBundleMode ? effectiveSelectedService?.price : 0) || 0
  );
  const checkoutTotal = getCustomerCheckoutTotal(finalPrice);

  if (!isRoleReady) {
    return <div className="min-h-screen bg-gray-50 py-8 px-4" />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((currentValue) => ({
        ...currentValue,
        [name]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleServiceSelectionChange = (event) => {
    const nextValue = event.target.value;
    const nextParams = new URLSearchParams(searchParams.toString());

    if (!nextValue) {
      [
        "serviceId",
        "serviceTitle",
        "servicePrice",
        "serviceDuration",
        "serviceDescription",
        "categoryId",
        "categoryLabel",
      ].forEach((key) => nextParams.delete(key));
    } else {
      const nextService = flattenedServices.find((service) => service.optionValue === nextValue);

      if (!nextService) {
        return;
      }

      const nextQuery = buildBookServiceQuery(nextService, {
        id: nextService.categoryId,
        label: nextService.categoryLabel,
      });

      Object.entries(nextQuery).forEach(([key, value]) => {
        if (value) {
          nextParams.set(key, value);
        } else {
          nextParams.delete(key);
        }
      });
    }

    const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    router.replace(nextUrl);

    if (errors.serviceSelection) {
      setErrors((currentValue) => ({
        ...currentValue,
        serviceSelection: "",
      }));
    }
  };

  const toggleBundleService = (serviceId) => {
    const isSelected = selectedBundleServiceIds.includes(serviceId);

    setSelectedBundleServiceIds((currentValue) =>
      currentValue.includes(serviceId)
        ? currentValue.filter((entry) => entry !== serviceId)
        : [...currentValue, serviceId]
    );

    if (isSelected) {
      setBundleMeasurements((currentValue) => {
        const nextValue = { ...currentValue };
        delete nextValue[serviceId];
        return nextValue;
      });

      setErrors((currentValue) => {
        const nextValue = { ...currentValue };
        delete nextValue[`bundleSqft:${serviceId}`];
        delete nextValue[`bundleDepthIn:${serviceId}`];
        return nextValue;
      });
    }

    if (errors.serviceSelection) {
      setErrors((currentValue) => ({
        ...currentValue,
        serviceSelection: "",
      }));
    }
  };

  const handleBundleMeasurementChange = (serviceId, field, value) => {
    setBundleMeasurements((currentValue) => ({
      ...currentValue,
      [serviceId]: {
        ...(currentValue[serviceId] || {}),
        [field]: value,
      },
    }));

    const errorKey =
      field === "depthIn" ? `bundleDepthIn:${serviceId}` : `bundleSqft:${serviceId}`;

    if (errors[errorKey]) {
      setErrors((currentValue) => ({
        ...currentValue,
        [errorKey]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    setIsPreparingFiles(true);
    setSubmitError("");

    try {
      const nextPhotos = await Promise.all(
        files.map(async (file) => ({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          url: await optimizeProfilePhotoFile(file),
        }))
      );

      setUploadedPhotos((currentValue) => [...currentValue, ...nextPhotos]);
    } catch (error) {
      setSubmitError(error?.message || "We could not prepare those photos.");
    } finally {
      setIsPreparingFiles(false);
    }
  };

  const removePhoto = (photoId) => {
    setUploadedPhotos((currentValue) =>
      currentValue.filter((photo) => photo.id !== photoId)
    );
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!hasSelectedService) {
      nextErrors.serviceSelection = isBundleMode
        ? "Please select at least two bundle services."
        : "Please select a service.";
    }

    if (!contactDetails.fullName) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!contactDetails.email) {
      nextErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(contactDetails.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.streetAddress.trim()) {
      nextErrors.streetAddress = "Street address is required.";
    }

    if (!formData.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!formData.zipCode.trim()) {
      nextErrors.zipCode = "ZIP code is required.";
    }

    if (!formData.jobDescription.trim()) {
      nextErrors.jobDescription = "Describe what needs to be done.";
    }

    if (isBundleMode) {
      selectedBundleServices.forEach((service) => {
        const serviceInput = bundleServiceInputs[service.id] || {};

        if (requiresSquareFootage(service) && Number(serviceInput.sqft || 0) <= 0) {
          nextErrors[`bundleSqft:${service.id}`] =
            `Square footage is required for ${service.title}.`;
        }

        if (isMulchingService(service) && Number(serviceInput.depthIn || 0) <= 0) {
          nextErrors[`bundleDepthIn:${service.id}`] =
            `Depth must be greater than zero for ${service.title}.`;
        }
      });
    } else if (sqftRequired && numericSqft <= 0) {
      nextErrors.sqft = "Square footage is required for this service.";
    }

    if (!isBundleMode && mulchService && numericDepthIn <= 0) {
      nextErrors.depthIn = "Depth must be greater than zero.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !quote || (!isBundleMode && !effectiveSelectedService)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const checkoutServiceTitle = isBundleMode
        ? `Bundle: ${selectedBundleServices.map((service) => service.title).join(", ")}`
        : effectiveSelectedService.title;
      const checkoutServiceId = isBundleMode
        ? `bundle-${selectedBundleServices.map((service) => service.id).join("-")}`
        : effectiveSelectedService.id;

      const checkoutSession = await paymentApi.createJobCheckoutSession({
        amount: finalPrice,
        description: `${checkoutServiceTitle} secure Stripe payment`,
        cancelUrl: bookingPath,
        serviceId: checkoutServiceId,
        bundleServiceIds: isBundleMode ? selectedBundleServices.map((service) => service.id) : [],
        pricingInput: quote.input,
        jobData: {
          title: checkoutServiceTitle,
          serviceId: checkoutServiceId,
          serviceType: checkoutServiceTitle,
          serviceTitle: checkoutServiceTitle,
          serviceCategoryId: isBundleMode ? "bundle" : effectiveSelectedService.categoryId,
          serviceCategoryLabel: isBundleMode ? "Service Bundle" : effectiveSelectedService.categoryLabel,
          bundleServiceIds: isBundleMode ? selectedBundleServices.map((service) => service.id) : [],
          fullName: contactDetails.fullName,
          email: contactDetails.email,
          streetAddress: formData.streetAddress.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          description: formData.jobDescription.trim(),
          urgency: formData.urgency,
          preferredDate: formData.preferredDate || null,
          preferredTime: formData.preferredTime,
          estimatedPrice: finalPrice,
          priceQuoted: finalPrice,
          pricing: {
            serviceId: checkoutServiceId,
            serviceTitle: checkoutServiceTitle,
            categoryId: isBundleMode ? "bundle" : effectiveSelectedService.categoryId,
            categoryLabel: isBundleMode ? "Service Bundle" : effectiveSelectedService.categoryLabel,
            ...quote,
          },
          pricingInput: quote.input,
          photoUrls: uploadedPhotos.map((photo) => photo.url).filter(Boolean),
        },
      });

      if (!checkoutSession?.url) {
        throw new Error("Stripe checkout URL is missing.");
      }

      window.location.assign(checkoutSession.url);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Book with automatic pricing, proof-based verification, and zero negotiation
          </h1>
          <p className="mt-3 text-gray-600">
            Upload a few photos, describe the work, enter the size, and Yard Hero calculates the final price before checkout.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow-sm">
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold text-gray-900">Service Selection</h2>
                {pricingConfig.bundlingEnabled && bundleAvailableServices.length >= 2 ? (
                  <div className="mt-4 rounded-lg border border-green-100 bg-green-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-md bg-white p-2 text-green-800">
                          <PackageCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-950">
                            Bundle eligible services
                          </p>
                          <p className="mt-1 text-sm text-green-800">
                            Select two or more eligible services and receive the active bundle
                            discount at checkout.
                          </p>
                        </div>
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm font-semibold text-green-950">
                        <input
                          type="checkbox"
                          checked={isBundleMode}
                          onChange={(event) => {
                            setIsBundleMode(event.target.checked);
                            if (!event.target.checked) {
                              setSelectedBundleServiceIds([]);
                              setBundleMeasurements({});
                            }
                          }}
                          className="h-4 w-4 rounded border-green-300 text-green-800 focus:ring-green-700"
                        />
                        Build a bundle
                      </label>
                    </div>

                    {isBundleMode ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {bundleAvailableServices.map((service) => (
                          <label
                            key={service.id}
                            className="flex cursor-pointer items-start gap-3 rounded-md border border-green-100 bg-white p-3 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBundleServiceIds.includes(service.id)}
                              onChange={() => toggleBundleService(service.id)}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-green-800 focus:ring-green-700"
                            />
                            <span>
                              <span className="block font-semibold text-gray-900">
                                {service.title}
                              </span>
                              <span className="mt-1 block text-xs text-gray-500">
                                {service.pricingSummary}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isBundleMode ? "Single service disabled while building a bundle" : "Choose Service *"}
                  </label>
                  <select
                    value={serviceSelectValue}
                    onChange={handleServiceSelectionChange}
                    disabled={isBundleMode}
                    className={`w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 ${
                      errors.serviceSelection ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a service</option>
                    {categories.map((category) => (
                      <optgroup key={category.id} label={category.label}>
                        {category.services.map((service) => (
                          <option
                            key={service.id}
                            value={`${category.id}::${service.id}`}
                          >{`${service.title} - ${service.pricingSummary}`}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {errors.serviceSelection ? (
                    <p className="mt-1 text-sm text-red-600">{errors.serviceSelection}</p>
                  ) : null}
                  {!isBundleMode && effectiveSelectedService ? (
                    <div className="mt-4 rounded-lg border border-green-100 bg-green-50 p-4">
                      <p className="text-sm font-semibold text-green-900">
                        {effectiveSelectedService.title}
                      </p>
                      <p className="mt-1 text-sm text-green-800">
                        {effectiveSelectedService.description}
                      </p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-green-700">
                        {effectiveSelectedService.pricingSummary}
                      </p>
                    </div>
                  ) : null}
                  {isBundleMode && selectedBundleServices.length ? (
                    <div className="mt-4 rounded-lg border border-green-100 bg-white p-4">
                      <p className="text-sm font-semibold text-gray-900">
                        Bundle includes {selectedBundleServices.length} service
                        {selectedBundleServices.length === 1 ? "" : "s"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedBundleServices.map((service) => (
                          <span
                            key={service.id}
                            className="rounded-md border border-green-100 bg-green-50 px-2 py-1 text-xs font-medium text-green-900"
                          >
                            {service.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">Service Measurement</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {isBundleMode ? (
                    selectedBundleServices.length ? (
                      selectedBundleServices.map((service) => {
                        const serviceIsFixed = isFixedPriceService(service);
                        const serviceNeedsSqft = requiresSquareFootage(service);
                        const serviceIsMulch = isMulchingService(service);
                        const measurement = bundleMeasurements[service.id] || {};
                        const sqftError = errors[`bundleSqft:${service.id}`];
                        const depthError = errors[`bundleDepthIn:${service.id}`];

                        return (
                          <div
                            key={service.id}
                            className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-4"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {service.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {service.pricingSummary}
                              </p>
                            </div>

                            {serviceIsFixed ? (
                              <p className="mt-3 text-sm text-gray-700">
                                Fixed price. No square-foot measurement is needed.
                              </p>
                            ) : (
                              <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Approximate Square Footage{" "}
                                  {serviceNeedsSqft ? "*" : "(Optional)"}
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={measurement.sqft || ""}
                                    onChange={(event) =>
                                      handleBundleMeasurementChange(
                                        service.id,
                                        "sqft",
                                        event.target.value
                                      )
                                    }
                                    placeholder={
                                      serviceIsMulch
                                        ? "Leave blank to default to 5 yards"
                                        : "Enter service area in sq ft"
                                    }
                                    className={`mt-2 w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 ${
                                      sqftError ? "border-red-500" : "border-gray-300"
                                    }`}
                                  />
                                  {sqftError ? (
                                    <p className="mt-1 text-sm text-red-600">{sqftError}</p>
                                  ) : null}
                                </label>

                                {serviceIsMulch ? (
                                  <label className="text-sm font-medium text-gray-700">
                                    Mulch Depth (inches)
                                    <input
                                      type="number"
                                      min="1"
                                      step="0.5"
                                      value={
                                        measurement.depthIn ??
                                        String(service.defaultDepthIn || 3)
                                      }
                                      onChange={(event) =>
                                        handleBundleMeasurementChange(
                                          service.id,
                                          "depthIn",
                                          event.target.value
                                        )
                                      }
                                      className={`mt-2 w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 ${
                                        depthError ? "border-red-500" : "border-gray-300"
                                      }`}
                                    />
                                    {depthError ? (
                                      <p className="mt-1 text-sm text-red-600">
                                        {depthError}
                                      </p>
                                    ) : null}
                                  </label>
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                        Select bundle services to enter measurements for each service.
                      </div>
                    )
                  ) : (
                    <>
                      {fixedPriceService ? (
                        <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                          This service uses a fixed price. No square-foot measurement is needed.
                        </div>
                      ) : null}

                      {!fixedPriceService ? (
                        <label className="text-sm font-medium text-gray-700">
                          Approximate Square Footage {sqftRequired ? "*" : "(Optional)"}
                          <input
                            type="number"
                            min="0"
                            step="1"
                            name="sqft"
                            value={formData.sqft}
                            onChange={handleChange}
                            placeholder={mulchService ? "Leave blank to default to 5 yards" : "Enter service area in sq ft"}
                            className={`mt-2 w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 ${
                              errors.sqft ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                          {errors.sqft ? (
                            <p className="mt-1 text-sm text-red-600">{errors.sqft}</p>
                          ) : null}
                        </label>
                      ) : null}

                      {mulchService ? (
                        <label className="text-sm font-medium text-gray-700">
                          Mulch Depth (inches)
                          <input
                            type="number"
                            min="1"
                            step="0.5"
                            name="depthIn"
                            value={formData.depthIn}
                            onChange={handleChange}
                            className={`mt-2 w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 ${
                              errors.depthIn ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                          {errors.depthIn ? (
                            <p className="mt-1 text-sm text-red-600">{errors.depthIn}</p>
                          ) : null}
                        </label>
                      ) : null}
                    </>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-gray-700">
                    Full Name *
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName ?? user?.name ?? ""}
                      onChange={handleChange}
                      className={`mt-2 w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.fullName ? (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    ) : null}
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Email *
                    <input
                      type="email"
                      name="email"
                      value={formData.email ?? user?.email ?? ""}
                      onChange={handleChange}
                      className={`mt-2 w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.email ? (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    ) : null}
                  </label>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">Job Location</h2>
                <div className="mt-4 space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Street Address *
                    <input
                      type="text"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleChange}
                      className={`mt-2 w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 ${
                        errors.streetAddress ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.streetAddress ? (
                      <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
                    ) : null}
                  </label>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="text-sm font-medium text-gray-700">
                      City *
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`mt-2 w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.city ? (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                      ) : null}
                    </label>

                    <label className="text-sm font-medium text-gray-700">
                      State
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-green-700"
                      />
                    </label>

                    <label className="text-sm font-medium text-gray-700">
                      ZIP Code *
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={`mt-2 w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 ${
                          errors.zipCode ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.zipCode ? (
                        <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                      ) : null}
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">Describe the Work</h2>
                <label className="mt-4 block text-sm font-medium text-gray-700">
                  Job Description *
                  <textarea
                    rows={5}
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleChange}
                    placeholder="Describe the lawn, bushes, gutters, mulch area, or anything else the Hero should know."
                    className={`mt-2 w-full rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-green-700 ${
                      errors.jobDescription ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.jobDescription ? (
                    <p className="mt-1 text-sm text-red-600">{errors.jobDescription}</p>
                  ) : null}
                </label>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">Timing and Urgency</h2>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    {[
                      { value: "today", label: "Today" },
                      { value: "within24", label: "Within 24 hours" },
                      { value: "flexible", label: "Flexible" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="urgency"
                          value={option.value}
                          checked={formData.urgency === option.value}
                          onChange={handleChange}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-medium text-gray-700">
                      Preferred Date
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-green-700"
                      />
                    </label>

                    <label className="text-sm font-medium text-gray-700">
                      Preferred Time
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-green-700"
                      >
                        <option value="anytime">Any time</option>
                        <option value="morning">Morning (8am - 12pm)</option>
                        <option value="afternoon">Afternoon (12pm - 5pm)</option>
                        <option value="evening">Evening (5pm - 8pm)</option>
                      </select>
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">Upload Photos</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Photos are optional, but they increase trust and help the assigned Hero understand the work before arrival.
                </p>
                <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <input
                    id="job-photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="job-photo-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-3 text-gray-700">
                      {isPreparingFiles ? "Preparing photos..." : "Click to upload lawn, gutter, bush, or area photos"}
                    </p>
                  </label>
                </div>

                {uploadedPhotos.length ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.id} className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <img src={photo.url} alt={photo.name} className="h-28 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute right-2 top-2 rounded-full bg-white p-1 text-red-600 shadow"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <p className="truncate px-3 py-2 text-xs text-gray-600">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Automatic Price Summary</h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-sm text-green-800">
                  <p className="font-semibold">No confusion. No negotiation. No surprises.</p>
                  <p className="mt-2">
                    We compare the minimum price with the calculator result and charge the higher number.
                  </p>
                </div>

                {hasSelectedService ? (
                  <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Service</span>
                      <span className="text-right font-medium text-gray-900">
                        {isBundleMode
                          ? `${selectedBundleServices.length} service bundle`
                          : effectiveSelectedService.title}
                      </span>
                    </div>

                    {isBundleMode ? (
                      <>
                        {selectedBundleServices.map((service) => {
                          const serviceQuote = quote?.services?.find(
                            (entry) => entry.serviceId === service.id
                          );
                          const serviceInput = serviceQuote?.input || {};

                          return (
                            <div key={service.id} className="space-y-1">
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-600">{service.title}</span>
                                <span className="font-medium text-gray-900">
                                  ${formatPrice(serviceQuote?.finalPrice)}
                                </span>
                              </div>
                              {serviceQuote?.pricingType === "sqft" ? (
                                <p className="text-xs leading-5 text-gray-500">
                                  {Number(serviceInput.sqft || 0) > 0
                                    ? `${formatPrice(serviceInput.sqft)} sq ft x $${formatPrice(serviceQuote.unitRate)}/sq ft, minimum $${formatPrice(serviceQuote.minimumPrice)}`
                                    : "Square footage not entered"}
                                </p>
                              ) : null}
                              {serviceQuote?.pricingType === "mulch" ? (
                                <p className="text-xs leading-5 text-gray-500">
                                  {Number(serviceInput.sqft || 0) > 0
                                    ? `${formatPrice(serviceInput.sqft)} sq ft at ${formatPrice(serviceInput.depthIn)} in, ${formatPrice(serviceQuote.measurement?.chargeableYards)} yards charged`
                                    : `${formatPrice(serviceQuote.minimumYards)} yard minimum at ${formatPrice(serviceInput.depthIn)} in`}
                                </p>
                              ) : null}
                            </div>
                          );
                        })}
                        <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
                          <span className="text-gray-600">Bundle subtotal</span>
                          <span className="font-medium text-gray-900">
                            ${formatPrice(quote?.subtotalBeforeDiscount)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">
                            Bundle discount ({formatPrice(quote?.discountPercent)}%)
                          </span>
                          <span className="font-medium text-green-800">
                            -${formatPrice(quote?.discountAmount)}
                          </span>
                        </div>
                      </>
                    ) : null}

                    {!isBundleMode && fixedPriceService ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Fixed price</span>
                        <span className="font-medium text-gray-900">
                          ${formatPrice(quote?.fixedPrice)}
                        </span>
                      </div>
                    ) : null}

                    {!isBundleMode && sqftRequired ? (
                      <>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Minimum price</span>
                          <span className="font-medium text-gray-900">
                            ${formatPrice(quote?.minimumPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Rate</span>
                          <span className="font-medium text-gray-900">
                            {isBundleMode ? "Varies by service" : `$${effectiveSelectedService.unitRate}/sq ft`}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Entered size</span>
                          <span className="font-medium text-gray-900">
                            {numericSqft > 0 ? `${formatPrice(numericSqft)} sq ft` : "Not entered"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Calculator result</span>
                          <span className="font-medium text-gray-900">
                            ${formatPrice(quote?.calculatedPrice)}
                          </span>
                        </div>
                      </>
                    ) : null}

                    {!isBundleMode && mulchService ? (
                      <>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Depth</span>
                          <span className="font-medium text-gray-900">
                            {formatPrice(quote?.input?.depthIn)} in
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Minimum yards</span>
                          <span className="font-medium text-gray-900">
                            {formatPrice(quote?.minimumYards)} yards
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Chargeable yards</span>
                          <span className="font-medium text-gray-900">
                            {formatPrice(quote?.measurement?.chargeableYards)} yards
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Rate</span>
                          <span className="font-medium text-gray-900">
                            ${formatPrice(quote?.unitRate)}/yard
                          </span>
                        </div>
                      </>
                    ) : null}

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Job subtotal</span>
                        <span className="text-3xl font-bold text-gray-900">
                          ${formatPrice(finalPrice)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">Service Fee</span>
                        <span className="font-semibold text-gray-900">
                          ${formatPrice(CUSTOMER_BOOKING_FEE)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                        <span className="font-semibold text-gray-900">Checkout total</span>
                        <span className="text-3xl font-bold text-gray-900">
                          ${formatPrice(checkoutTotal)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">{quote?.summary}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
                    Select a service to preview the automatic Yard Hero price.
                  </div>
                )}

                <div className="space-y-3">
                  {[
                    "Your payment is collected securely through Stripe when you book.",
                    "Yard Hero reviews completion proof before releasing the Hero payout.",
                    "Workers must upload both a verification photo and video before payout release.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {submitError ? (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !hasSelectedService}
                className="mt-6 w-full rounded-md bg-[#0a3019] px-4 py-3 font-medium text-white transition-colors hover:bg-[#0b4221] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Redirecting to Stripe..." : "Continue to Secure Payment"}
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">
                Customer payment is collected securely through Stripe, and Hero payout is released only after completion proof is approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookYardWorkForm() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-8 px-4" />}>
      <BookYardWorkFormContent />
    </Suspense>
  );
}
