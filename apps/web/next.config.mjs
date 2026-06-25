import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@booksy/db"],
  // Monorepo root so Next.js file-tracing can follow pnpm symlinks up to the
  // virtual store and include the Prisma query engine binary in Lambda bundles.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Keep Prisma outside the webpack bundle so the file tracer resolves it as
  // an external require() and includes the .node engine binary in the trace.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
