# Project Setup Guide
---

## Environment Variables
The project requires the following environment variables to be set up in a `.env` file in the root directory.

### Required Variables
```plaintext
EXPO_PUBLIC_TICKETMASTER_API_KEY=YOUR_TICKETMASTER_DISCOVERY_API_KEY
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
EXPO_PUBLIC_APP_NAME=Eventify
EXPO_PUBLIC_GEO_API_KEY=YOUR_GEOAPIFY_API_KEY
```

## Instructions to Obtain Keys

### Ticketmaster API Key
1. Visit the [Ticketmaster Developer Portal](https://developer.ticketmaster.com/).
2. Sign up or log in to create a new app.
3. Retrieve your **Ticketmaster Discovery API Key** and set it as `EXPO_PUBLIC_TICKETMASTER_API_KEY`.

---

### Firebase Configuration
1. Visit the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project or use an existing one.
3. Go to **Project Settings** and find your app's configuration under the **General** tab.
4. Retrieve the following details:
   - **API Key**: Set as `EXPO_PUBLIC_FIREBASE_API_KEY`.
   - **Auth Domain**: Set as `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`.
   - **Project ID**: Set as `EXPO_PUBLIC_FIREBASE_PROJECT_ID`.
   - **Storage Bucket**: Set as `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`.
   - **Messaging Sender ID**: Set as `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`.
   - **App ID**: Set as `EXPO_PUBLIC_FIREBASE_APP_ID`.

---

### Geoapify API Key
1. Visit the [Geoapify Developer Portal](https://www.geoapify.com/).
2. Sign up or log in to generate an API key.
3. Set this key as `EXPO_PUBLIC_GEO_API_KEY`.

--- 

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
