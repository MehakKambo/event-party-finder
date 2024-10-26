import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MY_EVENTS_STORAGE_KEY = 'myEvents';
interface Event {
    id: number;
    date: string;
    name: string;
    description: string;
    time?: string;
    image: any;
}
const ViewEvent: React.FC = () => {
    const router = useRouter();
    const [isRSVPed, setIsRSVPed] = useState(false);
    const { event, source } = useLocalSearchParams();

    // Parse the event data
    const parsedEvent = (() => {
        if (typeof event !== 'string') return event;
        try {
            return JSON.parse(event);
        } catch (error) {
            console.error('Failed to parse event data:', error);
            return null;
        }
    })();

    // Handle RSVP with confirmation dialog
    const handleRSVPWithConfirmation = () => {
        Alert.alert(
            isRSVPed ? 'Cancel RSVP' : 'RSVP',
            `Are you sure you want to ${isRSVPed ? 'cancel your RSVP for' : 'RSVP to'} this event?`,
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        handleRSVP();
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleRSVP = async () => {
        try {
            const myEventsData = await AsyncStorage.getItem(MY_EVENTS_STORAGE_KEY);
            const myEvents: Event[] = myEventsData ? JSON.parse(myEventsData) : [];

            if (!isRSVPed) {
                // Add event to myEvents
                const updatedMyEvents = [...myEvents, parsedEvent];
                await AsyncStorage.setItem(MY_EVENTS_STORAGE_KEY, JSON.stringify(updatedMyEvents));
                setIsRSVPed(true);
            } else {
                // Remove event from myEvents
                const updatedMyEvents = myEvents.filter(e => e.id !== parsedEvent.id);
                await AsyncStorage.setItem(MY_EVENTS_STORAGE_KEY, JSON.stringify(updatedMyEvents));
                setIsRSVPed(false);
            }

            router.push('/home');
        } catch (error) {
            console.error('Failed to update RSVP status:', error);
        }
    };

    useEffect(() => {
        // Check if the event is already RSVP'ed
        const loadMyEvents = async () => {
            const myEventsData = await AsyncStorage.getItem(MY_EVENTS_STORAGE_KEY);
            if (myEventsData) {
                const myEvents = JSON.parse(myEventsData);
                const isAlreadyRSVPed = myEvents.some((e: Event) => e.id === parsedEvent?.id);
                setIsRSVPed(isAlreadyRSVPed);
            }
        };
        loadMyEvents();
    }, [parsedEvent]);

    return (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                </View>

                {/* Event Date and Image */}
                <View style={styles.eventDetails}>
                    <Text style={styles.eventDetails}>Event Details</Text>
                    <Image source={parsedEvent?.image} style={styles.eventImage} />
                </View>

                {/* Event Information */}
                <View style={styles.eventInfoContainer}>
                    <Text style={styles.eventName}>{parsedEvent?.name}</Text>
                    <Text style={styles.eventDate}>{parsedEvent?.date}</Text>
                    <Text style={styles.eventDescription}>{parsedEvent?.description}</Text>
                </View>

                {/* RSVP/Cancel Button */}
                <TouchableOpacity style={styles.rsvpButton} onPress={handleRSVPWithConfirmation}>
                    <Text style={styles.buttonText}>
                        {isRSVPed ? 'Cancel RSVP' : 'RSVP'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backArrow: {
        fontSize: 34,
    },
    eventDetails: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 5,
        alignItems: 'flex-start',
    },
    eventDate: {
        fontSize: 15,
        marginBottom: 10,
    },
    eventImage: {
        marginTop: 25,
        width: 350,
        height: 250,
        borderRadius: 10,
    },
    eventInfoContainer: {
        marginVertical: 20,
    },
    eventName: {
        fontSize: 21,
        fontWeight: 'bold',
    },
    eventDescription: {
        fontSize: 16,
        marginTop: 10,
    },
    rsvpButton: {
        marginVertical: 20,
        backgroundColor: '#007AFF',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ViewEvent;