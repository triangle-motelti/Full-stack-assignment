import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    plugins: {
      "@tailwindcss/turbopack": {},
    },
  },
};

export default nextConfig;
