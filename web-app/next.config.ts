import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/map",
        destination: "/home",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
