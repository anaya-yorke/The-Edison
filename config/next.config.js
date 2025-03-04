/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['the-edison.vercel.app']
  },
  distDir: '.next'
}

module.exports = nextConfig 