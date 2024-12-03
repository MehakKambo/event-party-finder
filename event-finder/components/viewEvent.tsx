import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Linking, ImageBackground, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventDetails } from '@/types/EventDetails';
import { db, auth } from '@/lib/firebase-config';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const ViewEvent: React.FC<{ event: EventDetails; onBack: () => void }> = ({ event, onBack }) => {
    const { id, name, date, time, description, image, url, venue } = event;

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

    // Format date and time
    const newDate = new Date(date + 'T' + time);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const dayAndDate = newDate.toLocaleDateString('en-US', options);
    const newTime = newDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const [ isSaved, setIsSaved ] = useState(false);
    const uid = auth.currentUser?.uid;
    const eventMetaData = {
        id,
        name,
        dateTime: date + " " + time,
        imageURL: image.uri,
        venueName: venueName + " | " + city + ", " + state,
    };

    // Check if the event is already saved when the component loads
    useEffect(() => {
        const fetchSavedState = async () => {
            if (!uid) return;
    
            try {
                const userDocRef = doc(db, 'users', uid);
                const userDoc = await getDoc(userDocRef);
    
                if (userDoc.exists()) {
                    const savedEvents = userDoc.data().myEvents || [];
                    // Check if the current event is in the saved events
                    const isEventSaved = savedEvents.some((event: any) => event.id === id);
                    setIsSaved(isEventSaved);
                }
            } catch (error) {
                console.error("Error fetching saved state:", error);
            }
        };
    
        fetchSavedState();
    }, [id, uid]);
    


    // Placeholder for Firebase Save Logic
    const handleSaveEvent = async (eventId: string) => {
        if (!uid) {
            Alert.alert("Error", "Please sign in to save events.");
            return;
        }

        try {
            const userDocRef = doc(db, 'users', uid);
            if (isSaved) {
                await updateDoc(userDocRef, {
                    myEvents: arrayRemove(eventMetaData)
                });
            } else {
                await updateDoc(userDocRef, {
                    myEvents: arrayUnion(eventMetaData)
                });
            }
            // Toggle saved state
            setIsSaved(!isSaved);
        } catch (error) {
            console.error("Error saving event:", error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
            <ScrollView style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={styles.backArrow}>← Back</Text>
                    </TouchableOpacity>

                    {/* Save/Unsave Button */}
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleSaveEvent(id)}
                    >
                        <Text style={styles.saveButtonText}>{isSaved ? "Unsave" : "Save"}</Text>
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
                    <Text style={styles.eventDate}>{`${dayAndDate} at ${newTime}`}</Text>
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
                    <Text style={styles.buttonText}>Tickets / More Details</Text>
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
    saveButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        marginLeft: 'auto',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
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