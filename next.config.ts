import type { NextConfig } from 'next'

// Use GitHub Pages-friendly settings in production so all assets and RSC
// requests are correctly resolved under the repository path (/self-service).
const isProd = process.env.NODE_ENV === 'production'
const repoBase = '/self-service'

const nextConfig: NextConfig = {
  output: 'export',
  // Only apply basePath/assetPrefix in production to keep local dev simple.
  basePath: isProd ? repoBase : undefined,
  assetPrefix: isProd ? `${repoBase}/` : undefined,
  images: {
    unoptimized: true
  },
  // Ensures export writes index.html files in folders, which is friendlier for
  // GitHub Pages static hosting.
  trailingSlash: true,
  typescript: {
    tsconfigPath: './tsconfig.next.json'
  }
}

export default nextConfig
