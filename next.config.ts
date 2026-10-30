import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Avatar thumbnails are served directly from these trusted image hosts.
    // unoptimized is set on the components to avoid paid image transformations.
    remotePatterns: [
      { protocol: "https", hostname: "mc-heads.net", pathname: "/avatar/**" },
      {
        protocol: "https",
        hostname: "ywtysiovuvzucfxopusj.supabase.co",
        pathname: "/storage/v1/object/public/profile-avatars/**",
      },
    ],
  },
};

export default nextConfig;
