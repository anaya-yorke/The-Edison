/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'akamai',
    path: process.env.NODE_ENV === 'production' ? '/The-Edison' : '/',
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/The-Edison' : '/',
  basePath: process.env.NODE_ENV === 'production' ? '/The-Edison' : '',
}

module.exports = nextConfig 