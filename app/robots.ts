import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const launched = process.env.PUBLIC_LAUNCH === "1";
  if (!launched) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/saved", "/events"] },
    sitemap: "https://vegasontap.com/sitemap.xml",
  };
}
