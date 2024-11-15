import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ImageBackground } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

import { useProfile } from '@/components/ProfileContext';
import { EventDetails } from '@/types/EventDetails';

const TICKETMASTER_API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const TICKETMASTER_API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;

const FindEventsScreen: React.FC = () => {
    const [events, setEvents] = useState<EventDetails[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const { profileData } = useProfile();
    const router = useRouter();

    // Fetch events from Ticketmaster API
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await axios.get(TICKETMASTER_API_URL, {
                params: {
                    apikey: TICKETMASTER_API_KEY,
                    keyword: searchQuery,
                    latlong: '47.6062,-122.3321', // Seattle
                    radius: 25,
                    unit: 'miles',
                    size: 10,
                },
            });

            const fetchedEvents = response.data._embedded?.events.map((event: any) => ({
                id: event.id,
                date: event.dates.start.localDate,
                name: event.name,
                description: event.info || 'No description available',
                time: event.dates.start.localTime || 'TBD',
                image: { uri: event.images[0].url },
                url: event.url,
                venue: event._embedded?.venues[0],
            })) || [];

            setEvents(fetchedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Pass event data to ViewEventScreen
    const handleEventPress = (event: EventDetails) => {
        router.push({
            pathname: '/viewEvent',
            params: { event: JSON.stringify(event), source: 'findEvents' },
        });
    };


    // Render event card
    const renderEvent = (event: EventDetails) => {
        // Format date and time from '2022-10-15T19:00:00' to 'Saturday, October 15, 2022 at 7:00 PM'
        const date = new Date(event.date + 'T' + event.time);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const dayAndDate = date.toLocaleDateString('en-US', options);
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Format location from venue, address, city, state, and country
        const venue = event.venue?.name || 'Unknown Venue';
        const address = event.venue?.address?.line1 || '';
        const city = event.venue?.city?.name || '';
        const state = event.venue?.state?.stateCode || '';
        const country = event.venue?.country?.name || '';

        const location = `${venue}, ${address}, ${city}, ${state}, ${country}`;

        return (
            <TouchableOpacity key={event.id} onPress={() => handleEventPress(event)} style={styles.eventCard}>
                <View style={styles.eventContent}>
                    {/* Event Image */}
                    <ImageBackground
                        source={event.image}
                        style={styles.eventImage}
                        resizeMode="cover"
                    />

                    {/* Event Details */}
                    <View style={styles.eventDetails}>
                        <Text style={styles.eventDayTime}>{`${dayAndDate} at ${time}`}</Text>
                        <Text style={styles.eventName}>{event.name}</Text>
                        <Text style={styles.eventLocation}>{location}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground source={require('../../assets/images/simple-background.jpg')} style={styles.bodyBackgroundImage}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{`Search Events in ${profileData.city}, ${profileData.state}`}</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for concerts, sports, dance, tech etc."
                        placeholderTextColor="#000000"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={fetchEvents}
                    />
                </View>

                {/* Events List */}
                <ScrollView contentContainerStyle={styles.eventList}>
                    {loading ? (
                        <Text style={styles.loadingText}>Loading...</Text>
                    ) : events.length > 0 ? (
                        events.map((event) => renderEvent(event))
                    ) : (
                        <Text style={styles.noEventsText}>No events found</Text>
                    )}
                </ScrollView>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    bodyBackgroundImage: {
        flex: 1,
    },
    header: {
        marginTop: 40,
        flexDirection: 'column',
        alignItems: 'baseline',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    searchContainer: {
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 10,
        color: '#000000',
    },
    eventList: {
        paddingBottom: 20,
    },
    eventCard: {
        flexDirection: 'row',
        padding: 10,
        marginVertical: 8,
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        alignItems: 'center',
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
    loadingText: {
        textAlign: 'center',
        color: '#555',
        fontSize: 16,
        marginTop: 20,
    },
    noEventsText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginTop: 20,
    },
});

export default FindEventsScreen;
