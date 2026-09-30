import { apiClient, publicApi } from "./http";

const unwrap = (response) => response.data.data;

export const testimonialApi = {
  listTestimonials: (params = {}) =>
    publicApi.get("/testimonials", { params }).then(unwrap),
  getMyTestimonial: () => apiClient.get("/testimonials/me").then(unwrap),
  upsertMyTestimonial: (payload) =>
    apiClient.post("/testimonials", payload).then(unwrap),
};
