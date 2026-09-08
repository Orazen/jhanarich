const SITE = "https://jhanarich.com";

export default function sitemap() {
  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
