"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Icons from "@/components/global/icons";
import { cn } from "@/lib";

import { AUTH_PANEL_IMAGES, designImage } from "@/lib/design-images";

const images = AUTH_PANEL_IMAGES.map((item) => designImage(item.url, 900));

const prompts = [
  "142 BPM · F# minor · dark trap with airy pads, sliding 808s, and a hook ready for vocals",
  "82 BPM · lo-fi jazz hop · dusty drums, rhodes chords, vinyl crackle, late-night studio mood",
  "104 BPM · afrobeat · log drums, warm bass, summer night energy, radio-ready arrangement",
  "90 BPM · cinematic · orchestral strings, trailer tension, huge drop into a minimal beat switch",
];

type AuthSectionProps = {
  children: ReactNode;
  className?: string;
};

export function AuthSection({ children, className }: AuthSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      className={cn(
        "min-h-screen w-full bg-background p-3 text-foreground antialiased [font-synthesis:none]",
        className,
      )}
    >
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="flex min-h-[760px] justify-center overflow-hidden rounded-xl bg-black px-7 py-12 text-white sm:px-10 lg:min-h-0 lg:py-20 xl:py-24">
          <div className="flex w-full max-w-[500px] flex-col items-center">
            <Link href="/" className="flex items-center gap-3 text-lg text-white transition-opacity hover:opacity-80">
              <Icons.icon className="size-6" />
              Velta
            </Link>

            <div className="relative mt-8 grid w-full grid-cols-[1.55fr_1fr] gap-2 rounded-md">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-black to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-black to-transparent" />
              <ImageTile
                src={images[0]}
                active={activeIndex === 0}
                className="row-span-2 h-[250px]"
              />
              <ImageTile
                src={images[1]}
                active={activeIndex === 1}
                className="h-[121px]"
              />
              <ImageTile
                src={images[3]}
                active={activeIndex === 3}
                className="h-[121px]"
              />
              <ImageTile
                src={images[2]}
                active={activeIndex === 2}
                className="col-span-2 h-[120px]"
              />
            </div>

            <div className="mt-6 w-full rounded-[10px] border border-dashed border-white/15 px-5 py-4">
              <div className="flex items-end gap-4">
                <p className="line-clamp-4 flex-1 text-xs leading-4 text-white/45">
                  <span className="font-semibold text-white">/beat</span> {prompts[activeIndex]}
                </p>
                <button
                  type="button"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                  aria-label="Preview beat prompt"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

            <p className="mt-7 max-w-[280px] text-center text-xl leading-tight text-white">
              A marketplace workspace for producers and buyers
            </p>

            <div className="mt-auto flex gap-2 pb-8 pt-8">
              {prompts.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={
                    activeIndex === index
                      ? "h-1 w-10 rounded-full bg-white"
                      : "h-1 w-4 rounded-full bg-white/35"
                  }
                  aria-label={`Show beat prompt ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-[760px] items-center justify-center px-6 py-12 sm:px-10 lg:min-h-0 lg:px-14 xl:px-20">
          {children}
        </div>
      </div>
    </section>
  );
}

function ImageTile({
  src,
  active,
  className,
}: {
  src: string;
  active: boolean;
  className: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-visible rounded-md",
        className,
        active ? "z-10" : "z-0",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Beat marketplace studio imagery"
        className={cn(
          "h-full w-full rounded-md object-cover transition-opacity duration-700",
          active ? "opacity-100" : "opacity-40",
        )}
      />
      <FocusCorners active={active} />
    </div>
  );
}

function FocusCorners({ active }: { active: boolean }) {
  const baseClass = cn(
    "pointer-events-none absolute h-4 w-4 border-white/60 transition-all duration-500 ease-out",
    active ? "translate-x-0 translate-y-0 opacity-100" : "opacity-0",
  );

  return (
    <>
      <div
        className={cn(
          baseClass,
          "-left-2 -top-2 border-l border-t",
          !active && "-translate-x-2 -translate-y-2",
        )}
      />
      <div
        className={cn(
          baseClass,
          "-right-2 -top-2 border-r border-t",
          !active && "translate-x-2 -translate-y-2",
        )}
      />
      <div
        className={cn(
          baseClass,
          "-bottom-2 -left-2 border-b border-l",
          !active && "-translate-x-2 translate-y-2",
        )}
      />
      <div
        className={cn(
          baseClass,
          "-bottom-2 -right-2 border-b border-r",
          !active && "translate-x-2 translate-y-2",
        )}
      />
    </>
  );
}

export function AuthFormShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[500px] text-center">
      <h1 className="whitespace-nowrap text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-[42px] lg:leading-[1.05]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
      {children}
      {footer}
    </div>
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-8 flex items-center gap-4 text-sm text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      {label}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function SocialButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className="flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm leading-none text-foreground opacity-70 transition-colors hover:bg-accent/40 disabled:cursor-not-allowed"
    >
      <span className="shrink-0">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

export function AuthFieldBox({
  label,
  name,
  type = "text",
  defaultValue = "",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isEditing, setIsEditing] = useState(!defaultValue);

  return (
    <label className="flex h-11 items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 text-base leading-none">
      <input
        name={name}
        type={type}
        value={inputValue}
        required={required}
        autoComplete={autoComplete}
        aria-label={label}
        onFocus={() => {
          if (!isEditing && defaultValue) {
            setInputValue("");
            setIsEditing(true);
          }
        }}
        onChange={(event) => {
          setInputValue(event.target.value);
          setIsEditing(true);
        }}
        className="min-w-0 flex-1 truncate bg-transparent text-muted-foreground outline-none placeholder:text-muted-foreground"
      />
      {!isEditing && inputValue ? (
        <span className="shrink-0 text-foreground">{label}</span>
      ) : (
        <span className="shrink-0 text-muted-foreground">{label}</span>
      )}
    </label>
  );
}

export function AuthCheckboxLine({ children }: { children: ReactNode }) {
  return (
    <label className="flex items-start gap-3 text-left">
      <span className="relative mt-0.5 size-3 shrink-0">
        <input
          type="checkbox"
          className="peer size-full appearance-none rounded-[2px] border border-border bg-card checked:border-blue-500 checked:bg-blue-500"
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute inset-0 hidden size-full p-px text-white peer-checked:block"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.2 5 8.1 9 3.9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-xs leading-4 text-muted-foreground sm:text-[13px]">{children}</span>
    </label>
  );
}

export function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EB4335"
      />
    </svg>
  );
}

export function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.58 1.1-.95 0-2.42-1.07-3.98-1.04-2.05.03-3.94 1.19-4.99 3.02-2.13 3.69-.54 9.16 1.53 12.15 1.01 1.46 2.22 3.1 3.81 3.04 1.53-.06 2.11-.99 3.96-.99s2.37.99 3.99.96c1.65-.03 2.69-1.49 3.69-2.96 1.16-1.69 1.64-3.33 1.66-3.41-.04-.02-3.2-1.23-3.24-4.87ZM14.03 3.66c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.58-1.71Z" />
    </svg>
  );
}

export default AuthSection;
