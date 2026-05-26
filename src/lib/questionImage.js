import {
  ACCEPTED_QUESTION_IMAGE_MIME_TYPES,
  MAX_QUESTION_IMAGE_BYTES,
  QUESTION_IMAGE_ACCEPT
} from "@shared/ielts-contract.js";

export { MAX_QUESTION_IMAGE_BYTES, QUESTION_IMAGE_ACCEPT };

export function isAcceptedQuestionImage(file) {
  return file && ACCEPTED_QUESTION_IMAGE_MIME_TYPES.has(file.type);
}

export function readQuestionImageFile(file) {
  if (!file) {
    return Promise.reject(new Error("No file selected."));
  }

  if (!isAcceptedQuestionImage(file)) {
    return Promise.reject(new Error("Use a JPG, PNG, WebP, or GIF image."));
  }

  if (file.size > MAX_QUESTION_IMAGE_BYTES) {
    return Promise.reject(new Error("Image must be 4 MB or smaller."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const separatorIndex = result.indexOf(",");
      const base64 = separatorIndex >= 0 ? result.slice(separatorIndex + 1) : "";

      if (!base64) {
        reject(new Error("Could not read that image. Try another file."));
        return;
      }

      resolve({
        base64,
        mimeType: file.type,
        name: file.name,
        previewUrl: result
      });
    };

    reader.onerror = () => {
      reject(new Error("Could not read that image. Try again."));
    };

    reader.readAsDataURL(file);
  });
}
