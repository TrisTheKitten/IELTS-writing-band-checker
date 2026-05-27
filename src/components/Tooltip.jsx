import {
  Children,
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";

const VIEWPORT_PADDING = 12;
const TOOLTIP_GAP = 8;
const FLIP_THRESHOLD = 96;

function getAlignClass(align) {
  if (align === "end") {
    return "tooltip-host--align-end";
  }

  if (align === "start") {
    return "tooltip-host--align-start";
  }

  return "";
}

function getDescribedBy(child, tooltipId) {
  const existingDescribedBy = child.props["aria-describedby"];
  return existingDescribedBy ? `${existingDescribedBy} ${tooltipId}` : tooltipId;
}

function resolveTooltipCoords(trigger, placement) {
  const rect = trigger.getBoundingClientRect();
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  let resolvedPlacement = placement;

  if (placement === "top" && spaceAbove < FLIP_THRESHOLD && spaceBelow > spaceAbove) {
    resolvedPlacement = "bottom";
  } else if (placement === "bottom" && spaceBelow < FLIP_THRESHOLD && spaceAbove > spaceBelow) {
    resolvedPlacement = "top";
  }

  const left = Math.min(
    window.innerWidth - VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, rect.left + rect.width / 2)
  );
  const top =
    resolvedPlacement === "bottom" ? rect.bottom + TOOLTIP_GAP : rect.top - TOOLTIP_GAP;

  return { top, left, placement: resolvedPlacement };
}

function TooltipTrigger({ triggerRef, onShow, onHide, children, className }) {
  return (
    <span
      ref={triggerRef}
      className={className}
      onMouseEnter={onShow}
      onMouseLeave={onHide}
      onFocus={onShow}
      onBlur={onHide}
    >
      {children}
    </span>
  );
}

function PortaledTooltip({ content, align, placement, children, tooltipId }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement });
  const triggerRef = useRef(null);
  const alignClass = getAlignClass(align);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    setCoords(resolveTooltipCoords(trigger, placement));
  }, [placement]);

  const show = useCallback(() => {
    updatePosition();
    setVisible(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const scrollParent = triggerRef.current?.closest(".marked-up-essay");
    const handleReposition = () => updatePosition();

    scrollParent?.addEventListener("scroll", handleReposition, { passive: true });
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, { passive: true });

    return () => {
      scrollParent?.removeEventListener("scroll", handleReposition);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition);
    };
  }, [visible, updatePosition]);

  return (
    <>
      <TooltipTrigger
        triggerRef={triggerRef}
        onShow={show}
        onHide={hide}
        className="tooltip-trigger-wrap"
      >
        {children}
      </TooltipTrigger>
      {visible
        ? createPortal(
            <span
              id={tooltipId}
              role="tooltip"
              className={`ui-tooltip ui-tooltip--portaled ui-tooltip--portaled-${coords.placement} ${alignClass}`.trim()}
              style={{ top: coords.top, left: coords.left }}
            >
              {content}
            </span>,
            document.body
          )
        : null}
    </>
  );
}

export function Tooltip({
  content,
  align = "center",
  placement = "top",
  portaled = false,
  children
}) {
  const tooltipId = useId();

  if (!content) {
    return children;
  }

  const child = Children.only(children);
  const describedBy = getDescribedBy(child, tooltipId);
  const describedChild = cloneElement(child, { "aria-describedby": describedBy });

  if (portaled) {
    return (
      <PortaledTooltip
        content={content}
        align={align}
        placement={placement}
        tooltipId={tooltipId}
      >
        {describedChild}
      </PortaledTooltip>
    );
  }

  const alignClass = getAlignClass(align);
  const placementClass = placement === "bottom" ? "ui-tooltip--bottom" : "";

  return (
    <span className={`tooltip-host ${alignClass}`.trim()}>
      {describedChild}
      <span id={tooltipId} role="tooltip" className={`ui-tooltip ${placementClass}`.trim()}>
        {content}
      </span>
    </span>
  );
}
