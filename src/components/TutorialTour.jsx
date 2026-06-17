import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

const SPOTLIGHT_PADDING = 12;
const SPOTLIGHT_RADIUS = 10;
const VIEWPORT_PADDING = 20;

function getSpotlightRect(targetEl) {
  const rect = targetEl.getBoundingClientRect();
  return {
    x: rect.left - SPOTLIGHT_PADDING,
    y: rect.top - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2
  };
}

function computeCardPosition(spotlightRect, cardEl, placement, viewportW, viewportH) {
  const cardRect = cardEl.getBoundingClientRect();
  const cardW = cardRect.width;
  const cardH = cardRect.height;
  const gap = 16;

  let top;
  let left;
  let finalPlacement = placement;

  if (placement === "center") {
    top = (viewportH - cardH) / 2;
    left = (viewportW - cardW) / 2;
    return { top, left, placement: finalPlacement };
  }

  const positions = {
    below: () => ({
      top: spotlightRect.y + spotlightRect.height + gap,
      left: spotlightRect.x + spotlightRect.width / 2 - cardW / 2
    }),
    above: () => ({
      top: spotlightRect.y - cardH - gap,
      left: spotlightRect.x + spotlightRect.width / 2 - cardW / 2
    }),
    right: () => ({
      top: spotlightRect.y + spotlightRect.height / 2 - cardH / 2,
      left: spotlightRect.x + spotlightRect.width + gap
    }),
    left: () => ({
      top: spotlightRect.y + spotlightRect.height / 2 - cardH / 2,
      left: spotlightRect.x - cardW - gap
    })
  };

  const preferred = positions[placement]();
  top = preferred.top;
  left = preferred.left;

  const fitsVertically = top >= VIEWPORT_PADDING && top + cardH <= viewportH - VIEWPORT_PADDING;
  const fitsHorizontally = left >= VIEWPORT_PADDING && left + cardW <= viewportW - VIEWPORT_PADDING;

  if (!fitsVertically || !fitsHorizontally) {
    const fallbackOrder = ["below", "above", "right", "left"].filter((p) => p !== placement);

    for (const alt of fallbackOrder) {
      const altPos = positions[alt]();
      const altFitsV = altPos.top >= VIEWPORT_PADDING && altPos.top + cardH <= viewportH - VIEWPORT_PADDING;
      const altFitsH = altPos.left >= VIEWPORT_PADDING && altPos.left + cardW <= viewportW - VIEWPORT_PADDING;

      if (altFitsV && altFitsH) {
        top = altPos.top;
        left = altPos.left;
        finalPlacement = alt;
        break;
      }
    }
  }

  top = Math.max(VIEWPORT_PADDING, Math.min(top, viewportH - cardH - VIEWPORT_PADDING));
  left = Math.max(VIEWPORT_PADDING, Math.min(left, viewportW - cardW - VIEWPORT_PADDING));

  return { top, left, placement: finalPlacement };
}

function getArrowStyle(placement, spotlightRect, cardTop, cardLeft, cardW, cardH) {
  if (placement === "center") {
    return null;
  }

  const arrowSize = 8;
  const style = {};

  if (placement === "below") {
    style.top = -arrowSize;
    style.left = Math.max(16, Math.min(spotlightRect.x + spotlightRect.width / 2 - cardLeft - arrowSize, cardW - 16 - arrowSize * 2));
    style.transform = "rotate(45deg)";
  } else if (placement === "above") {
    style.bottom = -arrowSize;
    style.left = Math.max(16, Math.min(spotlightRect.x + spotlightRect.width / 2 - cardLeft - arrowSize, cardW - 16 - arrowSize * 2));
    style.transform = "rotate(225deg)";
  } else if (placement === "right") {
    style.left = -arrowSize;
    style.top = Math.max(16, Math.min(spotlightRect.y + spotlightRect.height / 2 - cardTop - arrowSize, cardH - 16 - arrowSize * 2));
    style.transform = "rotate(-45deg)";
  } else if (placement === "left") {
    style.right = -arrowSize;
    style.top = Math.max(16, Math.min(spotlightRect.y + spotlightRect.height / 2 - cardTop - arrowSize, cardH - 16 - arrowSize * 2));
    style.transform = "rotate(135deg)";
  }

  return style;
}

