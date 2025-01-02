const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        http2: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        stream: false,
        util: false,
        crypto: false,
        os: false,
        url: false,
        assert: false,
        constants: false,
        child_process: false,
        process: false,
        querystring: false,
        buffer: false,
      };

      // Replace Node.js modules with empty modules on client side
      config.module.rules.push({
        test: /https-proxy-agent|agent-base|debug|ms|events|util|tls|net|assert|http|https|crypto|stream|buffer|process/,
        use: 'null-loader'
      });

      // Ignore Node.js specific modules
      config.resolve.alias = {
        ...config.resolve.alias,
        'https-proxy-agent': false,
        'agent-base': false,
        'net': false,
        'tls': false,
        'http': false,
        'https': false,
        'stream': false,
        'crypto': false,
        'buffer': false,
      };
    }
    return config;
  },
  // Disable static page caching in development
  experimental: {
    isrMemoryCacheSize: 0,
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  }
};

module.exports = withNextIntl(nextConfig);