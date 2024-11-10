import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';


const ViewEvent: React.FC = () => {
    const router = useRouter();
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

    // Handle RSVP (open the event URL)
    const handleRSVP = () => {
        if (parsedEvent?.url) {
            Linking.openURL(parsedEvent.url).catch(err =>
                console.error("Failed to open URL:", err)
            );
        } else {
            console.warn("No URL available for this event");
        }
    };

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

            {/* RSVP Button (opens event URL) */}
            <TouchableOpacity style={styles.rsvpButton} onPress={handleRSVP}>
                <Text style={styles.buttonText}>Get Tickets</Text>
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