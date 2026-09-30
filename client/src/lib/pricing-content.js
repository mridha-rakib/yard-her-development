export const PRICING_CONTENT_KEY = "pricing-services";

const roundMoney = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const roundMeasurement = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const toPositiveNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
};

const createService = (service) => ({
  id: service.id,
  icon: service.icon || "sparkles",
  title: service.title || "",
  price: Number.isFinite(Number(service.price)) ? Number(service.price) : 0,
  duration: service.duration || "",
  description: service.description || "",
  buttonText: service.buttonText || "Book Service",
  buttonVariant: service.buttonVariant === "secondary" ? "secondary" : "primary",
  pricingType: service.pricingType || "fixed",
  minimumPrice: Number(service.minimumPrice || 0),
  unitRate: Number(service.unitRate || 0),
  fixedPrice: Number(service.fixedPrice || 0),
  minimumYards: Number(service.minimumYards || 0),
  defaultDepthIn: Number(service.defaultDepthIn || 0),
  pricingSummary: service.pricingSummary || "",
  pricingNote: service.pricingNote || "",
  requiresSqft: Boolean(service.requiresSqft),
  allowUnknownSqft: Boolean(service.allowUnknownSqft),
  isActive: service.isActive !== false,
  isDefaultService: Boolean(service.isDefaultService),
  bundleEligible: Boolean(service.bundleEligible),
  bundleGroupIds: Array.isArray(service.bundleGroupIds) ? service.bundleGroupIds : [],
});

const withPrice = (service) => {
  const startingPrice =
    service.pricingType === "fixed"
      ? Number(service.fixedPrice || 0)
      : Number(service.minimumPrice || 0);

  return createService({
    ...service,
    price: startingPrice,
  });
};

