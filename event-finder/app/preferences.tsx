import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useSession } from "@/context";
import { db } from "@/lib/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Redirect, router } from "expo-router";
import { predefinedKeywords } from "@/constants/keywords";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Preferences() {
  // ============================================================================
  // Constants
  // ============================================================================
  const PREFERENCES_LIMIT = 8; // Maximum number of preferences a user can select

  // ============================================================================
  // Hooks & State
  // ============================================================================
  const { user } = useSession();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // ============================================================================
  // Handlers
  // ============================================================================
  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      // Remove the keyword if already selected
      setSelectedKeywords((prevKeywords) =>
        prevKeywords.filter((k) => k !== keyword)
      );
    } else if (selectedKeywords.length < PREFERENCES_LIMIT) {
      // Add the keyword if the limit is not exceeded
      setSelectedKeywords((prevKeywords) => [...prevKeywords, keyword]);
    } else {
      // Notify the user when the limit is reached
      Alert.alert(
        "Limit Reached",
        `You can select a maximum of ${PREFERENCES_LIMIT} preferences.`
      );
    }
  };

  const savePreferences = async () => {
    if (selectedKeywords.length === 0) {
      Alert.alert("Error", "Please select at least one preference.");
      return;
    }
    
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated. Sign in to save preferences.");
      return <Redirect href="/sign-in" />;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      // Fetch existing user preferences to determine if this is the first setup
      const userDoc = await getDoc(userDocRef);
      const isFirstTimeSetup = !userDoc.exists() || !userDoc.data()?.preferences?.length;

      await updateDoc(userDocRef, {
        preferences: selectedKeywords,
      });
      Alert.alert("Success", "Preferences saved successfully.");

    // Redirect based on whether it's the first time
    if (isFirstTimeSetup) {
      router.replace({ pathname: "/(tabs)/home" });
    } else {
      router.replace({ pathname: "/(tabs)/profile" }); 
    }
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.section}>
            <Text style={styles.title}>Set Event Preferences</Text>
            <Text style={styles.title2}>Choose the keywords that best describe your interests:</Text>
            <Text style={styles.subtitle}>
              (You can select up to {PREFERENCES_LIMIT} preferences)
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
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