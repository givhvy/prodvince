"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  ComponentType,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib";

export type NotchPosition = "top" | "bottom";

export interface NotchItemData {
  id: string;
  label: string;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

export interface NotchWingProps {
  position?: NotchPosition;
  className?: string;
  fillClassName?: string;
}

function wingFillClass(fillClassName?: string) {
  return cn(
    "pointer-events-none absolute overflow-visible select-none text-zinc-950 transition-colors duration-200",
    fillClassName,
  );
}

export function NotchLeftWing({
  position = "top",
  className,
  fillClassName,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        wingFillClass(fillClassName),
        "right-full size-2.5 md:size-4",
        isBottom ? "bottom-0" : "top-0",
        className,
      )}
    >
      <path
        d={
          isBottom
            ? "M 0 20 C 11.046 20 20 11.046 20 0 H 21 V 21 H 0 Z"
            : "M 0 0 C 11.046 0 20 8.954 20 20 H 21 V -1 H 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchRightWing({
  position = "top",
  className,
  fillClassName,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        wingFillClass(fillClassName),
        "left-full size-2.5 md:size-4",
        isBottom ? "bottom-0" : "top-0",
        className,
      )}
    >
      <path
        d={
          isBottom
            ? "M 20 20 C 8.954 20 0 11.046 0 0 H -1 V 21 H 20 Z"
            : "M 20 0 C 8.954 0 0 8.954 0 20 H -1 V -1 H 20 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchCornerLeftWing({
  position = "top",
  className,
  fillClassName,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        wingFillClass(fillClassName),
        "left-0 size-2.5 md:size-4",
        isBottom ? "bottom-full" : "top-full",
        className,
      )}
    >
      <path
        d={
          isBottom
            ? "M 0 20 H 20 C 8.954 20 0 11.046 0 0 V 20 Z"
            : "M 0 0 H 20 C 8.954 0 0 8.954 0 20 V 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchCornerRightWing({
  position = "top",
  className,
  fillClassName,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        wingFillClass(fillClassName),
        "right-0 size-2.5 md:size-4",
        isBottom ? "bottom-full" : "top-full",
        className,
      )}
    >
      <path
        d={
          isBottom
            ? "M 20 20 H 0 C 11.046 20 20 11.046 20 0 V 20 Z"
            : "M 20 0 H 0 C 11.046 0 20 8.954 20 20 V 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export interface NotchItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  id: string;
  label: string;
  isActive: boolean;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
  lightSurface?: boolean;
}

export const NotchItem = forwardRef<HTMLButtonElement, NotchItemProps>(
  (
    {
      id,
      label,
      isActive,
      icon: Icon,
      badge,
      disabled,
      className,
      onClick,
      onSelect,
      lightSurface = false,
      ...props
    },
    ref,
  ) => {
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onSelect(id);
      onClick?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!disabled) {
          onSelect(id);
        }
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors outline-none select-none",
          "focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1",
          lightSurface
            ? isActive
              ? "font-semibold text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900"
            : isActive
              ? "font-semibold text-zinc-50 dark:text-zinc-950"
              : "text-zinc-400 hover:text-zinc-200 dark:text-zinc-600 dark:hover:text-zinc-900",
          !lightSurface && "dark:focus-visible:ring-zinc-500",
          disabled && "pointer-events-none cursor-not-allowed opacity-40",
          className,
        )}
        {...props}
      >
        {isActive && (
          <motion.span
            layoutId={lightSurface ? "site-notch-active-pill" : "notch-active-pill"}
            className={cn(
              "absolute inset-0 rounded-full",
              lightSurface ? "bg-zinc-800" : "bg-zinc-800 dark:bg-zinc-300",
            )}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
        )}

        <span className="relative z-10 flex items-center gap-2">
          {Icon && (
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                lightSurface
                  ? isActive
                    ? "text-zinc-50"
                    : "text-zinc-500"
                  : isActive
                    ? "text-zinc-50 dark:text-zinc-950"
                    : "text-zinc-400 dark:text-zinc-600",
              )}
            />
          )}

          <span className="leading-none">{label}</span>

          {badge && (
            <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-zinc-300 uppercase dark:bg-zinc-300 dark:text-zinc-800">
              {badge}
            </span>
          )}
        </span>
      </button>
    );
  },
);

