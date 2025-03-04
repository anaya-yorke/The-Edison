/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'default',
    domains: [],
  },
  // Only use these settings for production GitHub Pages deployment
  ...(process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true' ? {
    assetPrefix: '/The-Edison',
    basePath: '/The-Edison',
  } : {})
}

module.exports = nextConfig 