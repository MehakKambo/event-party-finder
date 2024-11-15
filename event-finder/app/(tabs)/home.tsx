import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, AppState, AppStateStatus } from 'react-native';
import axios from 'axios';
import { Link, useRouter } from 'expo-router';

import { useProfile } from '@/components/ProfileContext';
import { EventDetails } from '../../types/EventDetails';
import { FavoriteIcon } from '@/components/FavoriteIcon';

const TICKETMASTER_API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const TICKETMASTER_API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;

const HomeScreen: React.FC = () => {
  const [nearbyEvents, setNearbyEvents] = useState<EventDetails[]>([]);
  const [appState, setAppState] = useState(AppState.currentState);
  const [refreshOnResume, setRefreshOnResume] = useState(false);
  const [cityState, setCityState] = useState<string>('');
  const { profileData } = useProfile();
  const router = useRouter();

  const fetchNearbyEvents = async () => {
    try {
      const response = await axios.get(TICKETMASTER_API_URL, {
        params: {
          apikey: TICKETMASTER_API_KEY,
          latlong: profileData.latlong || '47.6062,-122.3321', // Default to Seattle if no latlong
          radius: 25,
          unit: 'miles',
          size: 10,
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
        isFavorited: false
      })) || [];
      setNearbyEvents(events);
    } catch (error) {
      console.error('Error fetching nearby events:', error);
    }
  };

  // Fetch city/state based on latlong when it's available
  useEffect(() => {
    // Only fetch city/state if latlong changes
    if (profileData.latlong && !cityState) {
      // Fetch nearby events every time the latlong changes
      fetchNearbyEvents();
    }

  }, [profileData.latlong]);

  // Refresh events when app is resumed
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        if (refreshOnResume && !profileData.latlong) { 
          fetchNearbyEvents();
          setRefreshOnResume(false);
        }
      } else if (nextAppState === 'background') {
        setRefreshOnResume(true);
      }
      setAppState(nextAppState);
    };
  
    const subscription = AppState.addEventListener('change', handleAppStateChange);
  
    return () => {
      subscription.remove();
    };
  }, [appState, refreshOnResume, profileData.latlong]);
  

  // Pass event data to ViewEventScreen
  const handleEventPress = (event: EventDetails) => {
    router.push({
      pathname: '/viewEvent',
      params: { event: JSON.stringify(event) },
    });
  };

  const toggleFavorite = (eventId: number) => {
    setNearbyEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, isFavorited: !event.isFavorited } : event
      )
    );
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
    const address = event.venue?.address?.line1 || '';
    const city = event.venue?.city?.name || '';
    const state = event.venue?.state?.stateCode || '';
    const country = event.venue?.country?.name || '';
    const location = `${venue}, ${address}, ${city}, ${state}, ${country}`;

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
        <FavoriteIcon
          isFavorited={event.isFavorited ?? false}
          onPress={() => toggleFavorite(event.id)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={require('../../assets/images/simple-background.jpg')} style={styles.bodyBackgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recommended Events Near You</Text>
        </View>

        <View style={styles.locationSelector}>
          <Text style={styles.locationText}>
            {cityState || (profileData.city && profileData.state ? `${profileData.city}, ${profileData.state}` : 'Location not available')}
          </Text>
          <TouchableOpacity>
            <Link style={styles.changeLink} href="/profile">Change</Link>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.eventList}>
          {nearbyEvents.map((event) => renderEvent(event))}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 20,
  },
  locationText: {
    color: '#000000',
    fontSize: 16,
    fontStyle: 'italic',
  },
  changeLink: {
    color: '#1E90FF',
    marginLeft: 5,
  },
  eventList: {
    paddingBottom: 20,
  },
  eventCard: {
    flexDirection: 'row',
    padding: 10,
    paddingRight: 40,
    marginVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative'
  },
  favoriteIcon: {
    position: 'absolute',
    right: 10,
    top: '50%', 
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
