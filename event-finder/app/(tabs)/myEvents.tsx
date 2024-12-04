import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase-config';
import { EventDetails } from '@/types/EventDetails';
import ViewEvent from '@/components/viewEvent';
import axios from 'axios';

const TICKETMASTER_API_URL = 'https://app.ticketmaster.com/discovery/v2/events';
const TICKETMASTER_API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;

const MyEvents: React.FC = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const userId = auth.currentUser?.uid;

    // Get current date in "YYYY-MM-DD" format
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // JavaScript months are 0-indexed
    const day = today.getDate();
    const currentDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    // Load saved events from Firestore and set upcoming events
    const fetchSavedEvents = async () => {

        try {
            if (!userId) {
                Alert.alert('Error', 'You need to sign in to view your saved events.');
                return;
            }

            // ignore the error for now
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const events = userDoc.data()?.myEvents || [];

                // Filter only upcoming events
                const upcoming = events
                    .filter((event: any) => {
                        const eventDate = event.dateTime.split(' ')[0];
                        return eventDate >= currentDate;
                    })
                    .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
                setUpcomingEvents(upcoming);
            } else {
                console.warn('User document does not exist.');
            }
        } catch (error) {
            console.error('Error fetching saved events:', error);
        }
    };

    useEffect(() => {
        fetchSavedEvents();
    }, [userId, currentDate]);


    // Fetch specific event details from Ticketmaster API on click
    const fetchEventDetails = async (eventId: string) => {
        try {
            const response = await axios.get(`${TICKETMASTER_API_URL}/${eventId}.json`, {
                params: {
                    apikey: TICKETMASTER_API_KEY,
                },
            });
            const event = response.data;

            // Extract relevant event details
            const eventDetails: EventDetails = {
                id: event.id,
                date: event.dates.start.localDate,
                name: event.name,
                description: event.info || 'No description available',
                time: event.dates.start.localTime || 'TBD',
                image: { uri: event.images[0]?.url || '' },
                url: event.url,
                venue: event._embedded?.venues[0] || null,
            };
            setSelectedEvent(eventDetails);
        } catch (error) {
            console.error('Error fetching event details:', error);
        }
    };


    const handleEventPress = (event: EventDetails) => {
        fetchEventDetails(event.id);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchSavedEvents().then(() => setIsRefreshing(false));
    };

    // Reuse renderEvent logic from HomeScreen
    const renderEvent = (event: any) => {
        const date = new Date(event.dateTime);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          };
        const dayAndDate = date.toLocaleDateString('en-US', options);
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const location = event.venueName || 'Unknown Venue';

        return (
            <TouchableOpacity key={`${event.id}-${event.dateTime}`} onPress={() => handleEventPress(event)} style={styles.eventCard}>
                <View style={styles.eventContent}>
                    <ImageBackground
                        source={{ uri: event.imageURL }}
                        style={styles.eventImage}
                        resizeMode="cover"
                    />
                    <View style={styles.eventDetails}>
                        <Text style={styles.eventDayTime}>{`${dayAndDate} at ${time}`}</Text>
                        <Text style={styles.eventName}>{event.name}</Text>
                        <Text style={styles.eventLocation}>{location}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return selectedEvent ? (
        <ViewEvent
            event={selectedEvent}
            onBack={() => {
                setSelectedEvent(null), 
                fetchSavedEvents()
            }}
        />
    ) : (
        <ImageBackground source={require('../../assets/images/simple-background.jpg')} style={styles.bodyBackgroundImage}>
            <SafeAreaView style={{ flex: 1 }}>
                <Text style={styles.title}>Upcoming Events</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={isRefreshing}>
                    <Text style={styles.refreshButtonText}>{isRefreshing ? 'Refreshing...' : 'Refresh'}</Text>
                </TouchableOpacity>
                <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={styles.eventList}>
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event) => renderEvent(event))
                    ) : (
                        <Text style={styles.noEventsText}>No upcoming events found!</Text>
                    )}
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

// Styles
const styles = StyleSheet.create({
    bodyBackgroundImage: {
        flex: 1,
    },
    refreshButton: {
        alignSelf: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    refreshButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        padding: 20,
    },
    eventList: {
        paddingBottom: 10,
    },
    eventCard: {
        flexDirection: 'row',
        padding: 10,
        marginVertical: 5,
        marginHorizontal: 10,
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        alignItems: 'center',
        position: 'relative'
    },
    eventContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
        paddingRight: 30
    },
    eventDetails: {
        flex: 1,
    },
    eventDayTime: {
        fontSize: 14,
        color: '#FF5733',
        fontWeight: '600',
        marginBottom: 5,
    },
    eventName: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: 3,
    },
    eventLocation: {
        fontSize: 12,
        color: '#BBBBBB',
    },
    noEventsText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default MyEvents;