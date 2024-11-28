import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Linking} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventDetails } from '@/types/EventDetails';

const ViewEvent: React.FC<{ event: EventDetails; onBack: () => void }> = ({ event, onBack }) => {
    const { name, date, time, description, image, url, venue } = event;

    // Format venue details
    const venueName = venue?.name || "Unknown Venue";
    const address = venue?.address?.line1 || "Address not available";
    const city = venue?.city?.name || "City not available";
    const state = venue?.state?.stateCode || "State not available";
    const postalCode = venue?.postalCode || "Postal code not available";
    const generalRules = venue?.generalInfo?.generalRule || "No general rules available.";
    const childRules = venue?.generalInfo?.childRule || "No child rules available.";
    const boxOfficeHours = venue?.boxOfficeInfo?.openHoursDetail || "Not available";
    const parkingDetails = venue?.parkingDetail || "Parking information not available.";
    const accessibleSeatingDetail = venue?.accessibleSeatingDetail || "Not available.";

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={styles.backArrow}>← Back</Text>
                    </TouchableOpacity>
                </View>

                {/* Event Image */}
                <Image
                    source={image}
                    style={styles.eventImage}
                    resizeMode="cover"
                />

                {/* Event Information */}
                <View style={styles.eventInfoContainer}>
                    <Text style={styles.eventName}>{name}</Text>
                    <Text style={styles.eventDate}>{`${date} at ${time}`}</Text>
                    <Text style={styles.eventDescription}>Important Info: {description}</Text>

                    {/* Venue Information */}
                    <View style={styles.venueDetails}>
                        <Text style={styles.sectionTitle}>Venue Details</Text>
                        <Text style={styles.venueText}>Name: {venueName}</Text>
                        <Text style={styles.venueText}>Address: {address}, {city}, {state} {postalCode}</Text>
                    </View>

                    {/* Accessibility and Parking */}
                    <View style={styles.venueDetails}>
                        <Text style={styles.sectionTitle}>Accessibility & Parking</Text>
                        <Text style={styles.venueText}>Accessible Seating: {accessibleSeatingDetail}</Text>
                        <Text style={styles.venueText}>Parking: {parkingDetails}</Text>
                    </View>

                    {/* Rules & Box Office */}
                    <View style={styles.venueDetails}>
                        <Text style={styles.sectionTitle}>Rules & Box Office</Text>
                        <Text style={styles.venueText}>General Rules: {generalRules}</Text>
                        <Text style={styles.venueText}>Child Rules: {childRules}</Text>
                        <Text style={styles.venueText}>Box Office Hours: {boxOfficeHours}</Text>
                    </View>
                </View>

                {/* RSVP Button */}
                <TouchableOpacity style={styles.rsvpButton} onPress={() => Linking.openURL(url)}>
                    <Text style={styles.buttonText}>Get Tickets</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 20,
    },
    backArrow: {
        fontSize: 20,
        color: '#007AFF',
    },
    eventImage: {
        width: '100%',
        height: 250,
        borderRadius: 10,
        marginBottom: 20,
    },
    eventInfoContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 20,
    },
    eventName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    eventDate: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    eventDescription: {
        fontSize: 14,
        color: '#444',
        marginBottom: 20,
    },
    venueDetails: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    venueText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 5,
    },
    rsvpButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ViewEvent;