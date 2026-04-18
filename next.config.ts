import type { NextConfig } from "next"

const nextConfig: NextConfig = {
s: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "evebshfqgykyyionhmpx.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
