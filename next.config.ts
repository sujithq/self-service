import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/self-service',
  images: {
    unoptimized: true
  },
  typescript: {
    tsconfigPath: './tsconfig.next.json'
  }
}

export default nextConfig
