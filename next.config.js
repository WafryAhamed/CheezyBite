/** @type {import('next').NextConfig} */
const nextConfig = {
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
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
