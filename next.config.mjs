/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Server Actions are enabled by default in Next 15; body size raised for document metadata payloads.
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    // Object-storage/CDN hosts are added here as storage is configured (Milestone 2/5).
    remotePatterns: [],
  },
};

export default nextConfig;
