import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import { Tooltip } from "../Tooltip.jsx";

const VIEWPORT_PADDING = 12;
const PANEL_GAP = 8;

function resolveDropdownCoords(triggerRect, panelRect, align) {
  const panelWidth = panelRect.width;
  const panelHeight = panelRect.height;
  const maxLeft = window.innerWidth - VIEWPORT_PADDING - panelWidth;
  const minLeft = VIEWPORT_PADDING;

  let left = align === "start" ? triggerRect.left : triggerRect.right - panelWidth;
  left = Math.min(maxLeft, Math.max(minLeft, left));

  const spaceBelow = window.innerHeight - triggerRect.bottom - PANEL_GAP;
  const spaceAbove = triggerRect.top - PANEL_GAP;
  const openBelow = spaceBelow >= panelHeight || spaceBelow >= spaceAbove;

  let top = openBelow ? triggerRect.bottom + PANEL_GAP : triggerRect.top - PANEL_GAP - panelHeight;
  const maxTop = window.innerHeight - VIEWPORT_PADDING - panelHeight;
  top = Math.min(maxTop, Math.max(VIEWPORT_PADDING, top));

  const maxHeight = openBelow
    ? window.innerHeight - top - VIEWPORT_PADDING
    : top - VIEWPORT_PADDING;

  return { top, left, maxHeight: Math.max(120, maxHeight) };
}

const DropdownMenuContext = createContext(null);

export function DropdownMenu({
  trigger,
  triggerTooltip,
  children,
  align = "end",
  menuLabel,
  className = ""
}) {
  const [open, setOpen] = useState(false);
  const [panelCoords, setPanelCoords] = useState(null);
  const menuId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;

    if (!trigger || !panel) {
      return;
    }

    setPanelCoords(
      resolveDropdownCoords(trigger.getBoundingClientRect(), panel.getBoundingClientRect(), align)
    );
  }, [align]);

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }

    updatePanelPosition();

    const handleReposition = () => updatePanelPosition();

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, { passive: true });

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition);
    };
  }, [open, updatePanelPosition, children]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function handlePointerDown(event) {
      if (
        rootRef.current?.contains(event.target) ||
        panelRef.current?.contains(event.target)
      ) {
        return;
      }

      setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  function closeMenu() {
    setPanelCoords(null);
    setOpen(false);
  }

  const triggerButton = cloneElement(trigger, {
    type: "button",
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: (event) => {
      trigger.props.onClick?.(event);
      setOpen((current) => {
        if (current) {
          setPanelCoords(null);
        }

        return !current;
      });
    }
  });

  const resolvedTrigger = triggerTooltip ? (
    <Tooltip
      content={triggerTooltip}
      hintTrigger="auto"
      placement="bottom"
      align={align === "start" ? "start" : "end"}
    >
      {triggerButton}
    </Tooltip>
  ) : (
    triggerButton
  );

  const panel =
    open && typeof document !== "undefined" ? (
      <div
        ref={panelRef}
        id={menuId}
        role="menu"
        aria-label={menuLabel}
        className="dropdown-menu__panel dropdown-menu__panel--portaled"
        style={
          panelCoords
            ? {
                top: panelCoords.top,
                left: panelCoords.left,
                maxHeight: panelCoords.maxHeight,
                visibility: "visible"
              }
            : { visibility: "hidden" }
        }
      >
        {children}
      </div>
    ) : null;

  return (
    <DropdownMenuContext.Provider value={{ closeMenu }}>
      <div
        ref={rootRef}
        className={`dropdown-menu dropdown-menu--align-${align} ${className}`.trim()}
      >
        <span ref={triggerRef} className="dropdown-menu__trigger">
          {resolvedTrigger}
        </span>
        {panel ? createPortal(panel, document.body) : null}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuItem({
  children,
  hint,
  tooltip,
  selected = false,
  onSelect
}) {
  const { closeMenu } = useContext(DropdownMenuContext);

  const item = (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      className={`dropdown-menu__item${selected ? " is-selected" : ""}${hint ? " dropdown-menu__item--with-hint" : ""}`}
      onClick={() => {
        onSelect();
        closeMenu();
      }}
    >
      <span className="dropdown-menu__item-body">
        <span className="dropdown-menu__item-label">{children}</span>
        {hint ? <span className="dropdown-menu__item-hint">{hint}</span> : null}
      </span>
      {selected ? <span className="dropdown-menu__item-check" aria-hidden="true" /> : null}
    </button>
  );

  if (!tooltip) {
    return item;
  }

  return (
    <Tooltip content={tooltip} placement="left" align="start" hintTrigger="hover">
      {item}
    </Tooltip>
  );
}

export function DropdownMenuLabel({ children }) {
  return <p className="dropdown-menu__heading">{children}</p>;
}

export function DropdownMenuDescription({ children }) {
  return <p className="dropdown-menu__description">{children}</p>;
}
