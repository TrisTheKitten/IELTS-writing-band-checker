import {
  Children,
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";

const VIEWPORT_PADDING = 12;
const TOOLTIP_GAP = 8;
const FLIP_THRESHOLD = 96;
const TOUCH_UI_QUERY = "(hover: none), (pointer: coarse)";

function getAlignClass(align) {
  if (align === "end") {
    return "tooltip-host--align-end";
  }

  if (align === "start") {
    return "tooltip-host--align-start";
  }

  return "";
}

function useTouchUi() {
  const [touchUi, setTouchUi] = useState(
    () => typeof window !== "undefined" && window.matchMedia(TOUCH_UI_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(TOUCH_UI_QUERY);
    const onChange = () => setTouchUi(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return touchUi;
}

function getViewportSize() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
}

export function resolveTooltipCoords(triggerRect, tooltipRect, placement, align, viewport = getViewportSize()) {
  const tooltipWidth = tooltipRect.width;
  const tooltipHeight = tooltipRect.height;
  const viewportWidth = viewport.width;
  const viewportHeight = viewport.height;

  if (placement === "left" || placement === "right") {
    const spaceLeft = triggerRect.left;
    const spaceRight = viewportWidth - triggerRect.right;
    let resolvedPlacement = placement;

    if (placement === "left" && spaceLeft < tooltipWidth + FLIP_THRESHOLD && spaceRight > spaceLeft) {
      resolvedPlacement = "right";
    } else if (
      placement === "right" &&
      spaceRight < tooltipWidth + FLIP_THRESHOLD &&
      spaceLeft > spaceRight
    ) {
      resolvedPlacement = "left";
    }

    let left =
      resolvedPlacement === "right"
        ? triggerRect.right + TOOLTIP_GAP
        : triggerRect.left - TOOLTIP_GAP - tooltipWidth;
    let top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;

    left = Math.min(
      viewportWidth - VIEWPORT_PADDING - tooltipWidth,
      Math.max(VIEWPORT_PADDING, left)
    );
    top = Math.min(
      viewportHeight - VIEWPORT_PADDING - tooltipHeight,
      Math.max(VIEWPORT_PADDING, top)
    );

    return { top, left, placement: resolvedPlacement };
  }

  const spaceAbove = triggerRect.top;
  const spaceBelow = viewportHeight - triggerRect.bottom;
  let resolvedPlacement = placement;

  if (placement === "top" && spaceAbove < tooltipHeight + FLIP_THRESHOLD && spaceBelow > spaceAbove) {
    resolvedPlacement = "bottom";
  } else if (
    placement === "bottom" &&
    spaceBelow < tooltipHeight + FLIP_THRESHOLD &&
    spaceAbove > spaceBelow
  ) {
    resolvedPlacement = "top";
  }

  let left;
  if (align === "end") {
    left = triggerRect.right - tooltipWidth;
  } else if (align === "start") {
    left = triggerRect.left;
  } else {
    left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
  }

  left = Math.min(
    viewportWidth - VIEWPORT_PADDING - tooltipWidth,
    Math.max(VIEWPORT_PADDING, left)
  );

  const openBelow = resolvedPlacement === "bottom";

  let top = openBelow
    ? triggerRect.bottom + TOOLTIP_GAP
    : triggerRect.top - TOOLTIP_GAP - tooltipHeight;

  top = Math.min(
    viewportHeight - VIEWPORT_PADDING - tooltipHeight,
    Math.max(VIEWPORT_PADDING, top)
  );

  const maxHeight = openBelow
    ? viewportHeight - top - VIEWPORT_PADDING
    : top - VIEWPORT_PADDING;

  return {
    top,
    left,
    placement: openBelow ? "bottom" : "top",
    maxHeight: Math.max(80, maxHeight)
  };
}

function TooltipSurface({
  content,
  align,
  placement,
  tooltipId,
  visible,
  positionTriggerRef,
  onRequestClose
}) {
  const tooltipRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const alignClass = getAlignClass(align);

  const updatePosition = useCallback(() => {
    const trigger = positionTriggerRef.current;
    const tooltip = tooltipRef.current;

    if (!trigger || !tooltip) {
      return;
    }

    setCoords(
      resolveTooltipCoords(
        trigger.getBoundingClientRect(),
        tooltip.getBoundingClientRect(),
        placement,
        align
      )
    );
  }, [align, placement, positionTriggerRef]);

  useLayoutEffect(() => {
    if (!visible) {
      return undefined;
    }

    updatePosition();

    const scrollParent = positionTriggerRef.current?.closest(".marked-up-essay");
    const handleReposition = () => updatePosition();

    scrollParent?.addEventListener("scroll", handleReposition, { passive: true });
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, { passive: true });

    return () => {
      scrollParent?.removeEventListener("scroll", handleReposition);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition);
    };
  }, [visible, updatePosition, positionTriggerRef, content]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        positionTriggerRef.current?.contains(event.target) ||
        tooltipRef.current?.contains(event.target)
      ) {
        return;
      }

      onRequestClose();
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onRequestClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onRequestClose, positionTriggerRef]);

  if (!visible || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <span
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      className={`ui-tooltip ui-tooltip--portaled ${alignClass}`.trim()}
      style={
        coords
          ? {
              top: coords.top,
              left: coords.left,
              maxHeight: coords.maxHeight,
              visibility: "visible"
            }
          : { visibility: "hidden" }
      }
    >
      {content}
    </span>,
    document.body
  );
}

