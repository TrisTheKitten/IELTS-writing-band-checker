import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import {
  getPastedQuestionImageFile,
  readQuestionImageFile,
  QUESTION_IMAGE_ACCEPT,
  shouldDeferPastedImageToTextField
} from "../lib/questionImage";

export function PromptImageUpload({ image, onImageChange, onClear }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleFile(file) {
    if (!file) {
      return;
    }

    setLocalError("");

    try {
      const nextImage = await readQuestionImageFile(file);
      onImageChange(nextImage);
    } catch (readError) {
      setLocalError(readError.message);
    }
  }

  async function handleFiles(fileList) {
    await handleFile(fileList?.[0]);
  }

  const handlePaste = useCallback(
    async (event) => {
      const file = getPastedQuestionImageFile(event.clipboardData);

      if (!file) {
        return;
      }

      if (shouldDeferPastedImageToTextField(event.clipboardData, document.activeElement)) {
        return;
      }

      event.preventDefault();
      setLocalError("");

      try {
        const nextImage = await readQuestionImageFile(file);
        onImageChange(nextImage);
      } catch (readError) {
        setLocalError(readError.message);
      }
    },
    [onImageChange]
  );

  useEffect(() => {
    if (image) {
      return undefined;
    }

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [image, handlePaste]);

  function handleInputChange(event) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  if (image) {
    return (
      <div className="input-box input-box--prompt-image">
        <div className="input-box__head">
          <span className="input-box__label">Question image</span>
          <button className="text-btn" type="button" onClick={onClear}>
            Remove
          </button>
        </div>
        <div className="prompt-image__preview">
          <img src={image.previewUrl} alt="IELTS Task 1 question" className="prompt-image__img" />
        </div>
        {image.name ? <p className="prompt-image__name">{image.name}</p> : null}
      </div>
    );
  }

  return (
    <div className="input-box input-box--prompt-image">
      <span className="input-box__label" id="prompt-image-label">
        Question image
      </span>
      <div
        className={`prompt-image__drop${isDragging ? " is-dragging" : ""}`}
        role="button"
        tabIndex={0}
        aria-labelledby="prompt-image-label"
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ImageUp size={22} strokeWidth={1.75} aria-hidden="true" />
        <p className="prompt-image__title">Drop image here</p>
        <p className="prompt-image__hint">
          or paste, click to upload · JPG, PNG, WebP, GIF · max 4 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="prompt-image__input"
          accept={QUESTION_IMAGE_ACCEPT}
          onChange={handleInputChange}
          tabIndex={-1}
        />
      </div>
      {localError ? (
        <p className="prompt-image__error" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
