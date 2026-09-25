/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow phone testing through this laptop's LAN address in development.
  allowedDevOrigins: ['192.168.1.4'],
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const isLocalBackend = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?=[:/]|$)/i.test(backend)
    if (process.env.NODE_ENV !== 'development' || !isLocalBackend) return []

    return [{
      source: '/api/:path*',
      destination: `${backend.replace(/\/$/, '')}/:path*`,
    }]
  },
  async headers() {
    return [
      {
        // The service worker is versioned by its own contents: the browser
        // byte-compares /sw.js on navigation and reinstalls on any diff. That
        // only works if the file is actually revalidated — a CDN or browser
        // caching it for hours would pin a stale worker (and, from SF6, a
        // stale cache-invalidation routine) with no way to recover.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Same reasoning: an install prompt driven by a stale manifest would
        // keep pointing at old icons or an old start_url.
        source: '/manifest.webmanifest',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig
