// soft background light behind the whole dashboard, a quieter echo of the homepage.
// fixed and pointer-events-none so it never gets in the way of the app
export default function Ambient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* one wide band of light across the top, fading a little way down */}
      <div className="absolute inset-x-0 top-0 h-[55%] bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,36,56,0.2),rgba(126,15,27,0.09)_45%,transparent_75%)]" />

      {/* faint grid that fades out towards the bottom */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-size-[24px_24px] mask-[linear-gradient(to_bottom,black,transparent_60%)]" />
    </div>
  );
}
