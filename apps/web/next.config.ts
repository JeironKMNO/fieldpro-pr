import type { NextConfig } from "next";

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
  
  // Experimental features for performance
  experimental: {
    // Optimize package imports for faster dev
    optimizePackageImports: [
      "lucide-react",
      "@fieldpro/ui",
    ],
    // Turbopack optimizations
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production" 
      ? { exclude: ["error"] } 
      : false,
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
    // Optimize dev build
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
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