function TooltipTrigger({ triggerRef, hoverEnabled, tapEnabled, onHoverChange, onTap, children, className }) {
  return (
    <span
      ref={triggerRef}
      className={className}
      onMouseEnter={hoverEnabled ? () => onHoverChange(true) : undefined}
      onMouseLeave={hoverEnabled ? () => onHoverChange(false) : undefined}
      onFocus={hoverEnabled ? () => onHoverChange(true) : undefined}
      onBlur={hoverEnabled ? () => onHoverChange(false) : undefined}
      onClick={
        tapEnabled
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              onTap();
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}

export function Tooltip({
  content,
  align = "center",
  placement = "top",
  portaled = true,
  hintTrigger = "auto",
  children
}) {
  const tooltipId = useId();
  const touchUi = useTouchUi();
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const triggerRef = useRef(null);
  const infoRef = useRef(null);

  const showInfoIcon = touchUi && (hintTrigger === "icon" || hintTrigger === "auto");
  const useTargetToggle = hintTrigger === "target" && touchUi;
  const hoverOnTarget =
    hintTrigger === "hover" ||
    (!touchUi && (hintTrigger === "auto" || hintTrigger === "target" || hintTrigger === "icon"));

  const positionTriggerRef = showInfoIcon ? infoRef : triggerRef;
  const visible = pinned || (hovering && hoverOnTarget);

  const close = useCallback(() => {
    setPinned(false);
    setHovering(false);
  }, []);

  const togglePinned = useCallback(() => {
    setPinned((current) => !current);
  }, []);

  if (!content) {
    return children ?? null;
  }

  if (!portaled) {
    return children ?? null;
  }

  const hostClassName = [
    "tooltip-host",
    getAlignClass(align),
    showInfoIcon ? "tooltip-host--with-info" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const infoButton = showInfoIcon ? (
    <button
      ref={infoRef}
      type="button"
      className="tooltip-info-trigger"
      aria-label="Help"
      aria-expanded={visible}
      aria-controls={tooltipId}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        togglePinned();
      }}
    >
      <CircleHelp size={15} strokeWidth={1.75} aria-hidden="true" />
    </button>
  ) : null;

  const child = children ? Children.only(children) : null;
  const describedChild = child
    ? showInfoIcon
      ? child
      : cloneElement(child, {
          "aria-describedby": child.props["aria-describedby"]
            ? `${child.props["aria-describedby"]} ${tooltipId}`
            : tooltipId
        })
    : null;

  return (
    <>
      <span className={hostClassName}>
        {describedChild ? (
          <TooltipTrigger
            triggerRef={triggerRef}
            className="tooltip-trigger-wrap"
            hoverEnabled={hoverOnTarget}
            tapEnabled={useTargetToggle}
            onHoverChange={setHovering}
            onTap={togglePinned}
          >
            {describedChild}
          </TooltipTrigger>
        ) : null}
        {infoButton}
      </span>
      <TooltipSurface
        content={content}
        align={align}
        placement={placement}
        tooltipId={tooltipId}
        visible={visible}
        positionTriggerRef={positionTriggerRef}
        onRequestClose={close}
      />
    </>
  );
}