export const DEFAULT_PRICING_CATEGORIES = [
  {
    id: "yard",
    label: "Yard and Outdoor",
    title: "Yard and Outdoor Jobs",
    subtitle: "Fixed rules, clear pricing, and no negotiation at booking time.",
    services: [
      withPrice({
        id: "yard-lawn-mowing",
        icon: "leaf",
        title: "Lawn Mowing",
        duration: "30-60 min",
        description: "Automatic pricing based on square footage with a $47 minimum.",
        pricingType: "sqft",
        minimumPrice: 47,
        unitRate: 0.02,
        pricingSummary: "$47 minimum or $0.02 per sq ft",
        pricingNote: "Small lawns stay affordable while larger lawns are priced fairly.",
        requiresSqft: true,
      }),
      withPrice({
        id: "yard-weed-removal",
        icon: "wind",
        title: "Weed Removal",
        duration: "45-90 min",
        description: "Square-foot pricing with an $85 minimum for fair labor coverage.",
        pricingType: "sqft",
        minimumPrice: 85,
        unitRate: 0.1,
        pricingSummary: "$85 minimum or $0.10 per sq ft",
        pricingNote: "Use the size of the area you want cleared.",
        requiresSqft: true,
      }),
      withPrice({
        id: "yard-leaf-cleanup",
        icon: "wind",
        title: "Leaf Blowing and Cleanup",
        duration: "1-2 hours",
        description: "Square-foot pricing with a $55 minimum for clean, transparent quoting.",
        pricingType: "sqft",
        minimumPrice: 55,
        unitRate: 0.04,
        pricingSummary: "$55 minimum or $0.04 per sq ft",
        pricingNote: "Final price is whichever is higher.",
        requiresSqft: true,
      }),
      withPrice({
        id: "yard-general-cleanup",
        icon: "sparkles",
        title: "Yard Cleanup (General)",
        duration: "2-3 hours",
        description: "General cleanup priced from yard size with an $85 minimum.",
        pricingType: "sqft",
        minimumPrice: 85,
        unitRate: 0.08,
        pricingSummary: "$85 minimum or $0.08 per sq ft",
        pricingNote: "Best for full-property cleanup jobs.",
        requiresSqft: true,
      }),
      withPrice({
        id: "yard-hedge-trimming",
        icon: "scissors",
        title: "Hedge Trimming",
        duration: "1-2 hours",
        description: "Pricing is based on the job footprint with an $80 minimum.",
        pricingType: "sqft",
        minimumPrice: 80,
        unitRate: 0.04,
        pricingSummary: "$80 minimum or $0.04 per sq ft",
        pricingNote: "Use the total work area around the hedges.",
        requiresSqft: true,
      }),
      withPrice({
        id: "yard-bush-trimming",
        icon: "scissors",
        title: "Bush and Shrub Trimming",
        duration: "1-2 hours",
        description: "Flat-rate trimming for quick and predictable booking.",
        pricingType: "fixed",
        fixedPrice: 75,
        pricingSummary: "$75 fixed price",
        pricingNote: "No square footage needed for this service.",
      }),
      withPrice({
        id: "yard-garden-bed-cleanup",
        icon: "leaf",
        title: "Garden Bed Cleanup",
        duration: "1-2 hours",
        description: "Garden bed cleanup priced from the area being serviced.",
        pricingType: "sqft",
        minimumPrice: 87,
        unitRate: 0.09,
        pricingSummary: "$87 minimum or $0.09 per sq ft",
        pricingNote: "Use the combined square footage of the beds.",
        requiresSqft: true,
      }),
      withPrice({
        id: "yard-mulching",
        icon: "droplets",
        title: "Mulching",
        duration: "2-3 hours",
        description: "Calculated by cubic yards using square footage and depth with a 5.2-yard minimum.",
        pricingType: "mulch",
        minimumPrice: 624,
        unitRate: 120,
        minimumYards: 5.2,
        defaultDepthIn: 3,
        pricingSummary: "5.2-yard minimum at $120 per yard",
        pricingNote: "If you do not know the square footage, we default to the 5.2-yard minimum.",
        allowUnknownSqft: true,
      }),
      withPrice({
        id: "yard-snow-shoveling",
        icon: "wind",
        title: "Snow Shoveling",
        duration: "30-90 min",
        description: "Seasonal pricing by square footage with a $60 minimum.",
        pricingType: "sqft",
        minimumPrice: 60,
        unitRate: 0.05,
        pricingSummary: "$60 minimum or $0.05 per sq ft",
        pricingNote: "Use the driveway and walkway area to be cleared.",
        requiresSqft: true,
      }),
      withPrice({
        id: "yard-storm-cleanup",
        icon: "sparkles",
        title: "Storm Debris Cleanup",
        duration: "2-4 hours",
        description: "Post-storm cleanup priced from lot size with a $130 minimum.",
        pricingType: "sqft",
        minimumPrice: 130,
        unitRate: 0.09,
        pricingSummary: "$130 minimum or $0.09 per sq ft",
        pricingNote: "Best for branches, debris, and storm mess.",
        requiresSqft: true,
      }),
    ],
  },
  {
    id: "pet",
    label: "Pet and Property",
    title: "Pet and Property Cleanup",
    subtitle: "Safe, simple service pricing with transparent minimums.",
    services: [
      withPrice({
        id: "pet-waste-removal",
        icon: "home",
        title: "Dog Poop / Pet Waste Removal",
        duration: "20-45 min",
        description: "Priced from the service area with a $50 minimum.",
        pricingType: "sqft",
        minimumPrice: 50,
        unitRate: 0.06,
        pricingSummary: "$50 minimum or $0.06 per sq ft",
        pricingNote: "Use the yard area that needs to be cleared.",
        requiresSqft: true,
      }),
      withPrice({
        id: "pet-yard-sanitizing",
        icon: "droplets",
        title: "Yard Sanitizing",
        duration: "45-60 min",
        description: "Flat-rate sanitizing for pet-heavy outdoor areas.",
        pricingType: "fixed",
        fixedPrice: 40,
        pricingSummary: "$40 fixed price",
        pricingNote: "No square footage needed for this service.",
      }),
      withPrice({
        id: "pet-litter-cleanup",
        icon: "sparkles",
        title: "Litter Cleanup",
        duration: "30-60 min",
        description: "Flat-rate cleanup for visible trash and litter.",
        pricingType: "fixed",
        fixedPrice: 40,
        pricingSummary: "$40 fixed price",
        pricingNote: "No square footage needed for this service.",
      }),
    ],
  },
  {
    id: "vehicle",
    label: "Vehicle Services",
    title: "Vehicle Convenience Services",
    subtitle: "Fast flat-rate add-on services at your location.",
    services: [
      withPrice({
        id: "test-live-payment",
        icon: "sparkles",
        title: "Live Payment Test Job",
        duration: "5-10 min",
        description: "Internal fixed-price service for validating the live customer checkout and Hero payout flow.",
        pricingType: "fixed",
        fixedPrice: 2,
        pricingSummary: "$2 fixed price",
        pricingNote: "Use this only for payment verification.",
      }),
      withPrice({
        id: "vehicle-gas-filling",
        icon: "car",
        title: "Gas Filling",
        duration: "15-20 min",
        description: "Flat-rate on-site gas fill support. Fuel cost is separate.",
        pricingType: "fixed",
        fixedPrice: 25,
        pricingSummary: "$25 fixed price",
        pricingNote: "Fuel cost is not included.",
      }),
      withPrice({
        id: "vehicle-washer-fluid",
        icon: "droplets",
        title: "Windshield Washer Fluid Refill",
        duration: "10-15 min",
        description: "Quick refill service to improve visibility and convenience.",
        pricingType: "fixed",
        fixedPrice: 15,
        pricingSummary: "$15 fixed price",
        pricingNote: "No size measurement needed.",
      }),
      withPrice({
        id: "vehicle-tire-air",
        icon: "wrench",
        title: "Tire Air Fill",
        duration: "10-20 min",
        description: "Flat-rate tire pressure top-up.",
        pricingType: "fixed",
        fixedPrice: 10,
        pricingSummary: "$10 fixed price",
        pricingNote: "No size measurement needed.",
      }),
      withPrice({
        id: "vehicle-exterior-wash",
        icon: "car",
        title: "Car Exterior Wash",
        duration: "30-45 min",
        description: "Flat-rate exterior wash at your location.",
        pricingType: "fixed",
        fixedPrice: 50,
        pricingSummary: "$50 fixed price",
        pricingNote: "No size measurement needed.",
      }),
      withPrice({
        id: "vehicle-interior-vacuuming",
        icon: "sparkles",
        title: "Interior Vacuuming",
        duration: "20-40 min",
        description: "Flat-rate interior vacuum service for a standard vehicle.",
        pricingType: "fixed",
        fixedPrice: 40,
        pricingSummary: "$40 fixed price",
        pricingNote: "No size measurement needed.",
      }),
    ],
  },
  {
    id: "home",
    label: "Home Exterior",
    title: "Home Exterior Tasks",
    subtitle: "Home services with either fixed pricing or size-based rules.",
    services: [
      withPrice({
        id: "home-trash-bin-cleaning",
        icon: "sparkles",
        title: "Trash Bin Cleaning",
        duration: "20-30 min",
        description: "Flat-rate cleaning and disinfecting.",
        pricingType: "fixed",
        fixedPrice: 25,
        pricingSummary: "$25 fixed price",
        pricingNote: "No size measurement needed.",
      }),
      withPrice({
        id: "home-pressure-washing",
        icon: "droplets",
        title: "Pressure Washing",
        duration: "1-2 hours",
        description: "Flat-rate booking for standard residential surfaces.",
        pricingType: "fixed",
        fixedPrice: 120,
        pricingSummary: "$120 fixed price",
        pricingNote: "No square footage needed for this service.",
      }),
      withPrice({
        id: "home-gutter-removal",
        icon: "wind",
        title: "Gutter Debris Removal",
        duration: "1-2 hours",
        description: "Flat-rate gutter cleanup with predictable booking pricing.",
        pricingType: "fixed",
        fixedPrice: 120,
        pricingSummary: "$120 fixed price",
        pricingNote: "No square footage needed for this service.",
      }),
      withPrice({
        id: "home-window-washing",
        icon: "sparkles",
        title: "Window Washing",
        duration: "1-2 hours",
        description: "Flat-rate window washing for exterior panes.",
        pricingType: "fixed",
        fixedPrice: 65,
        pricingSummary: "$65 fixed price",
        pricingNote: "No square footage needed for this service.",
      }),
      withPrice({
        id: "home-patio-sweeping",
        icon: "home",
        title: "Patio and Deck Sweeping",
        duration: "30-60 min",
        description: "Area-based pricing with a $60 minimum.",
        pricingType: "sqft",
        minimumPrice: 60,
        unitRate: 0.05,
        pricingSummary: "$60 minimum or $0.05 per sq ft",
        pricingNote: "Use the total patio or deck area to be swept.",
        requiresSqft: true,
      }),
    ],
  },
];

