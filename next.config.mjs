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
  poweredByHeader: false,
  async headers() {
    // Baseline security headers (Milestone 12 hardening).
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
