// vite.config.js
import { defineConfig } from "file:///sessions/clever-wizardly-pasteur/mnt/femsaidiakenya/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/clever-wizardly-pasteur/mnt/femsaidiakenya/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///sessions/clever-wizardly-pasteur/mnt/femsaidiakenya/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      workbox: {
        // The Intel Brief PDF + its viewer are regenerated out-of-band by the
        // GitHub Action (not by an app rebuild). Keep the service worker out of
        // their way: never serve the SPA shell as a navigation fallback for them
        // (that was the "blank page until you refresh" bug), and never precache
        // the viewer html (that made it go stale after each publish).
        navigateFallbackDenylist: [/\.pdf$/, /intel-brief-latest-viewer\.html$/],
        globIgnores: ["**/intel-brief-latest-viewer.html", "**/intel-brief-latest.pdf"]
      },
      manifest: {
        name: "FemSaidia Kenya",
        short_name: "FemSaidia",
        description: "Femicide Intelligence \xB7 Safety Tools \xB7 Community Response",
        theme_color: "#180410",
        background_color: "#D4BEC4",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ],
  base: "/"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvY2xldmVyLXdpemFyZGx5LXBhc3RldXIvbW50L2ZlbXNhaWRpYWtlbnlhXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvc2Vzc2lvbnMvY2xldmVyLXdpemFyZGx5LXBhc3RldXIvbW50L2ZlbXNhaWRpYWtlbnlhL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9zZXNzaW9ucy9jbGV2ZXItd2l6YXJkbHktcGFzdGV1ci9tbnQvZmVtc2FpZGlha2VueWEvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nXSxcbiAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgLy8gVGhlIEludGVsIEJyaWVmIFBERiArIGl0cyB2aWV3ZXIgYXJlIHJlZ2VuZXJhdGVkIG91dC1vZi1iYW5kIGJ5IHRoZVxuICAgICAgICAvLyBHaXRIdWIgQWN0aW9uIChub3QgYnkgYW4gYXBwIHJlYnVpbGQpLiBLZWVwIHRoZSBzZXJ2aWNlIHdvcmtlciBvdXQgb2ZcbiAgICAgICAgLy8gdGhlaXIgd2F5OiBuZXZlciBzZXJ2ZSB0aGUgU1BBIHNoZWxsIGFzIGEgbmF2aWdhdGlvbiBmYWxsYmFjayBmb3IgdGhlbVxuICAgICAgICAvLyAodGhhdCB3YXMgdGhlIFwiYmxhbmsgcGFnZSB1bnRpbCB5b3UgcmVmcmVzaFwiIGJ1ZyksIGFuZCBuZXZlciBwcmVjYWNoZVxuICAgICAgICAvLyB0aGUgdmlld2VyIGh0bWwgKHRoYXQgbWFkZSBpdCBnbyBzdGFsZSBhZnRlciBlYWNoIHB1Ymxpc2gpLlxuICAgICAgICBuYXZpZ2F0ZUZhbGxiYWNrRGVueWxpc3Q6IFsvXFwucGRmJC8sIC9pbnRlbC1icmllZi1sYXRlc3Qtdmlld2VyXFwuaHRtbCQvXSxcbiAgICAgICAgZ2xvYklnbm9yZXM6IFsnKiovaW50ZWwtYnJpZWYtbGF0ZXN0LXZpZXdlci5odG1sJywgJyoqL2ludGVsLWJyaWVmLWxhdGVzdC5wZGYnXSxcbiAgICAgIH0sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnRmVtU2FpZGlhIEtlbnlhJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ0ZlbVNhaWRpYScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRmVtaWNpZGUgSW50ZWxsaWdlbmNlIFx1MDBCNyBTYWZldHkgVG9vbHMgXHUwMEI3IENvbW11bml0eSBSZXNwb25zZScsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzE4MDQxMCcsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjRDRCRUM0JyxcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0LXByaW1hcnknLFxuICAgICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7IHNyYzogJy9pY29uLTE5Mi5wbmcnLCBzaXplczogJzE5MngxOTInLCB0eXBlOiAnaW1hZ2UvcG5nJyB9LFxuICAgICAgICAgIHsgc3JjOiAnL2ljb24tNTEyLnBuZycsIHNpemVzOiAnNTEyeDUxMicsIHR5cGU6ICdpbWFnZS9wbmcnIH0sXG4gICAgICAgICAgeyBzcmM6ICcvaWNvbi01MTIucG5nJywgc2l6ZXM6ICc1MTJ4NTEyJywgdHlwZTogJ2ltYWdlL3BuZycsIHB1cnBvc2U6ICdtYXNrYWJsZScgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgYmFzZTogJy8nLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFUsU0FBUyxvQkFBb0I7QUFDM1csT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsYUFBYTtBQUFBLE1BQzdCLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFNUCwwQkFBMEIsQ0FBQyxVQUFVLGtDQUFrQztBQUFBLFFBQ3ZFLGFBQWEsQ0FBQyxxQ0FBcUMsMkJBQTJCO0FBQUEsTUFDaEY7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxVQUNMLEVBQUUsS0FBSyxpQkFBaUIsT0FBTyxXQUFXLE1BQU0sWUFBWTtBQUFBLFVBQzVELEVBQUUsS0FBSyxpQkFBaUIsT0FBTyxXQUFXLE1BQU0sWUFBWTtBQUFBLFVBQzVELEVBQUUsS0FBSyxpQkFBaUIsT0FBTyxXQUFXLE1BQU0sYUFBYSxTQUFTLFdBQVc7QUFBQSxRQUNuRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxNQUFNO0FBQ1IsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
