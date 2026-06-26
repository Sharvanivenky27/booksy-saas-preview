import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@booksy/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    // Required for pnpm monorepo: raises the file-tracing root so nft can
    // follow symlinks from packages/db → pnpm virtual store at repo root.
    outputFileTracingRoot: path.join(__dirname, "../../"),
    // Explicitly include the Prisma query engine binary for the Lambda runtime.
    // Without this, nft misses the dynamically-loaded .node file.
    outputFileTracingIncludes: {
      "/api/auth/login": [
        "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**",
      ],
      "/api/auth/me": [
        "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**",
      ],
    },
    // Keep Prisma outside the webpack bundle so it is resolved at runtime
    // and the file tracer can include the native .node engine binary.
    serverComponentsExternalPackages: ["@prisma/client", ".prisma/client"],
  },
};

export default nextConfig;
