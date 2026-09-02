/** @type {import('next').NextConfig} */
const serverActionsConfig = {
  bodySizeLimit: "10mb",
}

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Server Actions — increase body size limit to support expense claim form with multiple receipt images.
  experimental: {
    serverActions: serverActionsConfig,
  },
  // Silence the "custom webpack config" warning — Turbopack doesn't need the
  // canvas alias because PdfViewer is client-only and canvas is never imported
  // server-side. The webpack config below still applies for production builds.
  turbopack: {},
  webpack: (config) => {
    // pdf.js optionally imports canvas for server-side rendering — not needed here
    config.resolve.alias.canvas = false
    return config
  },
};

export default nextConfig;
