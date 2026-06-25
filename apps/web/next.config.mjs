import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@booksy/db"],
  // Required for pnpm monorepo: let Next.js trace files up to the repo root
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    // Force-include the Prisma query engine binary that Netlify's Lambda needs.
    // pnpm stores it in the virtual store, which Next.js file-tracing misses.
    outputFileTracingIncludes: {
      "/**": [
        "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**",
      ],
    },
  },
};

export default nextConfig;
