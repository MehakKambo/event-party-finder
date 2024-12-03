import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase-config';

export interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    state: string;
    zipCode: string;
    preferences: string[];
    profilePic: string;
    dob?: string;
    phoneNumber?: string;
    addressLine1?: string;
    addressLine2?: string;
    country?: string;
    latlong?: string;
}

const ProfileContext = createContext<{
    profileData: ProfileData;
    setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
    saveProfile: () => Promise<boolean>;
} | undefined>(undefined);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profileData, setProfileData] = useState<ProfileData>({
        firstName: 'Lotta B.',
        lastName: 'Essen',
        dob: '1990-01-01',
        phoneNumber: '+1 (123) 456-7890',
        email: 'john.doe@example.com',
        addressLine1: '123 Main Street',
        addressLine2: 'Apartment 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        profilePic: '',
        latlong: '', 
        preferences: []
    });

    // Base64 Decoder helper
    const decodeProfileData = (data: ProfileData): ProfileData => {
        const decodedData: any = { ...data };
        const fieldsToDecode = [
            'email',
            'addressLine1',
            'addressLine2',
            'city',
            'state',
            'zipCode',
            'country'
        ];
        fieldsToDecode.forEach((field) => {
            if (decodedData[field]) {
                decodeFromBase64WithSpaces(decodedData[field]);
            }
        });
        return decodedData;
    };

    // Base64 Encoder helper
    const encodeProfileData = (data: ProfileData): ProfileData => {
        const encodedData: any = { ...data };
        const fieldsToEncode = [
            'email',
            'addressLine1',
            'addressLine2',
            'city',
            'state',
            'zipCode',
            'country'
        ];
        fieldsToEncode.forEach((field) => {
            if (encodedData[field]) {
                encodeToBase64WithSpaces(encodedData[field]);
            }
        });

        return encodedData;
    };

    const encodeToBase64WithSpaces = (text: any) => {
        const placeholder = "0SPACE0";
        const sanitizedText = text.replace(/ /g, placeholder).replace(/[^A-Za-z0-9]/g, "");
        return base64.encode(sanitizedText);
    };

    const decodeFromBase64WithSpaces = (encodedText: any) => {
        const cleanedText = encodedText.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        const decodedText = base64.decode(cleanedText);
        return decodedText.replace(/0SPACE0/g, " ");
    };

    // Load the profile data from AsyncStorage on initial load
    useEffect(() => {
        const loadData = async () => {
            const savedData = await AsyncStorage.getItem('profileData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                const decodedData = decodeProfileData(parsedData);
                setProfileData(decodedData); // Set the context state
            }
        };

        loadData(); // Call the load function on component mount
    }, []);

    // Save profile data to Firebase Firestore and AsyncStorage
    const saveProfile = async (): Promise<boolean> => {
        const encodedData: any = encodeProfileData(profileData);
        try {
            const { latlong, city, state } = profileData; // Use latlong from profile data

            // Ensure latlong exists before saving
            if (latlong) {
                // Save to Firebase Firestore under the user's document (by UID)
                const userDocRef = doc(db, 'users', auth.currentUser?.uid || 'defaultUserId');
                await setDoc(userDocRef, {
                    ...encodedData, // Include all profile data
                    latlong: latlong,  // Add latlong to the profile
                    city: city,        // Make sure city and state are also included
                    state: state,
                    updatedAt: new Date(), // Timestamp when saving the profile
                });

                console.log('Profile saved successfully to Firestore');
            } else {
                console.warn('Latlong is missing, profile will not be saved with latlong.');
            }

            // Save the profile data locally in AsyncStorage
            await AsyncStorage.setItem('profileData', JSON.stringify(encodedData));
            console.log('Profile saved successfully to AsyncStorage');
            
            return true;
        } catch (error) {
            console.error('Error saving profile:', error);
            return false;
        }
    };

    return (
        <ProfileContext.Provider value={{ profileData, setProfileData, saveProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};
