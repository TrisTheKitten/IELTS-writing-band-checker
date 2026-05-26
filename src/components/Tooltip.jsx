import { Children, cloneElement, useId } from "react";

export function Tooltip({ content, align = "center", placement = "top", children }) {
  const tooltipId = useId();

  if (!content) {
    return children;
  }

  const child = Children.only(children);
  const existingDescribedBy = child.props["aria-describedby"];
  const describedBy = existingDescribedBy ? `${existingDescribedBy} ${tooltipId}` : tooltipId;

  const alignClass =
    align === "end" ? "tooltip-host--align-end" : align === "start" ? "tooltip-host--align-start" : "";
  const placementClass = placement === "bottom" ? "ui-tooltip--bottom" : "";

  return (
    <span className={`tooltip-host ${alignClass}`.trim()}>
      {cloneElement(child, { "aria-describedby": describedBy })}
      <span id={tooltipId} role="tooltip" className={`ui-tooltip ${placementClass}`.trim()}>
        {content}
      </span>
    </span>
  );
}
