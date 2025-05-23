import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ // Keep any existing configurations you might have here

  typescript: {
    // !! WARNING !!
    // This option tells Next.js to ignore TypeScript errors during the production build.
    // Use this as a last resort when you've exhausted all other type-checking solutions
    // for persistent build errors. It means your build won't fail due to TypeScript errors,
    // but also won't warn you about them.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;