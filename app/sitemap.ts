import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sparrow-self.vercel.app";
  return [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/sign-up`, lastModified: new Date(), priority: 0.5 },
  ];
}
