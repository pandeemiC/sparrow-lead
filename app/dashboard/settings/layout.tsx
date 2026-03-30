export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-white mb-1">Settings</h1>
        {children}
      </div>
    </div>
  );
}
