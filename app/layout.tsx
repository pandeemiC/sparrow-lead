import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sparrow",
  description:
    "AI-Powered social listener that finds exactly what you are looking to share.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning={true}
        className={`${montserrat.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
