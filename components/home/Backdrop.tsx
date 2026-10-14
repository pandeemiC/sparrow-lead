// section background that fades in from the page black and back out again,
// so neighbouring sections blend instead of meeting on a hard line.
// children are extra glows placed inside it
export default function Backdrop({
  tint = "#160a0d",
  children,
}: {
  tint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, var(--bg) 0%, ${tint} 20%, ${tint} 80%, var(--bg) 100%)`,
      }}
    >
      {children}
    </div>
  );
}

// soft round light; position it with className (top/left etc.)
export function Glow({
  color = "rgba(255,36,56,0.16)",
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-full ${className ?? ""}`}
      style={{
        background: `radial-gradient(closest-side, ${color}, transparent)`,
      }}
    />
  );
}
