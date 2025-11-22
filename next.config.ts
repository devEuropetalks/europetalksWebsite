import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
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
  turbopack: {
    resolveAlias: {
      // Map .d.cts files to .d.ts to avoid module format issues
      ".d.cts": ".d.ts",
    },
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  // Temporary workaround: Use webpack for builds until Turbopack fully supports UploadThing
  // Remove this once UploadThing packages are fully compatible with Turbopack
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config) => {
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.(md|LICENSE)$/,
      type: "asset/source",
    });
    config.resolve = config.resolve || {};
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".d.cts": [".d.ts"],
    };
    return config;
  },
};

export default nextConfig;
