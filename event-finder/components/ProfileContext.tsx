import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import base64 from 'react-native-base64';

interface ProfileData {
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
    latlong?: string
}

const ProfileContext = createContext<{
    profileData: ProfileData;
    setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
    fetchLatLong: (city: string, state: string) => void;
    saveProfile: () => Promise<void>
 } | undefined>(undefined);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

// Photon API URL - free, opensource API to map city,state strings to latlong
const PHOTON_API_URL = 'https://photon.komoot.io/api/';

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
        profilePic: null
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

    // save and fetch latlong
    const saveProfile = async () => {
        const encodedData: any = encodeProfileData(profileData);
        try {
            // Ensure latlong exists before saving profile
            if (encodedData.latlong) {
                await AsyncStorage.setItem('profileData', JSON.stringify(encodedData));
                return;
            }

            if (encodedData.city && encodedData.state) {
                const latlong = await fetchLatLong(encodedData.city, encodedData.state);

                if (latlong) {
                    setProfileData((prevData) => ({ ...prevData, latlong }));
                    await AsyncStorage.setItem('profileData', JSON.stringify({ ...encodedData, latlong }));
                } else {
                    console.warn('Failed to fetch latlong, profile will be saved without it.');
                    await AsyncStorage.setItem('profileData', JSON.stringify(encodedData));  // Save without latlong
                }
            } else {
                console.warn('City or state is missing. Cannot fetch or save latlong.');
                await AsyncStorage.setItem('profileData', JSON.stringify(encodedData));  // Save without latlong
            }
        } catch (error) {
            console.error('Error saving profile data:', error);
        }
    };

    // Track changes in city or state to update latlong
    useEffect(() => {
        const updateLatLong = async () => {
            await saveProfile(); // This will re-fetch latlong whenever city/state changes
        };
    
        if (profileData.city && profileData.state) {
            updateLatLong(); // Ensure latlong is updated whenever the city/state changes
        }
    }, [profileData.city, profileData.state]); // Trigger when city or state changes
    

    return (
        <ProfileContext.Provider value={{ profileData, setProfileData, fetchLatLong, saveProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};
