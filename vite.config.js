/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    coverage: { reporter: ["text", "json-summary"] },
  },
  server: {
    allowedHosts: true,
    proxy: {
      "/api/claude": {
        target: "https://api.anthropic.com",
        changeOrigin: true,
        rewrite: () => "/v1/messages",
        timeout: 120000,
        proxyTimeout: 120000,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "AI Fit Training",
        short_name: "AIFit",
        description: "AI-powered personal fitness and nutrition training coach",
        theme_color: "#6C63FF",
        background_color: "#0A0A0F",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Don't intercept Google Fonts — let browser HTTP cache handle them.
        // Intercepting them requires connect-src CSP allowance in the SW context.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});
