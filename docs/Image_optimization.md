Image Optimization Configuration in Next.js (App Router)
This section documents the configuration required for next/image to properly handle external image hosts, ensuring optimal performance and security.

1. Problem: Unconfigured Host for next/image
Issue: When using the next/image component with images hosted on external domains (e.g., Cloudinary, Unsplash), Next.js throws an Error: Invalid src prop ... hostname "example.com" is not configured under images in your next.config.js.

Reason: Next.js enforces a strict security policy and optimizes image loading. To do this effectively, it requires explicit declaration of all external domains from which images will be served. This prevents arbitrary image loading and allows Next.js to apply specific optimizations.

2. Solution: Using images.remotePatterns in next.config.mjs
The recommended and modern approach to configure external image hosts in Next.js App Router is by using the remotePatterns property within the images configuration in your next.config.mjs file. This replaces the deprecated domains property, offering more granular control.

File: next.config.mjs (located at the root of your project)

Configuration:

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Added for Cloudinary images
        port: '',
        pathname: '/**',
      },
      // Add any other external image domains here following the same structure
    ],
  },
  // Other Next.js configurations...
};

export default nextConfig;

Key Concepts:

remotePatterns: An array of objects, where each object defines a pattern for allowed image URLs.

protocol: The protocol of the image URL (e.g., https).

hostname: The exact hostname of the image server (e.g., res.cloudinary.com).

port: (Optional) The port number if the image is served from a specific port.

pathname: (Optional) A glob pattern to match specific paths on the hostname (e.g., /** matches all paths).

Impact on Performance:

By explicitly defining these patterns, Next.js can safely optimize images by resizing, compressing, and serving them in modern formats (like WebP) on demand.

This offloads image processing from your server to a Content Delivery Network (CDN), which is typically provided by your image hosting service (e.g., Cloudinary). CDNs deliver content from servers geographically closer to the user, significantly reducing load times and improving the overall user experience.

3. Essential Step: Server Restart
Action: After any changes to next.config.mjs, it is mandatory to restart the Next.js development server for the changes to take effect.

Command: Stop the server (Ctrl + C) and then restart it (npm run dev).