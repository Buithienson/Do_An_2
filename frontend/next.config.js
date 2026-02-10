/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static HTML export for Static Site deployment
  images: {
    unoptimized: true, // Required for static export
  },
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during build to avoid blocking deployment
  },
  typescript: {
    ignoreBuildErrors: true, // Disable TypeScript errors during build
  },
}

module.exports = nextConfig
