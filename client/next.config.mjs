/** @type {import('next').NextConfig} */
const extraImageHosts = (process.env.NEXT_PUBLIC_NEXT_IMAGE_HOSTS || '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '5000', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      ...extraImageHosts.map((hostname) => ({
        protocol: 'https',
        hostname,
        pathname: '/**',
      })),
    ],
  },
  async rewrites() {
    return [
      {
        source: '/dashboard/:path*',
        destination: 'http://localhost:5000/dashboard/:path*',
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:5000/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
