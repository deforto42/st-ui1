import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "img6.dbcart.net" },
      // { protocol: "https", hostname: "img*.dbcart.net" as any }, // 일부 환경에서 와일드카드가 제한될 수 있어 필요시 제거
    ],
  },
};

export default nextConfig;
