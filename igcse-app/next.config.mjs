/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    // appDir is default in Next 15
  },
};

export default nextConfig;