const cloneCategory = (category) => ({
  ...category,
  title: category.title || category.label || "",
  services: (category.services || [])
    .filter((service) => service?.isActive !== false)
    .map((service) =>
      withPrice({
        ...service,
        icon: service.icon || "sparkles",
        duration: service.duration || "",
        description:
          service.description ||
          (service.pricingType === "fixed"
            ? `Flat-rate ${service.title || "service"}.`
            : `Automatic pricing for ${service.title || "service"}.`),
        pricingSummary:
          service.pricingSummary ||
          (service.pricingType === "sqft"
            ? `$${Number(service.minimumPrice || 0)} minimum or $${Number(
                service.unitRate || 0
              )} per sq ft`
            : service.pricingType === "mulch"
              ? `${Number(service.minimumYards || 0)}-yard minimum at $${Number(
                  service.unitRate || 0
                )}/yard`
              : `$${Number(service.fixedPrice || 0)} fixed price`),
        pricingNote: service.pricingNote || "",
        requiresSqft: service.requiresSqft || service.pricingType === "sqft",
      })
    ),
});

export const clonePricingCategories = () => DEFAULT_PRICING_CATEGORIES.map(cloneCategory);

export const normalizePricingCategories = (categories = DEFAULT_PRICING_CATEGORIES) =>
  (Array.isArray(categories) && categories.length ? categories : DEFAULT_PRICING_CATEGORIES).map(
    cloneCategory
  );

