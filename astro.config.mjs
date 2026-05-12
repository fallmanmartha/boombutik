import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import alpinejs from "@astrojs/alpinejs";

export default defineConfig({
  output: "server",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [alpinejs()],
});
