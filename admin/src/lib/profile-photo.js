export const PROFILE_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
export const PROFILE_PHOTO_REQUIREMENTS = "JPG, PNG, or WEBP up to 5MB.";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 640;
const TARGET_DATA_URL_LENGTH = 450000;
const OUTPUT_TYPE = "image/jpeg";
const INITIAL_QUALITY = 0.86;
const MIN_QUALITY = 0.58;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("We could not read that file. Please try again."));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("That image could not be processed. Please choose a different one."));
    image.src = src;
  });

const renderCompressedImage = (image, width, height, quality) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser could not prepare that image. Please try again.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL(OUTPUT_TYPE, quality);
};

export const optimizeProfilePhotoFile = async (file) => {
  if (!file) {
    throw new Error("Please choose an image to upload.");
  }

  if (!String(file.type || "").startsWith("image/")) {
    throw new Error("Please choose a JPG, PNG, or WEBP image.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Please choose an image smaller than 5MB.");
  }

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));

  let width = Math.max(1, Math.round(image.width * scale));
  let height = Math.max(1, Math.round(image.height * scale));
  let quality = INITIAL_QUALITY;
  let result = renderCompressedImage(image, width, height, quality);

  while (result.length > TARGET_DATA_URL_LENGTH && (quality > MIN_QUALITY || width > 280)) {
    if (quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.08);
    } else {
      width = Math.max(280, Math.round(width * 0.88));
      height = Math.max(280, Math.round(height * 0.88));
    }

    result = renderCompressedImage(image, width, height, quality);
  }

  if (result.length > TARGET_DATA_URL_LENGTH) {
    throw new Error("That image is still too large. Please choose a smaller one.");
  }

  return result;
};
