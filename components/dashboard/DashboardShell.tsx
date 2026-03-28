"use client";

type UserData = {
  name: string;
  email: string;
  imageUrl: string;
};

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserData;
}) {
  return (
    <div>
      <header></header>
    </div>
  );
}
