/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
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
