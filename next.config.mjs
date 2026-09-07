/** @type {import('next').NextConfig} */
// STATIC_EXPORT=1 → static HTML build for Hostinger (npm run export:hostinger).
// Default → server mode for local dev / VPS / Vercel.
const isExport = process.env.STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  ...(isExport ? { output: "export" } : {}),
};

export default nextConfig;
