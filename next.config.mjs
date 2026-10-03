/*
 * Backend origin. Server-side only — deliberately NOT NEXT_PUBLIC_*, because
 * the browser must never be told this URL. The whole point of the rewrite below
 * is that the browser only ever talks to this Vercel origin.
 */
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://varadhi-project-tracker.onrender.com')

/** @type {import('next').NextConfig} */
const nextConfig = {
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
