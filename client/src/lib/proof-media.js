import { optimizeProfilePhotoFile } from "./profile-photo";
import { resolveApiMediaUrl } from "./media-url";

export const PROOF_VIDEO_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const PROOF_VIDEO_REQUIREMENTS = "MP4, MOV, or WebM up to 25MB.";
export const PROOF_PHOTO_REQUIREMENTS = "JPG, PNG, or WEBP up to 5MB.";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(new Error("We could not process that file. Please choose a smaller video."));
    reader.readAsDataURL(file);
  });

export const optimizeProofPhotoFile = optimizeProfilePhotoFile;

export const readProofVideoFile = async (file) => {
  if (!file) {
    throw new Error("Please choose a video to upload.");
  }

  if (!String(file.type || "").startsWith("video/")) {
    throw new Error("Please choose a valid video file.");
  }

  if (file.size > PROOF_VIDEO_MAX_FILE_SIZE_BYTES) {
    throw new Error("Please choose a verification video under 25MB.");
  }

  return readFileAsDataUrl(file);
};

export const getProofUploadErrorMessage = (error) => {
  const message = String(error?.response?.data?.message || error?.message || "").trim();
  const normalizedMessage = message.toLowerCase();

  if (!message) {
    return "We could not upload that proof file. Please try again.";
  }

  if (
    (normalizedMessage.includes("offset") && normalizedMessage.includes("out of range")) ||
    normalizedMessage.includes("bson")
  ) {
    return "The proof upload is too large to save. Please keep the verification video under 25MB.";
  }

  return message;
};

export const resolveProofMediaUrl = resolveApiMediaUrl;
