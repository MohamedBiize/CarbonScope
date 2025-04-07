# Configuration de Next.js pour le déploiement
# Ce fichier configure les paramètres de build et d'environnement pour Next.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://carbonscope-api.onrender.com',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://carbonscope-api.onrender.com'}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
