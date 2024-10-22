import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { events } from '../../assets/data/eventData';

const ViewEvent: React.FC = () => {

    // Get the router instance
    const router = useRouter();

    // Get the event data from home
    const { event } = useLocalSearchParams();

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

    // Find the index of the passed event
    const initialIndex = parsedEvent ? events.findIndex((e) => e.name === parsedEvent?.name) : 0;

    // State to track the current event index
    const [currentEventIndex, setCurrentEventIndex] = useState(initialIndex);

    // Get the current event based on the index
    const currentEvent = events[currentEventIndex];

    // Function to handle the next event
    const handleNextEvent = () => {
        if (currentEventIndex < events.length - 1) {
            setCurrentEventIndex(currentEventIndex + 1);
        }
    };

    // Get the event data from home
    const handlePrevEvent = () => {
        if (currentEventIndex > 0) {
            setCurrentEventIndex(currentEventIndex - 1);
        }
    };

    // Set the initial event index
    useEffect(() => {
        if (initialIndex !== -1) {
            setCurrentEventIndex(initialIndex);
        }
    }, [initialIndex]);

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
            </View>

            {/* Event Date and Image */}
            <View style={styles.eventDetails}>
                <Text style={styles.eventDate}>{currentEvent?.date}</Text>
                <Image source={currentEvent?.image} style={styles.eventImage} />
            </View>

            {/* Event Information */}
            <View style={styles.eventInfoContainer}>
                <Text style={styles.eventInfoHeader}>Event Information</Text>
                <Text style={styles.eventName}>{currentEvent?.name}</Text>
                <Text style={styles.eventDescription}>{currentEvent?.description}</Text>
            </View>

            {/* Add/Remove Button */}
            <TouchableOpacity style={styles.addRemoveButton}>
                <Text style={styles.addRemoveText}>Add/Remove</Text>
            </TouchableOpacity>

            {/* Navigation Buttons */}
            <View style={styles.navigationButtons}>
                <TouchableOpacity
                    // Disable if at the first event
                    style={[styles.navButton, currentEventIndex === 0 && styles.disabledButton]}
                    onPress={handlePrevEvent}
                    disabled={currentEventIndex === 0}
                >
                    <Text>Prev Event</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    // Disable if at the last event
                    style={[styles.navButton, currentEventIndex === events.length - 1 && styles.disabledButton]}
                    onPress={handleNextEvent}
                    disabled={currentEventIndex === events.length - 1}
                >
                    <Text>Next Event</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
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
        fontSize: 24,
    },
    editText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'blue',
    },
    eventDetails: {
        marginVertical: 20,
        alignItems: 'center',
    },
    eventDate: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    eventImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    eventInfoContainer: {
        marginVertical: 20,
    },
    eventInfoHeader: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    eventDescription: {
        fontSize: 16,
        marginTop: 10,
    },
    addRemoveButton: {
        marginVertical: 20,
        backgroundColor: '#d3d3d3',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    addRemoveText: {
        fontSize: 16,
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    navButton: {
        backgroundColor: '#d3d3d3',
        padding: 10,
        borderRadius: 5,
    },
    disabledButton: {
        backgroundColor: '#b0b0b0',
    },
});

export default ViewEvent;