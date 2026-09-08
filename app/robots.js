const SITE = "https://jhanarich.com";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: SITE + "/sitemap.xml",
  };
}
