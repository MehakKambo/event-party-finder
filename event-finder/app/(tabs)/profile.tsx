import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useSession } from '@/context';
import { db, auth } from '@/lib/firebase-config';
import { ProfileData, useProfile } from '@/components/ProfileContext';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile: React.FC = () => {
    const { signOut } = useSession();
    const { profileData, setProfileData } = useProfile();
    const [loading, setLoading] = useState(true);
    const [fetchedProfile, setFetchedProfile] = useState<any>(null);
    const [manualLocation, setManualLocation] = useState(false);
    const router = useRouter();

    const uid = auth.currentUser?.uid;

    // Fetch user profile data from Firestore
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!uid) {
                console.warn("User not authenticated");
                setLoading(false);
                return <Redirect href="../sign-in" />;
            }
            try {
                // Directly fetch the user's document by their uid
                const userDocRef = doc(db, "users", uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setFetchedProfile(userDoc.data());
                    const data = userDoc.data() as ProfileData;
                    setProfileData(data);
                } else {
                    console.warn("User profile not found");
                    setFetchedProfile({
                        firstName: "Not available currently",
                        lastName: "Not available currently",
                        email: "Not available currently",
                        city: "Not available currently",
                        state: "Not available currently",
                        zipCode: "Not available currently",
                        preferences: [],
                    });
                }
            } catch (err) {
                console.error('Error fetching profile data:', err);
                Alert.alert("Error", "Unable to fetch profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [uid]);

    const handleLogout = async () => {
        await signOut();
    };

    // Save profile data to Firestore
    const saveProfile = async () => {
        if (!uid) {
            Alert.alert("Error", "User not authenticated.");
            return;
        }

        try {
            const userDocRef = doc(db, "users", uid);
            await updateDoc(userDocRef, profileData);
            const updatedDoc = await getDoc(userDocRef);

            if (updatedDoc.exists()) {
                setProfileData(updatedDoc.data() as ProfileData);
            }
            Alert.alert("Success", "Profile saved successfully.");
        } catch (err) {
            console.error("Error saving profile:", err);
            Alert.alert("Error", "Failed to save profile.");
        }
    };

    // Pick an image from the device's gallery
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Permission to access media library is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets?.length > 0) {
            const selectedImage = result.assets[0].uri;
            setProfileData((prevData) => ({
                ...prevData,
                profilePic: selectedImage,
            }));
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading Profile Data...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Profile Picture */}
                <View style={styles.profilePicContainer}>
                    <Image
                        source={
                            profileData.profilePic
                                ? { uri: profileData.profilePic }
                                : require('../../assets/images/profile.png')
                        }
                        style={styles.profilePic}
                    />
                    <TouchableOpacity onPress={pickImage}>
                        <Text style={styles.changeLink}>Change</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveButton} onPress={handleLogout}>
                        <Text style={styles.saveButtonText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Information */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoHeader}>Personal Information</Text>

                    <Text style={styles.infoLabel}>First Name:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={fetchedProfile?.firstName || "Not available currently"}
                    />

                    <Text style={styles.infoLabel}>Last Name:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={fetchedProfile?.lastName || "Not available currently"}
                    />

                    <Text style={styles.infoLabel}>Email Address:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={fetchedProfile?.email || "Not available currently"}
                    />

                    <Text style={styles.infoHeader}>Preferences</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/preferences')} // Navigate to preferences selection page
                    >
                        <Text style={styles.textInput}>
                            {fetchedProfile?.preferences?.join(', ') || "Not available currently"}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.infoHeader}>Location</Text>
                    <View style={styles.switchContainer}>
                        <Text>Enter Location Manually?</Text>
                        <Switch
                            value={manualLocation}
                            onValueChange={setManualLocation}
                        />
                    </View>

                    {manualLocation && (
                        <>
                            <Text style={styles.infoLabel}>City:</Text>
                            <TextInput
                                style={styles.textInput}
                                value={profileData.city || ""}
                                onChangeText={(text) => setProfileData((prev) => ({ ...prev, city: text }))}
                            />

                            <Text style={styles.infoLabel}>State:</Text>
                            <TextInput
                                style={styles.textInput}
                                value={profileData.state || ""}
                                onChangeText={(text) => setProfileData((prev) => ({ ...prev, state: text }))}
                            />

                            <Text style={styles.infoLabel}>Zip Code:</Text>
                            <TextInput
                                style={styles.textInput}
                                value={profileData.zipCode || ""}
                                onChangeText={(text) => setProfileData((prev) => ({ ...prev, zipCode: text }))}
                            />
                        </>
                    )}
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={() => saveProfile()}>
                    <Text style={styles.saveButtonText}>Save Profile</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    profilePicContainer: {
        alignItems: 'center',
    },
    profilePic: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    changeLink: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    infoContainer: {
        width: '100%',
        paddingHorizontal: 10,
    },
    infoHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 5,
    },
    textInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    saveButton: {
        marginVertical: 20,
        width: 370,
        backgroundColor: '#007AFF',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
    },
});

export default Profile;

// Function to fetch profile data
export const fetchProfileData = async (uid: string) => {
    if (!uid) {
        console.warn("User not authenticated");
        return null;
    }

    try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data() as ProfileData;
            return data;
        } else {
            console.warn("User profile not found");
            return null;
        }
    } catch (err) {
        console.error('Error fetching profile data:', err);
        return null;
    }
};