import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { useProfile } from '@/components/ProfileContext';


const Profile: React.FC = () => {
    const { profileData, setProfileData }= useProfile();
    const [city, setCity] = useState(profileData.city);
    const [state, setState] = useState(profileData.state);

    useEffect(() => {
        const loadData = async ()=> {
            try {
                const savedData = await AsyncStorage.getItem('profileData');
                if (savedData) setProfileData(JSON.parse(savedData));
            } catch (err) {
                console.error('Error loading profile data', err);
            }
        };
        loadData();
      }, 
    []);

    const handleSave = async () => {
        try {
            await AsyncStorage.setItem('profileData', JSON.stringify(profileData)); 
            setProfileData(profileData); 
            Alert.alert(
                "Success!", 
                "Your profile has been saved successfully.", 
                [
                    { text: "OK", onPress: () => console.log("Profile saved confirmed") }
                ]
            );
        } catch (err) {
            console.error('Error saving profile data', err);
            Alert.alert(
                "Error", 
                "There was a problem saving your profile. Please try again.",
                [
                    { text: "OK", onPress: () => console.log("Error alert dismissed") }
                ]
            );
        }
    };

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
            profilePic: selectedImage, // Update profile picture in context
          }));
        }
    };

    const handleInputChange = (key: any, value: any) => {
        setProfileData((prevData) => ({
          ...prevData,
          [key]: value,
        }));
      };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Profile Picture */}
            <View style={styles.profilePicContainer}>
                <Image
                    source={profileData.profilePic ? { uri: profileData.profilePic } : require('../../assets/images/profile.png')}
                    style={styles.profilePic}
                />
                <TouchableOpacity onPress={pickImage}>
                    <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Information */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoHeader}>Personal Information</Text>

                <Text style={styles.infoLabel}>First Name:</Text>
                <TextInput 
                    style={styles.textInput} 
                    value={profileData.firstName} 
                    onChangeText={(value) => handleInputChange('firstName', value)}
                />

                <Text style={styles.infoLabel}>Last Name:</Text>
                <TextInput 
                    style={styles.textInput} 
                    value={profileData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                />

                <Text style={styles.infoLabel}>Date of Birth:</Text>
                <TextInput 
                    style={styles.textInput} 
                    value={profileData.dob} 
                    onChangeText={(value) => handleInputChange('dob', value)}
                />

                <Text style={styles.infoLabel}>Phone Number:</Text>
                <TextInput 
                    style={styles.textInput} 
                    value={profileData.phoneNumber}
                    onChangeText={(value) => handleInputChange('phoneNumber', value)}
                />

                <Text style={styles.infoLabel}>Email Address:</Text>
                <TextInput 
                    style={styles.textInput}
                    value={profileData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                />

                <Text style={styles.infoHeader}>Address Information</Text>

                <Text style={styles.infoLabel}>Address Line 1:</Text>
                <TextInput
                    style={styles.textInput}
                    value={profileData.addressLine1}
                    onChangeText={(value) => handleInputChange('addressLine1', value)}
                />

                <Text style={styles.infoLabel}>Address Line 2 (Optional):</Text>
                <TextInput
                    style={styles.textInput}
                    value={profileData.addressLine2}
                    onChangeText={(value) => handleInputChange('addressLine2', value)}
                />

                <Text style={styles.infoLabel}>City:</Text>
                <TextInput
                    style={styles.textInput}
                    value={profileData.city}
                    onChangeText={(value) => handleInputChange('city', value)}
                />

                <Text style={styles.infoLabel}>State:</Text>
                <TextInput
                    style={styles.textInput}
                    value={profileData.state}
                    onChangeText={(value) => handleInputChange('state', value)}
                />

                <Text style={styles.infoLabel}>Zip Code:</Text>
                <TextInput
                    style={styles.textInput}
                    value={profileData.zipCode}
                    onChangeText={(value) => handleInputChange('zipCode', value)}
                />

                <Text style={styles.infoLabel}>Country:</Text>
                <TextInput
                    style={styles.textInput}
                    value={profileData.country}
                    onChangeText={(value) => handleInputChange('country', value)}
                />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#f9f9f9',
    },
    profilePicContainer: {
        marginVertical: 20,
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
        backgroundColor: '#007AFF',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Profile;
