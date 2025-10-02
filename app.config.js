export default {
  expo: {
    name: "Popcorn Play",
    slug: "popcorn_play",
    owner: "pokemon_070",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo_1.png",
    scheme: "movies",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/logo_1.png",
      resizeMode: "contain",
      backgroundColor: "#111"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo_1.png",
        backgroundColor: "#111"
      },
      edgeToEdgeEnabled: true,
      package: "com.laluyadav.movie_app"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/logo_1.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo_1.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#111"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "53c279cf-08a1-410c-9912-1e2cedfce6f6"
      },
      expoPublicMovieApiKey: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
      expoPublicAppwriteProjectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
      expoPublicAppwriteEndpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
      expoPublicAppwriteDatabaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      expoPublicAppwriteCollectionIdTrending: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID_TRENDING,
      expoPublicAppwriteCollectionIdSaved: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID_SAVED
    }
  }
};