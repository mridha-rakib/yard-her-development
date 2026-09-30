export const buildBookServiceQuery = (service, category) => ({
  serviceId: service?.id || "",
  serviceTitle: service?.title || "",
  servicePrice: String(service?.price ?? ""),
  serviceDuration: service?.duration || "",
  serviceDescription: service?.description || "",
  categoryId: category?.id || "",
  categoryLabel: category?.label || "",
});

export const buildBookServicePath = (service, category) => {
  const query = new URLSearchParams(buildBookServiceQuery(service, category));
  return `/book?${query.toString()}`;
};

export const buildBookServiceHref = (service, category) => ({
  pathname: "/book",
  query: buildBookServiceQuery(service, category),
});

export const getSelectedServiceFromSearchParams = (searchParams) => {
  const price = Number(searchParams.get("servicePrice"));

  return {
    id: searchParams.get("serviceId") || "",
    title: searchParams.get("serviceTitle") || "",
    duration: searchParams.get("serviceDuration") || "",
    description: searchParams.get("serviceDescription") || "",
    categoryId: searchParams.get("categoryId") || "",
    categoryLabel: searchParams.get("categoryLabel") || "",
    price: Number.isFinite(price) ? price : 0,
  };
};
