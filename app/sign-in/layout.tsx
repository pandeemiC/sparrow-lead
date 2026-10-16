import type { Metadata } from "next";

// the page is a client component, so its title lives here
export const metadata: Metadata = { title: "Sign in" };

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
