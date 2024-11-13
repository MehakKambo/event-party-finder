import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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

    // Load the profile data from AsyncStorage on initial load
    useEffect(() => {
        const loadData = async () => {
            try {
                const savedData = await AsyncStorage.getItem('profileData');
                if (savedData) {
                    setProfileData(JSON.parse(savedData)); // Set the context state
                }
            } catch (err) {
                console.error('Error loading profile data from AsyncStorage', err);
            }
        };

        loadData(); // Call the load function on component mount
    }, []); // Empty dependency array means this will run only once when the app starts

    // fetch latitude coordinates mapped to city,state
    const fetchLatLong = async (city: string, state: string) => {
        try {
            const response = await axios.get(PHOTON_API_URL, {
                params: {
                    q: `${city}, ${state}` // City and State
                }
            });
            const firstFeature = response.data.features[0];
            if (firstFeature && firstFeature.geometry && Array.isArray(firstFeature.geometry.coordinates)) {
                const [lon, lat] = firstFeature.geometry.coordinates;
    
                if (lat && lon) {
                    return `${lat},${lon}`;
                }
            }
    
            console.log("Lat/Lon not found in the response");
            return null;
        } catch (error) {
            console.error('Error fetching geolocation:', error);
            return null;
        }
    };

    // save and fetch latlong
    const saveProfile = async() => {
        try {
            const latlong = await fetchLatLong(profileData.city, profileData.state);
            if (latlong) {
                setProfileData((prevData) => ({ ...prevData, latlong })); 
            }
            await AsyncStorage.setItem('profileData', JSON.stringify(profileData));
            await fetchLatLong(profileData.city, profileData.state);  // Fetch latlong when saving
        } catch (error) {
            console.error('Error saving profile data:', error);
        }
    };

    return (
        <ProfileContext.Provider value={{ profileData, setProfileData, fetchLatLong, saveProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};
