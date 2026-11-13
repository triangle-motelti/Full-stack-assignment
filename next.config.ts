import type { NextConfig } from "next";
import tailwindcss from "@tailwindcss/turbopack";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    plugins: {
      "@tailwindcss/turbopack": tailwindcss(),
    },
  },
};

export default nextConfig;
