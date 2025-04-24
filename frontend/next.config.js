// Configuration de Next.js pour le déploiement
// Ce fichier configure les paramètres de build et d'environnement pour Next.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // Dans frontend/next.config.js
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Capture tout ce qui commence par /api/
        // La destination doit RECONSTRUIRE le chemin complet en ajoutant /api/
        // devant ce qui a été capturé par :path*
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
