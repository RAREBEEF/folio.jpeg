/** @type {import('next').NextConfig} */
import createProxyMiddleware from "http-proxy-middleware";
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
    ],
  },
  // reactStrictMode: false,
  swcMinify: true,
  experimental: {
    scrollRestoration: true,
  },
};

export default pwa(nextConfig);
