/** @type {import('next').NextConfig} */
import withPwa from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

const pwa = withPwa({
  dest: "public",
  runtimeCaching,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "graph.facebook.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  swcMinify: true,
  experimental: {
    scrollRestoration: true,
  },
};

export default pwa(nextConfig);
