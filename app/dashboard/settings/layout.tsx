import { FaCogs } from "react-icons/fa";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-sm border font-medium glass-red uppercase rounded-md px-2 py-1.5 inline-flex gap-2 justify-center items-center text-white/50 border-white/5">
            <FaCogs size={14} className="text-white/50" /> Settings
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
