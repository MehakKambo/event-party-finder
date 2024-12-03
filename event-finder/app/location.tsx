import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useSession } from "@/context";
import { useLocation } from "@/components/LocationContext";
import { db } from "@/lib/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { router } from "expo-router";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/Ionicons";

export default function LocationSetup() {
  // ============================================================================
  // Hooks & State
  // ============================================================================
  const { latlong, city, state, setLocation } = useLocation();
  const { user } = useSession();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  // const [city, setCity] = useState("");
  // const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  // const [latlong, setLatLong] = useState<string | null>(null);
  const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEO_API_KEY;
  const UNKNOWN_CITY = "Unknown City";
  const UNKNOWN_STATE = "Unknown State";
  const UNKNOWN_ZIP = "Unknown ZIP";

  // ============================================================================
  // Effects
  // ============================================================================
  // Fetch user's location from device coordinates
  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const locationData = await Location.getCurrentPositionAsync({});
        const lat = locationData.coords.latitude;
        const lon = locationData.coords.longitude;
        // setLatLong(`${lat},${lon}`);
        setLocation({ latlong: `${lat},${lon}` });
        fetchLocationFromLatLong(lat, lon);
      }
    };
    requestLocationPermission();
  }, []);

  // ============================================================================
  // Handlers
  // ============================================================================

  // Fetch city and state from latitude and longitude when location is set from device
  const fetchLocationFromLatLong = async (lat: number, lon: number) => {
    const apiURL = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`;
    try {
      const response = await fetch(apiURL);
      if (!response.ok) throw new Error("Invalid coordinates");
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const place = data.features[0].properties;
        // setCity(place.city || UNKNOWN_CITY);
        // setState(place.state || UNKNOWN_STATE);
        setZipCode(place.postcode || UNKNOWN_ZIP);
        setLocation({
          city: place.city || "Unknown City",
          state: place.state || "Unknown State",
          zipCode: place.postcode || "Unknown ZIP",
        });
        Alert.alert("Success", `Location set to: ${place.city}, ${place.state}`);
      } else throw new Error("No valid data found.");
    } catch (err) {
      console.error("Error fetching location from coordinates:", err);
      Alert.alert("Error", "Failed to fetch location. Please try again.");
    }
  };

  // Fetch location suggestions from when the user types input
  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const apiURL = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        text
      )}&format=json&filter=countrycode:us&apiKey=${GEOAPIFY_API_KEY}`;
      const response = await fetch(apiURL);
      const data = await response.json();
      setSuggestions(data.results || []);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  // Set the selected suggestion as the user's location
  const onSelectSuggestion = (item: any) => {
    setQuery(item.formatted);
    setSuggestions([]);
    // setLatLong(`${item.lat},${item.lon}`);
    // setCity(item.city || UNKNOWN_CITY);
    // setState(item.state || UNKNOWN_STATE);
    setZipCode(item.postcode || UNKNOWN_ZIP);
    setLocation({
      city: item.city || "Unknown City",
      state: item.state || "Unknown State",
      zipCode: item.postcode || "Unknown ZIP",
    });
    Keyboard.dismiss();
  };

  // Save the user's location to Firestore
  const saveLocation = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }
    if (!latlong) {
      Alert.alert("Error", "Location is not set. Please provide a valid location.");
      return;
    }
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { latlong, city, state, zipCode });
      Alert.alert("Success", "Location saved successfully.");
      router.replace("/preferences");
    } catch (err) {
      console.error("Error saving location:", err);
      Alert.alert("Error", "Failed to save location.");
    }
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Let's Set Your Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city, state, or ZIP code"
          value={query}
          onChangeText={(text) => fetchSuggestions(text)}
        />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item: { place_id: string }) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => onSelectSuggestion(item)}
              >
                {/* Ignore this error for now!! */}
                <Text style={styles.suggestionText}>{item.formatted}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.suggestionsContainer}
          />
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Saved Location</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="location-outline" size={20} color="#007AFF" style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>{city}, {state}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={saveLocation}>
          <Text style={styles.saveButtonText}>Continue Setup</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    marginTop: 70,
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  suggestionsContainer: {
    maxHeight: 220,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: 'scroll',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  suggestionText: {
    fontSize: 16,
    color: "#555",
  },
  infoContainer: {
    backgroundColor: "#eef5ff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007AFF",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#444",
  },
  label: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});