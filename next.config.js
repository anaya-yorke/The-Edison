/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    loader: 'default',
    domains: [],
  },
  trailingSlash: true,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  }
}

module.exports = nextConfig 