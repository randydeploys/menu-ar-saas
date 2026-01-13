import type { NextConfig } from "next";

const nextConfig: NextConfig = {
experimental: {
    authInterrupts: true, // Active la fonctionnalité
  },
};

export default nextConfig;
