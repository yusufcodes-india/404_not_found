import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/kilari.html',
      },
    ];
  },
};
export default nextConfig;