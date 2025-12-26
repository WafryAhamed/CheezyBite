/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
    // Allow local images with AND without query strings (wildcard)
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
  },
  // CRITICAL: Make JWT_SECRET available to Edge Runtime (middleware)
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  },
};

module.exports = nextConfig;