NotchItem.displayName = "NotchItem";

interface NotchDropdownItemProps {
  item: NotchItemData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  lightSurface?: boolean;
}

function NotchDropdownItem({
  item,
  isSelected,
  onSelect,
  lightSurface = false,
}: NotchDropdownItemProps) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      disabled={item.disabled}
      onClick={() => onSelect(item.id)}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-sm outline-none transition-colors select-none",
        "focus-visible:ring-2 focus-visible:ring-zinc-400",
        lightSurface
          ? isSelected
            ? "bg-zinc-800 font-semibold text-zinc-50"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200"
          : isSelected
            ? "bg-zinc-800 font-semibold text-zinc-50 dark:bg-zinc-300 dark:text-zinc-950"
            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 active:bg-zinc-800 dark:text-zinc-600 dark:hover:bg-zinc-300/60 dark:hover:text-zinc-950 dark:active:bg-zinc-300",
        !lightSurface && "dark:focus-visible:ring-zinc-500",
        item.disabled && "pointer-events-none cursor-not-allowed opacity-40",
      )}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <Icon
            className={cn(
              "size-4 shrink-0",
              lightSurface
                ? isSelected
                  ? "text-zinc-50"
                  : "text-zinc-500"
                : isSelected
                  ? "text-zinc-50 dark:text-zinc-950"
                  : "text-zinc-400 dark:text-zinc-600",
            )}
          />
        )}
        <span>{item.label}</span>
      </div>

      {isSelected && (
        <Check
          className={cn(
            "size-3.5",
            lightSurface ? "text-zinc-50" : "text-zinc-50 dark:text-zinc-950",
          )}
        />
      )}
    </button>
  );
}

export interface NotchNavProps extends HTMLAttributes<HTMLDivElement> {
  items: NotchItemData[];
  activeId?: string;
  defaultActiveId?: string;
  position?: NotchPosition;
  logo?: ReactNode;
  rightContent?: ReactNode;
  showLogo?: boolean;
  showRightContent?: boolean;
  children?: ReactNode;
  onActiveChange?: (id: string) => void;
}

