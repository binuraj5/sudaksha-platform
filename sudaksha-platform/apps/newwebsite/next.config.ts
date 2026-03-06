import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // newwebsite runs on port 3002 to avoid conflict with portal (3000)
  // Override via PORT env variable in production
  eslint: {
    // Run eslint separately; skip during builds to avoid picking up
    // the root monorepo .eslintrc.json outside the platform directory.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [],
  },
}

export default nextConfig
