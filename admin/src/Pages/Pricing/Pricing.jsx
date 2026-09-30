import React, { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  Check,
  PackageCheck,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminApi } from "../../lib/api/admin-api";
import { getApiErrorMessage } from "../../lib/api/http";

const EMPTY_CONFIG = {
  bundlingEnabled: false,
  defaultBundleDiscountPercent: 0,
  categories: [],
};

const createServiceId = (title = "service") =>
  String(title || "service")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "service";

const createNewService = (categoryId, serviceCount = 0) => ({
  id: `${categoryId || "service"}-${Date.now()}-${serviceCount + 1}`,
  title: "New Service",
  pricingType: "fixed",
  fixedPrice: 0,
  minimumPrice: 0,
  unitRate: 0,
  minimumYards: 5,
  defaultDepthIn: 3,
  isActive: true,
  bundleEligible: false,
  bundleGroupIds: [],
});

const formatPricingRule = (service) => {
  if (service.pricingType === "sqft") {
    return `$${Number(service.minimumPrice || 0).toFixed(2)} minimum or $${Number(
      service.unitRate || 0
    )} per sq ft`;
  }

  if (service.pricingType === "mulch") {
    return `${Number(service.minimumYards || 0)}-yard minimum at $${Number(
      service.unitRate || 0
    ).toFixed(2)}/yard`;
  }

  return `$${Number(service.fixedPrice || 0).toFixed(2)} fixed price`;
};

const inputClassName =
  "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100";

const checkboxClassName = "h-4 w-4 rounded border-gray-300 text-green-800 focus:ring-green-700";