export const findServiceById = (serviceId = "") => {
  const normalizedId = String(serviceId || "").trim();

  if (!normalizedId) {
    return null;
  }

  for (const category of DEFAULT_PRICING_CATEGORIES) {
    const service = category.services.find((entry) => entry.id === normalizedId);

    if (service) {
      return {
        ...createService(service),
        categoryId: category.id,
        categoryLabel: category.label,
      };
    }
  }

  return null;
};

export const findServiceByTitle = (title = "") => {
  const normalizedTitle = String(title || "").trim().toLowerCase();

  if (!normalizedTitle) {
    return null;
  }

  for (const category of DEFAULT_PRICING_CATEGORIES) {
    const service = category.services.find(
      (entry) => entry.title.toLowerCase() === normalizedTitle
    );

    if (service) {
      return {
        ...createService(service),
        categoryId: category.id,
        categoryLabel: category.label,
      };
    }
  }

  return null;
};

export const getServiceDefinition = ({ id = "", title = "" } = {}) =>
  findServiceById(id) || findServiceByTitle(title) || null;

export const isFixedPriceService = (service) => service?.pricingType === "fixed";
export const isMulchingService = (service) => service?.pricingType === "mulch";
export const isSqftBasedService = (service) => service?.pricingType === "sqft";
export const requiresSquareFootage = (service) =>
  Boolean(service?.requiresSqft || service?.pricingType === "sqft");

export const calculateServiceQuote = (service, input = {}) => {
  if (!service) {
    return null;
  }

  if (isFixedPriceService(service)) {
    const fixedPrice = roundMoney(service.fixedPrice);

    return {
      pricingType: "fixed",
      input: {},
      fixedPrice,
      minimumPrice: fixedPrice,
      calculatedPrice: fixedPrice,
      finalPrice: fixedPrice,
      summary: service.pricingSummary,
    };
  }

  if (isMulchingService(service)) {
    const sqft = toPositiveNumber(input.sqft);
    const depthIn = toPositiveNumber(input.depthIn) || service.defaultDepthIn || 3;
    const depthFt = roundMeasurement(depthIn / 12);
    const cubicFt = roundMeasurement(sqft * depthFt);
    const rawYards = roundMeasurement(cubicFt / 27);
    const chargeableYards = roundMeasurement(
      Math.max(rawYards || 0, Number(service.minimumYards || 5))
    );
    const finalPrice = roundMoney(chargeableYards * Number(service.unitRate || 120));

    return {
      pricingType: "mulch",
      input: {
        sqft,
        depthIn,
      },
      measurement: {
        depthFt,
        cubicFt,
        rawYards,
        chargeableYards,
      },
      minimumPrice: roundMoney(
        Number(service.minimumYards || 5) * Number(service.unitRate || 120)
      ),
      minimumYards: Number(service.minimumYards || 5),
      unitRate: Number(service.unitRate || 120),
      calculatedPrice: finalPrice,
      finalPrice,
      summary:
        sqft > 0
          ? `${sqft} sq ft at ${depthIn}" depth = ${chargeableYards} yards charged`
          : `Defaulted to the ${Number(service.minimumYards || 5)} yard minimum`,
    };
  }

  const sqft = toPositiveNumber(input.sqft);
  const calculatedPrice = roundMoney(sqft * Number(service.unitRate || 0));
  const minimumPrice = roundMoney(service.minimumPrice);
  const finalPrice = roundMoney(Math.max(minimumPrice, calculatedPrice));

  return {
    pricingType: "sqft",
    input: {
      sqft,
    },
    minimumPrice,
    unitRate: Number(service.unitRate || 0),
    calculatedPrice,
    finalPrice,
    summary:
      sqft > 0
        ? `${sqft} sq ft x $${Number(service.unitRate || 0)}/sq ft`
        : service.pricingSummary,
  };
};

export const formatPrice = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
};
