/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/bot1/bots/:path*',
        destination: `${process.env.NEXT_PUBLIC_BOT1_API_BASE_URL}/bots/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
