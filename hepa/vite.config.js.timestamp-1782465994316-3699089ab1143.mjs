// vite.config.js
import { defineConfig } from "file:///sessions/clever-wizardly-pasteur/mnt/femsaidiakenya/hepa/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/clever-wizardly-pasteur/mnt/femsaidiakenya/hepa/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///sessions/clever-wizardly-pasteur/mnt/femsaidiakenya/hepa/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icon-192.png", "icon-512.png"],
      manifest: {
        id: "hepa-calculator",
        name: "Calculator",
        short_name: "Calculator",
        description: "Calculator",
        theme_color: "#1C1C1E",
        background_color: "#1C1C1E",
        display: "standalone",
        orientation: "portrait",
        start_url: "https://hepa.femsaidiakenya.org/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-cache" }
          }
        ]
      }
    })
  ],
  base: "/",
  build: { outDir: "dist" }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvY2xldmVyLXdpemFyZGx5LXBhc3RldXIvbW50L2ZlbXNhaWRpYWtlbnlhL2hlcGFcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9zZXNzaW9ucy9jbGV2ZXItd2l6YXJkbHktcGFzdGV1ci9tbnQvZmVtc2FpZGlha2VueWEvaGVwYS92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMvY2xldmVyLXdpemFyZGx5LXBhc3RldXIvbW50L2ZlbXNhaWRpYWtlbnlhL2hlcGEvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nLCAnaWNvbi0xOTIucG5nJywgJ2ljb24tNTEyLnBuZyddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgaWQ6ICdoZXBhLWNhbGN1bGF0b3InLFxuICAgICAgICBuYW1lOiAnQ2FsY3VsYXRvcicsXG4gICAgICAgIHNob3J0X25hbWU6ICdDYWxjdWxhdG9yJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDYWxjdWxhdG9yJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMUMxQzFFJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMxQzFDMUUnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxuICAgICAgICBzdGFydF91cmw6ICdodHRwczovL2hlcGEuZmVtc2FpZGlha2VueWEub3JnLycsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAgeyBzcmM6ICdpY29uLTE5Mi5wbmcnLCBzaXplczogJzE5MngxOTInLCB0eXBlOiAnaW1hZ2UvcG5nJyB9LFxuICAgICAgICAgIHsgc3JjOiAnaWNvbi01MTIucG5nJywgc2l6ZXM6ICc1MTJ4NTEyJywgdHlwZTogJ2ltYWdlL3BuZycgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICB3b3JrYm94OiB7XG4gICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Zyx3b2ZmMn0nXSxcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ29vZ2xlYXBpc1xcLmNvbVxcLy4qL2ksXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7IGNhY2hlTmFtZTogJ2dvb2dsZS1mb250cy1jYWNoZScgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgYmFzZTogJy8nLFxuICBidWlsZDogeyBvdXREaXI6ICdkaXN0JyB9LFxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQTZWLFNBQVMsb0JBQW9CO0FBQzFYLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsZUFBZSxDQUFDLGVBQWUsZ0JBQWdCLGNBQWM7QUFBQSxNQUM3RCxVQUFVO0FBQUEsUUFDUixJQUFJO0FBQUEsUUFDSixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsVUFDTCxFQUFFLEtBQUssZ0JBQWdCLE9BQU8sV0FBVyxNQUFNLFlBQVk7QUFBQSxVQUMzRCxFQUFFLEtBQUssZ0JBQWdCLE9BQU8sV0FBVyxNQUFNLFlBQVk7QUFBQSxRQUM3RDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLGNBQWMsQ0FBQyxzQ0FBc0M7QUFBQSxRQUNyRCxnQkFBZ0I7QUFBQSxVQUNkO0FBQUEsWUFDRSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTLEVBQUUsV0FBVyxxQkFBcUI7QUFBQSxVQUM3QztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsTUFBTTtBQUFBLEVBQ04sT0FBTyxFQUFFLFFBQVEsT0FBTztBQUMxQixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
