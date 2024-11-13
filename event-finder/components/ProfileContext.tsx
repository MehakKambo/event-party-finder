import React, { createContext, useState, useContext, ReactNode } from 'react';

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
}

const ProfileContext = createContext<{
    profileData: ProfileData;
    setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
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
        profilePic: null
    });

    return (
        <ProfileContext.Provider value={{ profileData, setProfileData }}>
            {children}
        </ProfileContext.Provider>
    );
};
