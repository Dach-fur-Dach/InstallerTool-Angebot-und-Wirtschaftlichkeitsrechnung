import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/partnertools",
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
