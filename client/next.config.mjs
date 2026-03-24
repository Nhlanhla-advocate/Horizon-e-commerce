/** @type {import('next').NextConfig} */
const nextConfig = {
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
