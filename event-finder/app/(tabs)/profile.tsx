import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useSession } from '@/context';
import { db, auth } from '@/lib/firebase-config';
import { ProfileData, useProfile } from '@/components/ProfileContext';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@/components/LocationContext';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail, updatePassword } from "firebase/auth";

const Profile: React.FC = () => {
    const { signOut } = useSession();
    const { profileData, setProfileData, saveProfile } = useProfile();
    const [loading, setLoading] = useState(true);
    const { city, state, latlong, refreshLocation } = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const router = useRouter();

    const uid = auth.currentUser?.uid;

    // Fetch user profile data from Firestore
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!uid) {
                console.warn("User not authenticated");
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(db, "users", uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data() as ProfileData;
                    setProfileData((prevData) => ({
                        ...prevData, 
                        ...userData,
                    }));
                } else {
                    setProfileData({
                        firstName: "Not available currently",
                        lastName: "Not available currently",
                        email: "Not available currently",
                        city: "Not available currently",
                        state: "Not available currently",
                        zipCode: "Not available currently",
                        preferences: [],
                        profilePic: "",
                        latlong: "",
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
    
    // Handle profile image picking
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

    // Handle refreshing location
    const handleRefreshLocation = async () => {
        try {
            await refreshLocation();  // This should update city, state, and latlong
        } catch (err) {
            Alert.alert("Error", "Unable to refresh location. Please try again.");
        }
    };

    // Handle saving profile
    const handleSaveProfile = async () => {
        setLoading(true);
        const success = await saveProfile();
        setLoading(false);

        if (success) {
            Alert.alert("Success", "Profile saved successfully.");
        } else {
            Alert.alert("Error", "Failed to save profile.");
        }
    };

    // Handle logout
    const handleLogout = async () => {
        await signOut();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading Profile Data...</Text>
            </View>
        );
    }

    const handlePasswordUpdate = async () => {
        try {
            if (auth.currentUser && auth.currentUser.email) {
                await sendPasswordResetEmail(auth, auth.currentUser.email);
                Alert.alert("Success", "Password update email sent. Please check your inbox. It may take 2-4 minutes to arrive.");
            } else {
                Alert.alert("Error", "No authenticated user found.");
            }
        } catch (err) {
            console.error('Error resetting password:', err);
            Alert.alert("Error", "Unable to reset password. Please log out, log back in to refresh your session, and then try again.");
        }
    };

    return (
        <ImageBackground source={require('../../assets/images/simple-background.jpg')} style={styles.bodyBackgroundImage}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
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
                        value={profileData.firstName}
                        placeholder="Enter first name"  
                        onChangeText={(text) =>
                            setProfileData((prevData) => ({
                                ...prevData,
                                firstName: text,
                            }))
                        }
                    />

                    <Text style={styles.infoLabel}>Last Name:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={profileData.lastName}
                        placeholder="Enter last name"
                        onChangeText={(text) =>
                            setProfileData((prevData) => ({
                                ...prevData,
                                lastName: text,
                            }))
                        }
                    />

                    <Text style={styles.infoLabel}>Email Address:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={profileData.email}
                        readOnly
                        placeholder="Enter a valid email address"
                    />

                    <TouchableOpacity
                        onPress={handleSaveProfile}
                        style={styles.saveButton}
                    >
                        <Text style={styles.saveButtonText}>Save Profile</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.infoLabel}>Request Password Reset</Text>
                    <View>
                        <TouchableOpacity
                            onPress={handlePasswordUpdate}
                            style={styles.saveButton}
                        >
                            <Text style={styles.saveButtonText}>Send Reset Email</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.infoHeader}>Preferences</Text>
                    <TouchableOpacity
                        style={styles.textInput}
                        onPress={() => router.push('/preferences')}
                    >
                        <Text>
                            {profileData.preferences?.join(', ') || 'Tap to set your preferences'}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.infoLabelSmall}>* Press on the preferences to edit them!</Text>

                    {/* Current Location Section */}
                    <Text style={styles.infoHeader}>Current Location</Text>
                    <TextInput
                        style={styles.textInput}
                        value={`${city}, ${state}`}
                        readOnly
                        placeholder='City, State'
                    />

                    <TouchableOpacity onPress={handleRefreshLocation} style={styles.refreshButton}>
                        <Text style={styles.refreshButtonText}>Refresh Location</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    bodyBackgroundImage: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 20,
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
    infoLabelSmall: {
        fontSize: 14,
        fontWeight: '300',
        marginVertical: 5,
        fontStyle: 'italic',

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
        alignItems: 'flex-start',
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
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#407a40',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    saveButtonText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Profile;
