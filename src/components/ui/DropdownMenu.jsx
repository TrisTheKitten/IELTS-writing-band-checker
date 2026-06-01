import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import { Tooltip } from "../Tooltip.jsx";

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
  const menuId = useId();
  const rootRef = useRef(null);

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
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  const triggerButton = cloneElement(trigger, {
    type: "button",
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: (event) => {
      trigger.props.onClick?.(event);
      setOpen((current) => !current);
    }
  });

  const resolvedTrigger = triggerTooltip ? (
    <Tooltip
      content={triggerTooltip}
      portaled
      placement="bottom"
      align={align === "start" ? "start" : "end"}
    >
      {triggerButton}
    </Tooltip>
  ) : (
    triggerButton
  );

  return (
    <DropdownMenuContext.Provider value={{ closeMenu }}>
      <div
        ref={rootRef}
        className={`dropdown-menu dropdown-menu--align-${align} ${className}`.trim()}
      >
        {resolvedTrigger}
        {open ? (
          <div
            id={menuId}
            role="menu"
            aria-label={menuLabel}
            className="dropdown-menu__panel"
          >
            {children}
          </div>
        ) : null}
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
    <Tooltip content={tooltip} portaled placement="left" align="start">
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