export function TutorialTour({ isOpen, step, stepIndex, totalSteps, onNext, onPrev, onSkip, onClose }) {
  const titleId = useId();
  const cardRef = useRef(null);
  const primaryRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [cardPosition, setCardPosition] = useState(null);
  const [arrowStyle, setArrowStyle] = useState(null);
  const [cardReady, setCardReady] = useState(false);

  const targetEl = useMemo(() => {
    if (!step.target || typeof document === "undefined") {
      return null;
    }
    return document.querySelector(step.target);
  }, [step.target]);

  const updateLayout = useCallback(() => {
    if (!isOpen) {
      return;
    }

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
      const rect = getSpotlightRect(targetEl);
      setSpotlightRect(rect);

      if (cardRef.current) {
        const pos = computeCardPosition(rect, cardRef.current, step.placement, viewportW, viewportH);
        setCardPosition({ top: pos.top, left: pos.left });
        const arrow = getArrowStyle(pos.placement, rect, pos.top, pos.left, cardRef.current.offsetWidth, cardRef.current.offsetHeight);
        setArrowStyle(arrow);
        setCardReady(true);
      }
    } else {
      setSpotlightRect(null);
      if (cardRef.current) {
        const cardW = cardRef.current.offsetWidth;
        const cardH = cardRef.current.offsetHeight;
        setCardPosition({
          top: (viewportH - cardH) / 2,
          left: (viewportW - cardW) / 2
        });
        setArrowStyle(null);
        setCardReady(true);
      }
    }
  }, [isOpen, targetEl, step.placement]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current = document.activeElement;

    const frame = requestAnimationFrame(() => {
      setCardReady(false);
      setSpotlightRect(null);
      setCardPosition(null);
      setArrowStyle(null);
      updateLayout();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isOpen, stepIndex, updateLayout]);

  useEffect(() => {
    if (!isOpen || !cardReady) {
      return;
    }

    const raf = requestAnimationFrame(() => {
      primaryRef.current?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(raf);
  }, [isOpen, stepIndex, cardReady]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleResize() {
      updateLayout();
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrev();
      } else if (event.key === "Tab") {
        const card = cardRef.current;
        if (!card) {
          return;
        }

        const focusable = card.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrev, updateLayout]);

  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      const target = previousFocusRef.current;
      requestAnimationFrame(() => {
        if (target && typeof target.focus === "function") {
          target.focus();
        }
      });
    }
  }, [isOpen]);

  function handleBackdropClick() {
    onSkip();
  }

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const progressPercent = ((stepIndex + 1) / totalSteps) * 100;

  return createPortal(
    <div className="tutorial" aria-hidden="true">
      <svg className="tutorial__spotlight-svg" width="100%" height="100%">
        <defs>
          <mask id="tutorial-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect ? (
              <rect
                x={spotlightRect.x}
                y={spotlightRect.y}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx={SPOTLIGHT_RADIUS}
                ry={SPOTLIGHT_RADIUS}
                fill="black"
              />
            ) : null}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="var(--tutorial-backdrop)"
          mask="url(#tutorial-spotlight-mask)"
          onClick={handleBackdropClick}
        />
      </svg>

      {spotlightRect ? (
        <div
          className="tutorial__spotlight-ring"
          style={{
            top: spotlightRect.y,
            left: spotlightRect.x,
            width: spotlightRect.width,
            height: spotlightRect.height,
            borderRadius: SPOTLIGHT_RADIUS
          }}
        />
      ) : null}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`tutorial__card${cardReady ? " tutorial__card--ready" : ""}${isFirst ? " tutorial__card--welcome" : ""}`}
        style={cardPosition ? { top: cardPosition.top, left: cardPosition.left } : undefined}
      >
        {arrowStyle ? (
          <span className="tutorial__arrow" style={arrowStyle} />
        ) : null}

        <header className="tutorial__card-head">
          <div className="tutorial__progress">
            <span className="tutorial__step-counter">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <div className="tutorial__progress-bar">
              <div className="tutorial__progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <button
            type="button"
            className="tutorial__close"
            onClick={onClose}
            aria-label="Close tutorial"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </header>

        <div className="tutorial__card-body">
          <h2 id={titleId} className="tutorial__title">{step.title}</h2>
          <p className="tutorial__text">{step.body}</p>
        </div>

        <footer className="tutorial__card-foot">
          <div className="tutorial__nav">
            {!isFirst ? (
              <button
                type="button"
                className="tutorial__btn tutorial__btn--secondary"
                onClick={onPrev}
              >
                <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                Back
              </button>
            ) : (
              <span />
            )}
            <div className="tutorial__nav-right">
              <button
                type="button"
                className="tutorial__skip"
                onClick={onSkip}
              >
                Skip tour
              </button>
              <button
                ref={primaryRef}
                type="button"
                className="tutorial__btn tutorial__btn--primary"
                onClick={onNext}
              >
                {step.primaryLabel || (isLast ? "Done" : "Next")}
                {!isLast ? <ArrowRight size={14} strokeWidth={2} aria-hidden="true" /> : null}
              </button>
            </div>
          </div>
        </footer>

        <div className="tutorial__dots" aria-hidden="true">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={`tutorial__dot${i === stepIndex ? " tutorial__dot--active" : ""}${i < stepIndex ? " tutorial__dot--done" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
