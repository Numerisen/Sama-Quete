/** @type {import('next').NextConfig} */
import webpack from 'webpack'

const nextConfig = {
  images: {
    domains: ['placeholder.svg'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Désactiver le prérendu statique pour éviter les erreurs useSearchParams
  output: 'standalone',
  // Exclure Firebase et undici du bundle (utilisés côté serveur)
  experimental: {
    // ⚠ Ne pas inclure 'undici' ici si on le met dans transpilePackages (conflit Next)
    serverComponentsExternalPackages: ['firebase', 'firebase-admin'],
  },
  // Transpiler undici pour supporter la syntaxe moderne
  transpilePackages: ['undici'],
  // Configuration webpack pour éviter les erreurs de fonts et undici
  webpack: (config, { isServer, webpack }) => {
    // Gérer les polices (woff, ttf, etc.) sans loader externe
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: "asset/resource",
      generator: {
        filename: "static/fonts/[name].[hash][ext]",
      },
    })
    
    // Exclure uniquement undici du bundle client (Firebase est utilisé côté navigateur)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
      }
      
      // Ignorer complètement undici côté client
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^undici$/,
        })
      )
    }
    
    return config
  },
  // Headers personnalisés
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

export default nextConfig