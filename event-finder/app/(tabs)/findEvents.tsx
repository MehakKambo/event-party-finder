import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ImageBackground } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '@/components/ProfileContext';
import { EventDetails } from '@/types/EventDetails';
import ViewEvent from '@/components/viewEvent';
import { Ionicons } from '@expo/vector-icons';

const TICKETMASTER_API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const TICKETMASTER_API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;

const FindEventsScreen: React.FC = () => {
    const [events, setEvents] = useState<EventDetails[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const { profileData } = useProfile();
    const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
    const [isSortingRecent, setIsSortingRecent] = useState(false);
    const [isSortingRelevant, setIsSortingRelevant] = useState(false);

    // Fetch events from Ticketmaster API
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const formattedPrefs = profileData.preferences.join(',');
            const response = await axios.get(TICKETMASTER_API_URL, {
                params: {
                    apikey: TICKETMASTER_API_KEY,
                    keyword: searchQuery,
                    latlong: profileData.latlong || '47.6062,-122.3321', // Seattle
                    radius: 25,
                    unit: 'miles',
                    size: 10,
                    classificationName: formattedPrefs,
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

    const fetchEventsByRecent = async () => {
        setLoading(true);
        try {
            const formattedPrefs = profileData.preferences.join(',');
            const response = await axios.get(TICKETMASTER_API_URL, {
                params: {
                    apikey: TICKETMASTER_API_KEY,
                    keyword: searchQuery,
                    latlong: profileData.latlong || '47.6062,-122.3321', // Seattle
                    radius: 25,
                    unit: 'miles',
                    size: 10,
                    classificationName: formattedPrefs,
                    sort: 'date,asc',
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
        setSelectedEvent(event);
    };

    const handleSortRecent = () => {
        setIsSortingRecent(true);
        fetchEventsByRecent().then(() => setIsSortingRecent(false));
    };

    const handleSortRelevant = () => {
        setIsSortingRelevant(true);
        fetchEvents().then(() => setIsSortingRelevant(false));
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
        const city = event.venue?.city?.name || '';
        const state = event.venue?.state?.stateCode || '';

        const location = `${venue} | ${city}, ${state}`;

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

    return selectedEvent ? (
        <ViewEvent
          event={selectedEvent}
          onBack={() => setSelectedEvent(null)}
        />
      ) : (
        <ImageBackground source={require('../../assets/images/simple-background.jpg')} style={styles.bodyBackgroundImage}>
            <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
                <View style={styles.header}>
                    <Text style={styles.title}>Find Events</Text>
                </View>
                <View style={styles.container}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        {/* Search Icon */}
                        <Ionicons name="search" size={24} color="#000000" />
                        {/* Search Input */}
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search events"
                            placeholderTextColor="#000000"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={fetchEvents}
                        />
                    </View>
                    <View style={ {flexDirection: "row", justifyContent: 'space-evenly'} }>
                        <TouchableOpacity style={styles.sortButton} onPress={handleSortRecent} disabled={isSortingRecent}>
                            <Text style={styles.sortButtonText}>{isSortingRecent ? 'Sorting...' : 'Sort by recent'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sortButton} onPress={handleSortRelevant} disabled={isSortingRelevant}>
                            <Text style={styles.sortButtonText}>{isSortingRelevant ? 'Sorting...' : 'Sort by relevant'}</Text>
                        </TouchableOpacity>
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
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        paddingBottom: 105,
    },
    bodyBackgroundImage: {
        flex: 1,
    },
    header: {
        marginTop: 10,
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    searchContainer: {
        marginTop: 5,
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
    sortButton: {
        //alignSelf: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    sortButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    eventList: {
        paddingBottom: 20,
    },
    eventCard: {
        flexDirection: 'row',
        padding: 10,
        marginVertical: 5,
        marginRight: 11,
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
