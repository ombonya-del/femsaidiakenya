// vite.config.js
import { defineConfig } from "file:///sessions/clever-wizardly-pasteur/mnt/femsaidiakenya/itika/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/clever-wizardly-pasteur/mnt/femsaidiakenya/itika/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///sessions/clever-wizardly-pasteur/mnt/femsaidiakenya/itika/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw.js",
      injectManifest: { injectionPoint: void 0 },
      registerType: "autoUpdate",
      manifest: {
        id: "itika-responder-network",
        name: "Itika \u2014 First Responder Network",
        short_name: "Itika",
        description: "FemSaidia Kenya First Responder Network",
        theme_color: "#0A2A1A",
        background_color: "#0A2A1A",
        display: "standalone",
        orientation: "portrait",
        start_url: "https://itika.femsaidiakenya.org/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvY2xldmVyLXdpemFyZGx5LXBhc3RldXIvbW50L2ZlbXNhaWRpYWtlbnlhL2l0aWthXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvc2Vzc2lvbnMvY2xldmVyLXdpemFyZGx5LXBhc3RldXIvbW50L2ZlbXNhaWRpYWtlbnlhL2l0aWthL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9zZXNzaW9ucy9jbGV2ZXItd2l6YXJkbHktcGFzdGV1ci9tbnQvZmVtc2FpZGlha2VueWEvaXRpa2Evdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgVml0ZVBXQSh7XG4gICAgICBzdHJhdGVnaWVzOiAnaW5qZWN0TWFuaWZlc3QnLFxuICAgICAgc3JjRGlyOiAncHVibGljJyxcbiAgICAgIGZpbGVuYW1lOiAnc3cuanMnLFxuICAgICAgaW5qZWN0TWFuaWZlc3Q6IHsgaW5qZWN0aW9uUG9pbnQ6IHVuZGVmaW5lZCB9LFxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBpZDogJ2l0aWthLXJlc3BvbmRlci1uZXR3b3JrJyxcbiAgICAgICAgbmFtZTogJ0l0aWthIFx1MjAxNCBGaXJzdCBSZXNwb25kZXIgTmV0d29yaycsXG4gICAgICAgIHNob3J0X25hbWU6ICdJdGlrYScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRmVtU2FpZGlhIEtlbnlhIEZpcnN0IFJlc3BvbmRlciBOZXR3b3JrJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMEEyQTFBJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMwQTJBMUEnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxuICAgICAgICBzdGFydF91cmw6ICdodHRwczovL2l0aWthLmZlbXNhaWRpYWtlbnlhLm9yZy8nLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHsgc3JjOiAnL2ljb24tMTkyLnBuZycsIHNpemVzOiAnMTkyeDE5MicsIHR5cGU6ICdpbWFnZS9wbmcnIH0sXG4gICAgICAgICAgeyBzcmM6ICcvaWNvbi01MTIucG5nJywgc2l6ZXM6ICc1MTJ4NTEyJywgdHlwZTogJ2ltYWdlL3BuZycgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSlcbiAgXVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1csU0FBUyxvQkFBb0I7QUFDN1gsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixRQUFRO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixnQkFBZ0IsRUFBRSxnQkFBZ0IsT0FBVTtBQUFBLE1BQzVDLGNBQWM7QUFBQSxNQUNkLFVBQVU7QUFBQSxRQUNSLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxVQUNMLEVBQUUsS0FBSyxpQkFBaUIsT0FBTyxXQUFXLE1BQU0sWUFBWTtBQUFBLFVBQzVELEVBQUUsS0FBSyxpQkFBaUIsT0FBTyxXQUFXLE1BQU0sWUFBWTtBQUFBLFFBQzlEO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
