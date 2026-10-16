import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/onboarding", "/api", "/sso-callback"],
    },
    sitemap: "https://sparrow-self.vercel.app/sitemap.xml",
  };
}
