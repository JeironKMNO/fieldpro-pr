import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Transpile UI packages
  transpilePackages: ["@fieldpro/ui", "@fieldpro/db", "@fieldpro/types"],

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },

  // Required for Prisma in pnpm monorepo: tells Next.js to trace files from repo root
  // (moved out of experimental in Next.js 15)
  outputFileTracingRoot: path.join(__dirname, "../../"),

  // Prisma must NOT be bundled — keep as external require() so the native
  // binary (.so.node) is resolved at runtime, not from inside a webpack chunk
  serverExternalPackages: ["@prisma/client", ".prisma/client"],

  // Experimental features for performance
  experimental: {
    // Optimize package imports for faster dev
    // Note: @fieldpro/ui is already in transpilePackages — don't add it here
    optimizePackageImports: ["lucide-react"],
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Only disable module-availability checks — do NOT set splitChunks: false
      // as it breaks Clerk and other packages that rely on code-splitting
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
      };
    }
    return config;
  },

  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Powered by header
  poweredByHeader: false,
};

export default nextConfig;
