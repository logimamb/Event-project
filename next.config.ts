import type { NextConfig } from 'next'
import type { Configuration as WebpackConfig } from 'webpack'

const config: NextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config: WebpackConfig) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ['postcss-loader'],
    })
    return config
  },
  // Enable source maps in development
  productionBrowserSourceMaps: true,
}

export default config 