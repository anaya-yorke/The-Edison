/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    loader: 'default',
    domains: [],
  },
  trailingSlash: true,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  }
}

module.exports = nextConfig 