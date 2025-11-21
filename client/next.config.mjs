/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/dashboard/:path*',
        destination: 'http://localhost:5000/dashboard/:path*',
      },
    ];
  },
};

export default nextConfig;
