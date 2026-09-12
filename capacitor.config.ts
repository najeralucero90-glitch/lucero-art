import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.luceroart.tienda",
  appName: "Lucero Art",
  webDir: "dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
