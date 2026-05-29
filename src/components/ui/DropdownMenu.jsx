import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState
} from "react";

const DropdownMenuContext = createContext(null);

export function DropdownMenu({
  trigger,
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

  return (
    <DropdownMenuContext.Provider value={{ closeMenu }}>
      <div
        ref={rootRef}
        className={`dropdown-menu dropdown-menu--align-${align} ${className}`.trim()}
      >
        {cloneElement(trigger, {
          type: "button",
          "aria-haspopup": "menu",
          "aria-expanded": open,
          "aria-controls": open ? menuId : undefined,
          onClick: (event) => {
            trigger.props.onClick?.(event);
            setOpen((current) => !current);
          }
        })}
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

export function DropdownMenuItem({ children, selected = false, onSelect }) {
  const { closeMenu } = useContext(DropdownMenuContext);

  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      className={`dropdown-menu__item${selected ? " is-selected" : ""}`}
      onClick={() => {
        onSelect();
        closeMenu();
      }}
    >
      <span className="dropdown-menu__item-label">{children}</span>
      {selected ? <span className="dropdown-menu__item-check" aria-hidden="true" /> : null}
    </button>
  );
}

export function DropdownMenuLabel({ children }) {
  return <p className="dropdown-menu__heading">{children}</p>;
}
