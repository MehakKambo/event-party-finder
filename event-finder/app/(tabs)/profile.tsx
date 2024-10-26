import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';

const Profile: React.FC = () => {
    const profileData = {
        firstName: 'Lotto B.',
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
      };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Profile Picture */}
            <View style={styles.profilePicContainer}>
                <Image
                    source={require('../../assets/images/profile.png')}
                    style={styles.profilePic}
                />
                <TouchableOpacity>
                    <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Information */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoHeader}>Personal Information</Text>

                <Text style={styles.infoLabel}>First Name:</Text>
                <TextInput style={styles.textInput} value={profileData.firstName} editable={false} />

                <Text style={styles.infoLabel}>Last Name:</Text>
                <TextInput style={styles.textInput} value={profileData.lastName} editable={false} />

                <Text style={styles.infoLabel}>Date of Birth:</Text>
                <TextInput style={styles.textInput} value={profileData.dob} editable={false} />

                <Text style={styles.infoLabel}>Phone Number:</Text>
                <TextInput style={styles.textInput} value={profileData.phoneNumber} editable={false} />

                <Text style={styles.infoLabel}>Email Address:</Text>
                <TextInput style={styles.textInput} value={profileData.email} editable={false} />

                <Text style={styles.infoHeader}>Address Information</Text>

                <Text style={styles.infoLabel}>Address Line 1:</Text>
                <TextInput style={styles.textInput} value={profileData.addressLine1} editable={false} />

                <Text style={styles.infoLabel}>Address Line 2 (Optional):</Text>
                <TextInput style={styles.textInput} value={profileData.addressLine2} editable={false} />

                <Text style={styles.infoLabel}>City:</Text>
                <TextInput style={styles.textInput} value={profileData.city} editable={false} />

                <Text style={styles.infoLabel}>State:</Text>
                <TextInput style={styles.textInput} value={profileData.state} editable={false} />

                <Text style={styles.infoLabel}>Zip Code:</Text>
                <TextInput style={styles.textInput} value={profileData.zipCode} editable={false} />

                <Text style={styles.infoLabel}>Country:</Text>
                <TextInput style={styles.textInput} value={profileData.country} editable={false} />
            </View>
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
});

export default Profile;
