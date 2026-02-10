/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' - Using Web Service instead of Static Site
  // Static Site doesn't support dynamic routes like /hotel/[id]
  images: {
    unoptimized: true, // Keep this for free tier
  },
  eslint: {
    ignoreDuringBuilds: true, // Keep linting disabled
  },
  typescript: {
    ignoreBuildErrors: true, // Keep TypeScript errors disabled
  },
}

module.exports = nextConfig
