/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'recharts'],
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: false,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;
