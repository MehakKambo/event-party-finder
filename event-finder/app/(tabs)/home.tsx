import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import axios from 'axios';
import { Link } from 'expo-router';
import { useProfile } from '@/components/ProfileContext';
import { useFocusEffect } from '@react-navigation/native';
import { EventDetails } from '../../types/EventDetails';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewEvent from '@/components/viewEvent';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TICKETMASTER_API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const TICKETMASTER_API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;

const HomeScreen: React.FC = () => {
  const [nearbyEvents, setNearbyEvents] = useState<EventDetails[]>([]);
  const [cityState, setCityState] = useState<string>('');
  const { profileData } = useProfile();
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  
  const preferences = (profileData.preferences) ?
        profileData?.preferences?.length > 0
          ? profileData.preferences.join(', ') : ''
          :
          '';

  const fetchNearbyEvents = async () => {
    try {
      
      const response = await axios.get(TICKETMASTER_API_URL, {
        params: {
          apikey: TICKETMASTER_API_KEY,
          latlong: profileData.latlong || '47.6062,-122.3321', // Default to Seattle if no latlong
          radius: 25,
          unit: 'miles',
          size: 30,
          classificationName: preferences,
        },
      });

      const events = response.data._embedded?.events.map((event: any) => ({
        id: event.id,
        date: event.dates.start.localDate,
        name: event.name,
        description: event.info || 'No description available',
        time: event.dates.start.localTime || 'TBD',
        image: { uri: event.images[0].url },
        url: event.url,
        venue: event._embedded?.venues[0],
      })) || [];
      setNearbyEvents(events);
    } catch (error) {
      console.error('Error fetching nearby events:', error);
    }
  };

  // Fetch city/state based on latlong when it's available
  useFocusEffect(
    useCallback(() => {
      if (profileData.latlong)
        fetchNearbyEvents();
    }, [profileData.latlong, profileData.preferences])
  );



  const handleEventPress = (event: EventDetails) => {
    setSelectedEvent(event);
  };

  // Render event card
  const renderEvent = (event: EventDetails) => {
    const date = new Date(event.date + 'T' + event.time);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const dayAndDate = date.toLocaleDateString('en-US', options);
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const venue = event.venue?.name || 'Unknown Venue';
    const city = event.venue?.city?.name || '';
    const state = event.venue?.state?.stateCode || '';
    const location = `${city}, ${state} | ${venue}`;

    return (
      <TouchableOpacity key={event.id} onPress={() => handleEventPress(event)} style={styles.eventCard}>
        <View style={styles.eventContent}>
          <ImageBackground
            source={event.image}
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
      onBack={() => setSelectedEvent(null)}
    />
  ) : (
    <ImageBackground source={require('../../assets/images/simple-background.jpg')} style={styles.bodyBackgroundImage}>
      <SafeAreaView style={{ flex: 1}}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Curated Just for You</Text>
          </View>

          <View style={styles.locationSelector}>
          <Ionicons name="location-outline" size={20} color="#000" style={styles.locationIcon} />
            <Text style={styles.locationText}>
              {cityState || (profileData.city && profileData.state ? `${profileData.city}, ${profileData.state}` : 'Location not available')}
            </Text>
            <TouchableOpacity>
              <Link style={styles.changeLink} href="/profile">Change</Link>
            </TouchableOpacity>
          </View>

          {nearbyEvents.length > 0 ? (
            <ScrollView contentContainerStyle={styles.eventList}>
              {nearbyEvents.map((event) => renderEvent(event))}
            </ScrollView>
          ) : (
            <Text>No events found in your area. Try updating your preferences.</Text>
          )}
        </View>
      </SafeAreaView>
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
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  locationIcon: {
      marginRight: 8,
  },
  locationText: {
      fontSize: 16,
      fontStyle: 'italic',
      color: '#333',
  },
  changeLink: {
      color: '#1E90FF',
      textDecorationLine: 'underline',
      fontSize: 14,
      marginLeft: 10,
  },
  eventList: {
    paddingBottom: 20,
  },
  eventCard: {
    flexDirection: 'row',
    padding: 10,
    marginRight: 10,
    marginVertical: 8,
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
});

export default HomeScreen;