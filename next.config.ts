import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Fix for GitHub Codespaces and other forwarded environments
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.github.dev',
        '*.githubpreview.dev',
        '*.app.github.dev',
      ],
    },
  },
};

export default nextConfig;
