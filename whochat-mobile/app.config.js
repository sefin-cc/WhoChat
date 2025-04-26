// app.config.js
import 'dotenv/config'; 

export default {
  expo: {
    name: "WhoChat",
    slug: "whochat-mobile",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#660000",
      },
      splash: {
        image: "./assets/images/icon.png",
        resizeMode: "contain",
        backgroundColor: "#660000",
      },
      package: "com.rsgt.whochat"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font"
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      BACKEND_URL: process.env.BACKEND_URL, 
      PUSHER_APP_KEY: process.env.PUSHER_APP_KEY, 
      PUSHER_APP_CLUSTER: process.env.PUSHER_APP_CLUSTER, 
      eas: {
        projectId: "84a0139e-6fd6-46b3-bc2b-bdf6d642d834"
      }
    },
  },
};
