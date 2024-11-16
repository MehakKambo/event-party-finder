---

# Event Finder App – Development Plan

## Overview
Allow users to discover events near their location based on their preferences, use Firebase Authentication for user management, Firestore for data storage, and the Ticketmaster Discovery API to fetch event data.

## Screens and Key Features

### 1. **User Authentication Screen**
   - **Objective**: Enable users to create an account or log in.
   - **Features**:
      - **Sign Up / Login with Firebase Auth**: Allow users to sign up or log in with their email and password using Firebase Authentication.
      - **Form Validation**: Ensure valid email formats and password criteria, with error messages for incorrect inputs.
      - **State Management**: Use Firebase's `onAuthStateChanged` to maintain user authentication state across the app.

### 2. **Location Setup Screen**
   - **Objective**: Gather the user’s location data for event recommendations.
   - **Features**:
      - **Location Permission Request**: Prompt users to allow location access on their device.
      - **Manual Location Entry**: If location access is denied, allow users to manually enter a ZIP code.
      - **Data Storage**: Store the location data (either GPS or ZIP code) in Firestore associated with the user's profile.

### 3. **Preferences Screen**
   - **Objective**: Collect user preferences to personalize event recommendations.
   - **Features**:
      - **Event Category Selection**: Allow users to select preferences for event types (e.g., concerts, sports, theater).
      - **Data Storage**: Save user preferences to Firestore under the user’s profile.
      - **Customization**: Allow users to update their preferences later via the Profile screen.
      - **UI Considerations**: Use multi-select checkboxes or buttons for an intuitive selection process.

### 4. **Home Screen / Recommended Events Tab**
   - **Objective**: Display recommended events based on user preferences and location.
   - **Features**:
      - **Event Recommendations**: Use the Ticketmaster Discovery API to fetch events near the user’s location, filtered by their preferences.
      - **Location Update Option**: Allow users to update their location on this screen.
      - **Event Cards**: Show event details (title, date, location, image) in a card format for easy browsing.
      - **Like/Save Option**: Enable users to like or save events to view later in the "My Events" tab.
      - **State Management**: Cache event data locally to reduce API calls and enhance loading times.

### 5. **My Events Tab**
   - **Objective**: Provide users with a way to view their liked/saved events.
   - **Features**:
      - **Saved Events List**: Display events the user has liked or saved from the Home screen/ Search Events screen.
      - **Data Retrieval**: Pull saved events from Firestore, where they are stored under the user’s profile.
      - **Event Details Access**: Allow users to tap on each saved event to view more information or purchase tickets (using Ticketmaster links).
      - **Remove Saved Events**: Allow users to remove events from their saved list.

### 6. **Search Events Screen**
   - **Objective**: Allow users to search for specific events by keywords or filters.
   - **Features**:
      - **Search Bar**: Implement a search bar where users can enter keywords.
      - **Filter Options**: Add filters such as event type, date, location etc to refine the search.
      - **API Integration**: Use the Ticketmaster API to fetch search results based on user input and filters.
      - **Results Display**: Show search results in a scrollable list, similar to the layout of the Home screen.

### 7. **Profile Screen**
   - **Objective**: Display and allow editing of user information.
   - **Features**:
      - **User Info Display**: Show editable information like profile picture, email, and preferences.
      - **Profile Picture**: Allow users to upload or update their profile picture, stored in Firebase Storage.
      - **Edit Preferences**: Provide access to update event preferences (redirecting to the Preferences screen if needed).
      - **Logout Button**: Add a logout option that clears user data from the local state and Firebase.

---