export function NotchNav({
  items,
  activeId: controlledActiveId,
  defaultActiveId,
  position = "top",
  logo,
  rightContent,
  showLogo = true,
  showRightContent = true,
  children,
  onActiveChange,
  className,
  ...props
}: NotchNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutGroupId = useId();
  const [internalActiveId, setInternalActiveId] = useState<string>(
    defaultActiveId || items[0]?.id || "",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isBottom = position === "bottom";

  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

  const activeIndex = useMemo(() => {
    const index = items.findIndex((item) => item.id === activeId);
    return index >= 0 ? index : 0;
  }, [items, activeId]);

  const activeItem = items[activeIndex] || items[0];

  const handleSelect = useCallback(
    (id: string) => {
      if (controlledActiveId === undefined) {
        setInternalActiveId(id);
      }
      setIsDropdownOpen(false);
      onActiveChange?.(id);
    },
    [controlledActiveId, onActiveChange],
  );

  const handleToggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const notchSurface = "bg-zinc-200 text-zinc-950";
  const wingFill = "text-zinc-950";

  const desktopNavItems = (
    <LayoutGroup id={layoutGroupId}>
      <div className="flex items-center gap-1">
        {items.map((item) => (
          <NotchItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            disabled={item.disabled}
            isActive={item.id === activeId}
            onSelect={handleSelect}
            lightSurface
          />
        ))}
      </div>
    </LayoutGroup>
  );

  const notchBar = (
    <>
      <div
        aria-hidden="true"
        onClick={handleCloseDropdown}
        className={cn(
          "absolute inset-0 z-40 rounded-none transition-opacity duration-200 ease-out xl:hidden md:rounded-2xl",
          isDropdownOpen
            ? "pointer-events-auto bg-black/20 opacity-100 backdrop-blur-[2px]"
            : "pointer-events-none opacity-0",
        )}
      />

      {showLogo && logo && (
        <aside
          aria-label="Brand logo notch"
          className={cn(
            "pointer-events-auto absolute left-0 z-50 hidden h-10 select-none px-5 xl:flex",
            notchSurface,
            isBottom
              ? "bottom-0 rounded-tr-[24px] md:items-end"
              : "top-0 rounded-br-[24px] md:items-baseline",
          )}
        >
          <div className="flex items-center">{logo}</div>
          <NotchRightWing position={position} fillClassName={wingFill} />
          <NotchCornerLeftWing position={position} fillClassName={wingFill} />
        </aside>
      )}

      <header
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          "pointer-events-auto absolute left-1/2 z-50 hidden h-11 -translate-x-1/2 select-none px-4 xl:flex",
          notchSurface,
          isBottom
            ? "bottom-0 rounded-t-[24px] md:items-end"
            : "top-0 rounded-b-[24px] md:items-start",
        )}
      >
        <NotchLeftWing position={position} fillClassName={wingFill} />
        <NotchRightWing position={position} fillClassName={wingFill} />
        {desktopNavItems}
      </header>

      {showRightContent && rightContent && (
        <aside
          aria-label="User actions notch"
          className={cn(
            "pointer-events-auto absolute right-0 z-50 hidden h-10 select-none px-5 xl:flex",
            notchSurface,
            isBottom
              ? "bottom-0 rounded-tl-[24px] md:items-end"
              : "top-0 rounded-bl-[24px] md:items-start",
          )}
        >
          <NotchLeftWing position={position} fillClassName={wingFill} />
          <NotchCornerRightWing position={position} fillClassName={wingFill} />
          <div className="flex items-center">{rightContent}</div>
        </aside>
      )}

      <div
        ref={containerRef}
        className={cn(
          "pointer-events-auto absolute left-1/2 z-50 flex w-auto -translate-x-1/2 flex-col px-4 select-none xl:hidden",
          notchSurface,
          isBottom ? "bottom-0 rounded-t-[24px]" : "top-0 rounded-b-[24px]",
        )}
      >
        <NotchLeftWing position={position} fillClassName={wingFill} />
        <NotchRightWing position={position} fillClassName={wingFill} />

        <div
          className={cn(
            "flex h-10 w-auto items-center justify-between gap-3 sm:gap-5 lg:w-full",
            isBottom ? "sm:items-baseline md:items-end" : "sm:items-baseline md:items-start",
          )}
        >
          {showLogo && logo && <div className="flex shrink-0 items-center">{logo}</div>}

          <button
            type="button"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            aria-label="Toggle navigation menu"
            onClick={handleToggleDropdown}
            className="group flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 sm:h-8.5 sm:max-w-[11rem] sm:flex-none sm:p-2.5 sm:text-sm sm:hover:bg-zinc-300/70"
          >
            {activeItem?.icon && (
              <activeItem.icon className="size-3.5 shrink-0 text-zinc-600 sm:size-4" />
            )}
            <span className="truncate leading-none">{activeItem?.label}</span>
            {isBottom ? (
              <ChevronUp
                className={cn(
                  "size-3.5 text-zinc-600 transition-transform duration-200",
                  isDropdownOpen && "rotate-180",
                )}
              />
            ) : (
              <ChevronDown
                className={cn(
                  "size-3.5 text-zinc-600 transition-transform duration-200",
                  isDropdownOpen && "rotate-180",
                )}
              />
            )}
          </button>

          {showRightContent && rightContent && (
            <div className="flex w-max shrink-0 items-center justify-end">{rightContent}</div>
          )}
        </div>

        <div
          role="listbox"
          aria-label="Navigation options"
          className={cn(
            "grid w-full transition-[grid-template-rows,opacity] duration-200 ease-out",
            isDropdownOpen
              ? "grid-rows-[1fr] opacity-100"
              : "pointer-events-none grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "flex w-full flex-col gap-0.5 px-0.5",
                isBottom ? "pt-1.5 pb-2" : "pt-1.5 pb-2.5",
              )}
            >
              {items.map((item) => (
                <NotchDropdownItem
                  key={item.id}
                  item={item}
                  isSelected={item.id === activeId}
                  onSelect={handleSelect}
                  lightSurface
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 h-dvh w-screen overflow-hidden bg-zinc-950 p-0 md:p-2",
        className,
      )}
      {...props}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-none bg-background text-foreground antialiased md:rounded-2xl">
        {notchBar}

        <div
          className={cn(
            "relative flex h-full w-full flex-col items-stretch justify-start overflow-x-hidden overflow-y-auto",
            isBottom ? "pt-3 pb-20" : "pt-14 pb-3",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
