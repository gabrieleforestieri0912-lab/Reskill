import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: [
    "jsdom",
    "pdf-parse",
    "bcryptjs",
    "nodemailer",
    "turndown",
    "@mozilla/readability",
    "stripe",
    "@ai-sdk/openai",
    "ai",
    "resend",
    "youtube-transcript",
    "@supabase/supabase-js",
  ],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization,x-extension-token" },
        ],
      },
    ];
  },
};

export default nextConfig;