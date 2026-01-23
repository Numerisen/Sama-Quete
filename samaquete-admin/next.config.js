/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimisations pour éviter les erreurs 404 sur les chunks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
  // Configuration pour le développement
  onDemandEntries: {
    // Période pendant laquelle les pages sont conservées en mémoire
    maxInactiveAge: 25 * 1000,
    // Nombre de pages qui doivent être conservées simultanément
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
