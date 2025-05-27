/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
      domains: ['cdn.pixabay.com', 'localhost','example.com'], // Add localhost
      remotePatterns: [
          {
              protocol: 'http',
              hostname: 'localhost',
              port: '4000',
              pathname: '/uploads/**',
          }
      ]
  },
}

export default nextConfig;