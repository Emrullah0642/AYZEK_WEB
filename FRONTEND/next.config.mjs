/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Site tek sayfa (single-page scroll) oldu — eski ayrı sayfalar artık anasayfadaki bölümlere yönleniyor.
  async redirects() {
    return [
      { source: "/about", destination: "/#hakkimizda", permanent: false },
      { source: "/events", destination: "/#etkinlikler", permanent: false },
      { source: "/teams", destination: "/#ekibimiz", permanent: false },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.ayzek.tr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ayzek.tr',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
}
export default nextConfig