const Pricing = () => {
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const totalServices = useMemo(
    () =>
      config.categories.reduce(
        (runningTotal, category) => runningTotal + category.services.length,
        0
      ),
    [config.categories]
  );

  const bundleEligibleServices = useMemo(
    () =>
      config.categories.reduce(
        (runningTotal, category) =>
          runningTotal + category.services.filter((service) => service.bundleEligible).length,
        0
      ),
    [config.categories]
  );

  const bundleSummaries = useMemo(
    () =>
      config.categories.map((category) => {
        const services = (category.services || []).filter(
          (service) => service.bundleEligible && service.isActive !== false
        );
        const hasDiscountOverride =
          category.bundleDiscountPercent !== undefined &&
          category.bundleDiscountPercent !== null &&
          category.bundleDiscountPercent !== "";

        return {
          id: category.id,
          title: category.title || category.label,
          bundleEligible: Boolean(category.bundleEligible),
          serviceCount: services.length,
          services,
          discountPercent: hasDiscountOverride
            ? Number(category.bundleDiscountPercent || 0)
            : Number(config.defaultBundleDiscountPercent || 0),
          usesGlobalDiscount: !hasDiscountOverride,
        };
      }),
    [config.categories, config.defaultBundleDiscountPercent]
  );

  const loadPricingRules = async () => {
    setIsLoading(true);
    setError("");

    try {
      const pricingRules = await adminApi.getPricingRules();
      setConfig({
        ...EMPTY_CONFIG,
        ...pricingRules,
        categories: pricingRules?.categories || [],
      });
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPricingRules();
  }, []);

  const updateConfigField = (field, value) => {
    setConfig((currentConfig) => ({
      ...currentConfig,
      [field]: value,
    }));
  };

  const updateCategoryField = (categoryIndex, field, value) => {
    setConfig((currentConfig) => ({
      ...currentConfig,
      categories: currentConfig.categories.map((category, index) =>
        index === categoryIndex ? { ...category, [field]: value } : category
      ),
    }));
  };

  const updateServiceField = (categoryIndex, serviceIndex, field, value) => {
    setConfig((currentConfig) => ({
      ...currentConfig,
      categories: currentConfig.categories.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              services: category.services.map((service, nestedIndex) => {
                if (nestedIndex !== serviceIndex) {
                  return service;
                }

                const nextService = { ...service, [field]: value };

                if (field === "title" && !service.id) {
                  nextService.id = createServiceId(value);
                }

                return nextService;
              }),
            }
          : category
      ),
    }));
  };

  const addService = (categoryIndex) => {
    setConfig((currentConfig) => ({
      ...currentConfig,
      categories: currentConfig.categories.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              services: [
                ...category.services,
                createNewService(category.id, category.services.length),
              ],
            }
          : category
      ),
    }));
  };

  const removeService = (categoryIndex, serviceIndex) => {
    setConfig((currentConfig) => ({
      ...currentConfig,
      categories: currentConfig.categories.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              services: category.services.filter((service, nestedIndex) => nestedIndex !== serviceIndex),
            }
          : category
      ),
    }));
  };

  const handleRemoveService = (categoryIndex, serviceIndex) => {
    removeService(categoryIndex, serviceIndex);
  };

  const validateConfig = () => {
    const serviceIds = new Set();

    for (const category of config.categories) {
      for (const service of category.services) {
        if (!String(service.title || "").trim()) {
          toast.error("Every service needs a name.");
          return false;
        }

        const serviceId = createServiceId(service.id || service.title);
        if (serviceIds.has(serviceId)) {
          toast.error("Service IDs must be unique.");
          return false;
        }
        serviceIds.add(serviceId);
      }
    }

    return true;
  };

  const savePricingRules = async () => {
    if (!validateConfig()) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const savedConfig = await adminApi.updatePricingRules(config);
      setConfig({
        ...EMPTY_CONFIG,
        ...savedConfig,
        categories: savedConfig?.categories || [],
      });
      toast.success("Pricing rules saved.");
    } catch (apiError) {
      const nextError = getApiErrorMessage(apiError);
      setError(nextError);
      toast.error(nextError);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f7f4] p-6 pt-24">
        <div className="mx-auto max-w-7xl rounded-xl border border-gray-200 bg-white p-8">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading pricing controls...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f4] p-6 pt-24">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-green-800">
                Job Management
              </p>
              <h1 className="text-3xl font-semibold text-gray-900">
                Admin pricing controls
              </h1>
              <p className="max-w-3xl text-sm text-gray-600">
                Add or remove future bookable services, edit base pricing, square-foot rates,
                service minimums, and manage global or group-specific bundle discounts.
                Existing jobs keep their stored records and are not removed by these changes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={loadPricingRules} disabled={isSaving}>
                <RefreshCw className="h-4 w-4" />
                Reload
              </Button>
              <Button onClick={savePricingRules} disabled={isSaving}>
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save changes
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="text-sm text-gray-500">Service Groups</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {config.categories.length}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="text-sm text-gray-500">Tracked Services</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{totalServices}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="text-sm text-gray-500">Bundle Ready</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {bundleEligibleServices}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                className={checkboxClassName}
                checked={config.bundlingEnabled}
                onChange={(event) => updateConfigField("bundlingEnabled", event.target.checked)}
              />
              Enable bundling
            </label>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className={inputClassName}
                value={config.defaultBundleDiscountPercent}
                onChange={(event) =>
                  updateConfigField("defaultBundleDiscountPercent", event.target.value)
                }
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">Global bundle discount</div>
          </div>
        </div>

        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">All bundles</h2>
            <p className="mt-1 text-sm text-gray-600">
              View every service group bundle in one place and set category-specific discounts when needed.
            </p>
          </div>

          <div className="grid gap-4 p-6 lg:grid-cols-2">
            {bundleSummaries.map((bundle, bundleIndex) => (
              <div
                key={bundle.id || bundleIndex}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-green-800" />
                      <h3 className="font-semibold text-gray-900">{bundle.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {bundle.bundleEligible ? "Bundle-ready group" : "Group bundling disabled"} -{" "}
                      {bundle.serviceCount} active eligible service{bundle.serviceCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="w-full sm:w-40">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className={inputClassName}
                      value={
                        config.categories[bundleIndex]?.bundleDiscountPercent ?? ""
                      }
                      onChange={(event) =>
                        updateCategoryField(
                          bundleIndex,
                          "bundleDiscountPercent",
                          event.target.value
                        )
                      }
                      placeholder={`${config.defaultBundleDiscountPercent || 0}% global`}
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {bundle.usesGlobalDiscount
                        ? `Using global ${bundle.discountPercent}%`
                        : `${bundle.discountPercent}% for this group`}
                    </div>
                  </div>
                </div>

                {bundle.services.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {bundle.services.map((service) => (
                      <span
                        key={service.id}
                        className="rounded-md border border-green-100 bg-white px-2 py-1 text-xs font-medium text-green-900"
                      >
                        {service.title}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500">
                    No active bundle-ready services in this group.
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          {config.categories.map((category, categoryIndex) => (
            <section key={category.id || categoryIndex} className="rounded-xl border border-gray-200 bg-white">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <input
                    className={`${inputClassName} max-w-md text-lg font-semibold`}
                    value={category.title || category.label}
                    onChange={(event) =>
                      updateCategoryField(categoryIndex, "title", event.target.value)
                    }
                  />
                  <input
                    className={`${inputClassName} max-w-2xl`}
                    value={category.subtitle || ""}
                    onChange={(event) =>
                      updateCategoryField(categoryIndex, "subtitle", event.target.value)
                    }
                    placeholder="Group note"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      className={checkboxClassName}
                      checked={Boolean(category.bundleEligible)}
                      onChange={(event) =>
                        updateCategoryField(categoryIndex, "bundleEligible", event.target.checked)
                      }
                    />
                    Group bundle-ready
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className={`${inputClassName} w-32`}
                      value={category.bundleDiscountPercent ?? ""}
                      onChange={(event) =>
                        updateCategoryField(
                          categoryIndex,
                          "bundleDiscountPercent",
                          event.target.value
                        )
                      }
                      placeholder={`${config.defaultBundleDiscountPercent || 0}%`}
                    />
                    <span className="text-sm text-gray-500">% bundle</span>
                  </div>
                  <Button variant="outline" onClick={() => addService(categoryIndex)}>
                    <Plus className="h-4 w-4" />
                    Add service
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[1120px] border-collapse text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-[0.16em] text-gray-500">
                    <tr>
                      <th className="border-b border-gray-200 px-4 py-3 font-medium">Service</th>
                      <th className="border-b border-gray-200 px-4 py-3 font-medium">Type</th>
                      <th className="border-b border-gray-200 px-4 py-3 font-medium">Base Price</th>
                      <th className="border-b border-gray-200 px-4 py-3 font-medium">Per Sq Ft</th>
                      <th className="border-b border-gray-200 px-4 py-3 font-medium">Minimum</th>
                      <th className="border-b border-gray-200 px-4 py-3 font-medium">Bundling</th>
                      <th className="border-b border-gray-200 px-4 py-3 font-medium">Status</th>
                      <th className="border-b border-gray-200 px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.services.map((service, serviceIndex) => (
                      <tr key={service.id || serviceIndex} className="align-top hover:bg-gray-50">
                        <td className="border-b border-gray-200 px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-800">
                              <Calculator className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <input
                                className={inputClassName}
                                value={service.title || ""}
                                onChange={(event) =>
                                  updateServiceField(
                                    categoryIndex,
                                    serviceIndex,
                                    "title",
                                    event.target.value
                                  )
                                }
                              />
                              <input
                                className={`${inputClassName} text-xs text-gray-500`}
                                value={service.id || ""}
                                onChange={(event) =>
                                  updateServiceField(
                                    categoryIndex,
                                    serviceIndex,
                                    "id",
                                    event.target.value
                                  )
                                }
                                placeholder="service-id"
                              />
                              <div className="text-xs text-gray-500">{formatPricingRule(service)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-gray-200 px-4 py-4">
                          <select
                            className={inputClassName}
                            value={service.pricingType || "fixed"}
                            onChange={(event) =>
                              updateServiceField(
                                categoryIndex,
                                serviceIndex,
                                "pricingType",
                                event.target.value
                              )
                            }
                          >
                            <option value="fixed">Fixed</option>
                            <option value="sqft">Per sq ft</option>
                            <option value="mulch">Mulch</option>
                          </select>
                        </td>
                        <td className="border-b border-gray-200 px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={inputClassName}
                            value={service.fixedPrice ?? ""}
                            disabled={service.pricingType !== "fixed"}
                            onChange={(event) =>
                              updateServiceField(
                                categoryIndex,
                                serviceIndex,
                                "fixedPrice",
                                event.target.value
                              )
                            }
                          />
                        </td>
                        <td className="border-b border-gray-200 px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            className={inputClassName}
                            value={service.unitRate ?? ""}
                            disabled={service.pricingType === "fixed"}
                            onChange={(event) =>
                              updateServiceField(
                                categoryIndex,
                                serviceIndex,
                                "unitRate",
                                event.target.value
                              )
                            }
                          />
                        </td>
                        <td className="border-b border-gray-200 px-4 py-4">
                          {service.pricingType === "mulch" ? (
                            <div className="grid gap-2">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                className={inputClassName}
                                value={service.minimumYards ?? ""}
                                onChange={(event) =>
                                  updateServiceField(
                                    categoryIndex,
                                    serviceIndex,
                                    "minimumYards",
                                    event.target.value
                                  )
                                }
                              />
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                className={inputClassName}
                                value={service.defaultDepthIn ?? ""}
                                onChange={(event) =>
                                  updateServiceField(
                                    categoryIndex,
                                    serviceIndex,
                                    "defaultDepthIn",
                                    event.target.value
                                  )
                                }
                                title="Default depth in inches"
                              />
                            </div>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className={inputClassName}
                              value={service.minimumPrice ?? ""}
                              disabled={service.pricingType === "fixed"}
                              onChange={(event) =>
                                updateServiceField(
                                  categoryIndex,
                                  serviceIndex,
                                  "minimumPrice",
                                  event.target.value
                                )
                              }
                            />
                          )}
                        </td>
                        <td className="border-b border-gray-200 px-4 py-4">
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className={checkboxClassName}
                              checked={Boolean(service.bundleEligible)}
                              onChange={(event) =>
                                updateServiceField(
                                  categoryIndex,
                                  serviceIndex,
                                  "bundleEligible",
                                  event.target.checked
                                )
                              }
                            />
                            <PackageCheck className="h-4 w-4 text-green-800" />
                          </label>
                        </td>
                        <td className="border-b border-gray-200 px-4 py-4">
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className={checkboxClassName}
                              checked={service.isActive !== false}
                              onChange={(event) =>
                                updateServiceField(
                                  categoryIndex,
                                  serviceIndex,
                                  "isActive",
                                  event.target.checked
                                )
                              }
                            />
                            <Check className="h-4 w-4 text-green-800" />
                          </label>
                        </td>
                        <td className="border-b border-gray-200 px-4 py-4">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveService(categoryIndex, serviceIndex)}
                            title="Remove service"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove service</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
