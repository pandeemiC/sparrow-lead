import Sidebar from "@/components/dashboard/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-[#111111] rounded-tr-2xl rounded-br-2xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
