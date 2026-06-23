/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@booksy/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
