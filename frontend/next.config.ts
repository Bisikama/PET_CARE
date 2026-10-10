import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required');
}

const backendUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Forward sang BE URL linh hoạt
      },
    ];
  },
};

export default nextConfig;
