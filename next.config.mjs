/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Using remotePatterns for more robust and future-proof image host configuration
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.admagazine.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.example.com',
        port: '',
        pathname: '/**',
      },
      // Add any other image domains here following the remotePatterns structure
      { // Added Cloudinary hostname
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      { // Added Cloudinary hostname
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Other Next.js configurations if you have them...
};

export default nextConfig;
