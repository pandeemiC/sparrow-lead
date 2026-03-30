export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-sm border font-medium glass-red uppercase rounded-md px-2 py-1.5 inline-block text-white/50 border-white/5 mb-3">
          Settings
        </h1>
        {children}
      </div>
    </div>
  );
}
