import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { useSession } from '@/context';
import { db, auth } from '@/lib/firebase-config';
import { useProfile } from '@/components/ProfileContext';
import * as ImagePicker from 'expo-image-picker';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@/components/LocationContext';

const Profile: React.FC = () => {
    const { signOut } = useSession();
    const { profileData, setProfileData, saveProfile } = useProfile();
    const [loading, setLoading] = useState(true);
    const [fetchedProfile, setFetchedProfile] = useState<any>(null);
    const { city, state, latlong, refreshLocation } = useLocation();

    const uid = auth.currentUser?.uid;

    const handleRefresh = async () => {
        try {
          await refreshLocation();
        } catch (err) {
          Alert.alert("Error", "Unable to refresh location. Please try again.");
        }
      };

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

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
                        editable={false}
                    />

                    <Text style={styles.infoLabel}>Last Name:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={fetchedProfile?.lastName || "Not available currently"}
                        editable={false}
                    />

                    <Text style={styles.infoLabel}>Email Address:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={fetchedProfile?.email || "Not available currently"}
                        editable={false}
                    />

                    <Text style={styles.infoHeader}>Preferences</Text>
                    <TextInput
                        style={styles.textInput}
                        value={fetchedProfile?.preferences?.join(', ') || "Not available currently"}
                        editable={false}
                    />

                    {/* Current Location Section */}
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationHeader}>Current Location</Text>
                        <Text style={styles.locationText}>{city}, {state}</Text>
                    </View>

                    <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                        <Text style={styles.refreshButtonText}>Refresh Location</Text>
                    </TouchableOpacity>

                    <Text style={styles.infoLabel}>Zip Code:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={fetchedProfile?.zipCode || "Not available currently"}
                        editable={false}
                    />

                    {/* Save Profile Button */}
                    <TouchableOpacity onPress={saveProfile} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save Profile</Text>
                    </TouchableOpacity>
                </View>
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
    locationContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    locationHeader: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    locationText: {
        fontSize: 16,
        marginTop: 5,
    },
    logoutButton: {
        width: 175,
        backgroundColor: '#ff0a07',
        padding: 10,
        margin: 20,
        borderRadius: 5,
    },
    refreshButton: {
        backgroundColor: '#407a40',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
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
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Profile;
