module.exports = {
  expo: {
    name: "Jàngu Bi",
    slug: "samaquete-rn",
    version: "1.0.1",
    orientation: "portrait",
    // Utiliser l'icône "église" (on pointe sur l'adaptive icon existante)
    icon: "./assets/adaptive-icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#f59e0b"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "numerisen.quete",
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              "jangui-bi"
            ]
          }
        ]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#f59e0b"
      },
      package: "numerisen.quete"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    scheme: "jangui-bi",
    plugins: [
      "expo-font",
      "expo-splash-screen",
      "expo-web-browser"
    ],
    description: "Jàngu Bi : l'Église, partout avec toi - Application mobile pour la communauté catholique du Sénégal",
    extra: {
      eas: {
        projectId: "84322a0c-9059-478b-9f22-175232da4ba3"
      }
    },
    owner: "sossane99"
  }
};

