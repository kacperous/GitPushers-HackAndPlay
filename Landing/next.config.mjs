/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix for Coolify/SPA routing
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/(.*)',
        destination: '/',
      },
    ]
  },
  // Ensure proper base path for production
  basePath: '',
  assetPrefix: '',
}

export default nextConfig
