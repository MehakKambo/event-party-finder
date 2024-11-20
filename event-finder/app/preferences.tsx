import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { useSession } from "@/context";
import { db } from "@/lib/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { Redirect, router } from "expo-router";
import { predefinedKeywords } from "@/constants/keywords";

export default function Preferences() {
  // ============================================================================
  // Hooks & State
  // ============================================================================
  const { user } = useSession();
  const [location, setLocation] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prevKeywords) =>
      prevKeywords.includes(keyword)
        ? prevKeywords.filter((k) => k !== keyword)
        : [...prevKeywords, keyword]
    );
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      return;
    }
    const locationData = await Location.getCurrentPositionAsync({});
    const latlong = `${locationData.coords.latitude},${locationData.coords.longitude}`;
    setLocation(latlong);
  };

  const savePreferences = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated.");
      return <Redirect href="/sign-in" />;
    }

    if (!location) {
      Alert.alert("Error", "Location is not set. Please allow location access.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        preferences: selectedKeywords,
        latlong: location,
      });
      Alert.alert("Success", "Preferences saved successfully.");
      router.replace({ pathname: "/(tabs)/home" });
    } catch (err) {
      console.error("Error saving preferences:", err);
      Alert.alert("Error", "Failed to save preferences.");
    }
  };

  const renderKeywordCategory = ({ item }: { item: any }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.category}</Text>
      <FlatList
        data={item.keywords}
        keyExtractor={(keyword) => keyword}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.keywordButton,
              selectedKeywords.includes(item) && styles.keywordSelected,
            ]}
            onPress={() => toggleKeyword(item)}
          >
            <Text
              style={[
                styles.keywordText,
                selectedKeywords.includes(item) && styles.keywordSelectedText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.section}>
          <Text style={styles.title}>Set Your Location</Text>
          <Text>Current Location: {location ? location : "Not Available"}</Text>
          <TouchableOpacity style={styles.button} onPress={requestLocationPermission}>
            <Text style={styles.buttonText}>Get Location</Text>
          </TouchableOpacity>

          <Text style={styles.title2}>Select Your Preferences</Text>
          <Text>Choose the keywords that best describe your interests:</Text>
          <Text style={styles.subtitle}>
            (You will be able to add custom keywords later under profile settings.)
          </Text>
        </View>
      }
      data={predefinedKeywords}
      keyExtractor={(item) => item.category}
      renderItem={renderKeywordCategory}
      ListFooterComponent={
        <TouchableOpacity style={styles.saveButton} onPress={savePreferences}>
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </TouchableOpacity>
      }
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 70,
    backgroundColor: "#f9f9f9",
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title2: {
    fontSize: 18,
    paddingTop: 25,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
    color: "#555",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  keywordButton: {
    flex: 1,
    margin: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  keywordSelected: {
    backgroundColor: "#007AFF",
  },
  keywordText: {
    color: "#007AFF",
  },
  keywordSelectedText: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});