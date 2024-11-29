import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import base64 from 'react-native-base64';
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from '@/lib/firebase-config';
import { useLocation } from './LocationContext';
import { Alert } from 'react-native';

export interface ProfileData {
    firstName: string;
    lastName: string;
    dob: string;
    phoneNumber: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    profilePic: string | null;
    manualLocation?: boolean;
    latlong?: string | null;
    preferences?: string[];
    [key: string]: any;
}

const ProfileContext = createContext<{
    profileData: ProfileData;
    setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
    saveProfile: () => Promise<void>
 } | undefined>(undefined);

// Photon API URL - free, opensource API to map city,state strings to latlong
const PHOTON_API_URL = 'https://photon.komoot.io/api/';

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Access location data from LocationProvider
    const { city, state, latlong } = useLocation();
    const [profileData, setProfileData] = useState<ProfileData>({
        firstName: 'Lotta B.',
        lastName: 'Essen',
        dob: '1990-01-01',
        phoneNumber: '+1 (123) 456-7890',
        email: 'john.doe@example.com',
        addressLine1: '123 Main Street',
        addressLine2: 'Apartment 4B',
        city: city,
        state: state,
        zipCode: '10001',
        country: 'USA',
        profilePic: null,
        manualLocation: true,
        latlong: latlong
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
        ]
        fieldsToDecode.forEach((field) => {
            if (decodedData[field]) {
                decodeFromBase64WithSpaces(decodedData[field]);
            }
        });
        return decodedData;
    }

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
        ]
        fieldsToEncode.forEach((field) => {
            if (encodedData[field]) {
                encodeToBase64WithSpaces(encodedData[field]);
            }
        });

        return encodedData;
    }

    const encodeToBase64WithSpaces = (text: any) => {
        const placeholder = "0SPACE0";
        const sanitizedText = text.replace(/ /g, placeholder).replace(/[^A-Za-z0-9]/g, "");
        return base64.encode(sanitizedText);
    };
    
    const decodeFromBase64WithSpaces = (encodedText: any) => {
    // Remove invalid base64 characters before decoding
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
                // decode first
                const decodedData = decodeProfileData(parsedData);
                setProfileData(decodedData); // Set the context state
            }
        };
    
        loadData(); // Call the load function on component mount
    }, []);

    // fetch latitude coordinates mapped to city,state
    const fetchLatLong = async (city: string, state: string) => {
        if (!city || !state) {
            console.warn('City or state is missing. Cannot fetch latlong.');
            return null;  // Return null if city or state are missing
        }
        
        try {
            const response = await axios.get(PHOTON_API_URL, {
                params: { q: `${city}, ${state}` }
            });

            const firstFeature = response.data.features[0];
            if (firstFeature && firstFeature.geometry && Array.isArray(firstFeature.geometry.coordinates)) {
                const [lon, lat] = firstFeature.geometry.coordinates;
                if (lat && lon) {
                    return `${lat},${lon}`;
                }
            }
            return null;
        } catch (error) {
            console.error('Error fetching geolocation:', error);
            return null;
        }
    };

    // Update latlong whenever city or state changes
    useEffect(() => {
        
        const updateLatLong = async () => {
            if (profileData.city && profileData.state) {
                const newLatLong = await fetchLatLong(profileData.city, profileData.state);
                if (newLatLong && newLatLong !== profileData.latlong) {
                    setProfileData((prevData) => ({ ...prevData, latlong: newLatLong }));
                }
            }
        };
        updateLatLong();
    }, [profileData.city, profileData.state]);

    const saveProfile = async () => {
        const encodedData = encodeProfileData(profileData);
        try {
            // Save to Firestore
            const uid = auth.currentUser?.uid;
            if (!uid) throw new Error('User not authenticated');
            const userDocRef = doc(db, 'users', uid);
            await updateDoc(userDocRef, encodedData);

            // Save to AsyncStorage
            await AsyncStorage.setItem('profileData', JSON.stringify(encodedData));
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    // Sync Firestore updates
    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const userDocRef = doc(db, 'users', uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const firebaseData = decodeProfileData(docSnapshot.data() as ProfileData);
                setProfileData((prevData) => ({ ...prevData, ...firebaseData }));
            }
        });
        return () => unsubscribe();
    }, []);
    

    return (
        <ProfileContext.Provider value={{ profileData, setProfileData, saveProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};