import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://ayzek.tr' // Domain değişince güncellenmeli

    // Statik sayfalarımız
    const routes = [
        '',
        '/about',
        '/events',
        '/join',
        '/teams',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    return [...routes]
}
