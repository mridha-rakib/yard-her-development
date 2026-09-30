import { publicApi } from "./http";

const unwrap = (response) => response.data.data;

export const contentApi = {
  getContentByKey: (key) => publicApi.get(`/content/${key}`).then(unwrap),
  getLegalDocuments: () => publicApi.get("/content/legal-documents").then(unwrap),
  getLegalDocument: (documentId) =>
    publicApi.get(`/content/legal-documents/${documentId}`).then(unwrap),
};
