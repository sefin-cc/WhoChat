// app.config.js
import 'dotenv/config'; // 👈 allows you to load environment variables

export default {
  expo: {
    name: "whochat-mobile",
    slug: "whochat-mobile",
    version: "1.0.0",
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
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      BACKEND_URL: process.env.BACKEND_URL, 
      PUSHER_APP_KEY: process.env.PUSHER_APP_KEY, 
      PUSHER_APP_CLUSTER: process.env.PUSHER_APP_CLUSTER, 
    },
  },
};
