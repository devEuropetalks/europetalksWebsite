import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Turbopack configuration
    turbo: {
      rules: {
        // Ignore markdown files to prevent module errors
        "**/*.md": {
          loaders: [],
          as: "*.txt",
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "**",
      },
    ],
  },
  // Webpack config for production builds (fallback when not using Turbopack)
  webpack: (config) => {
    // Ignore README.md and other markdown files from node_modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    // Treat .md files as asset/source to prevent import errors
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
