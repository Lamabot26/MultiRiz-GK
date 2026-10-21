import { cn } from "@/lib/utils";

/**
 * GridKavach brand logo: the original uploaded artwork
 * (navy shield with solar-cell grid, rising sun, "Solar for Everyone.").
 * Transparent-background PNG generated from the original file.
 */
export function Logo({
  inverted = false,
  className,
}: {
  inverted?: boolean;
  className?: string;
}) {
  if (inverted) {
    // On dark surfaces, present the original full-colour logo on a white chip
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-xl bg-white/95 px-3 py-1.5 shadow-sm",
          className
        )}
      >
          <img
          src="/brand/gridkavach-logo.png"
          alt="GridKavach: Solar for Everyone"
          className="h-9 w-auto"
        />
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src="/brand/gridkavach-logo.png"
        alt="GridKavach: Solar for Everyone"
        className="h-10 w-auto md:h-11"
        draggable={false}
      />
    </span>
  );
}

/** Square icon-only mark (shield + sun) from the original logo. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/icon-512.png"
      alt=""
      aria-hidden="true"
      className={cn("h-9 w-9", className)}
      draggable={false}
    />
  );
}
