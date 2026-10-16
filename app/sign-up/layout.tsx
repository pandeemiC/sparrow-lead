import type { Metadata } from "next";

// the page is a client component, so its title lives here
export const metadata: Metadata = { title: "Sign up" };

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
