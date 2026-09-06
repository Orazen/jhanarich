/** @type {import('next').NextConfig} */
const nextConfig = {
  // routeLoaderItem: excluded below via exclude list in export script (route handlers block export)
  images: { unoptimized: true },
  output: "export",
};

export default nextConfig;
