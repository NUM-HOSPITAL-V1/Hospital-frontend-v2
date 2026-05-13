/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath: "/hospital",
  images: { unoptimized: false },
  async rewrites() {
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    // If the frontend already talks to a same-origin /api path, do not rewrite again.
    if (backendBaseUrl.startsWith("/")) {
      return [];
    }

    const normalizedBackendBaseUrl = backendBaseUrl.endsWith("/api")
      ? backendBaseUrl
      : `${backendBaseUrl}/api`;

    return [
      {
        source: "/api/:path*",
        destination: `${normalizedBackendBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
