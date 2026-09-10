import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://haguezoum.site",
  integrations: [react(), sitemap()],
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "user-images.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "objects.githubusercontent.com" },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
