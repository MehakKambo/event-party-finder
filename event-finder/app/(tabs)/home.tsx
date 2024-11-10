import React, { useEffect, useState, } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, AppState, AppStateStatus } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const TICKETMASTER_API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const TICKETMASTER_API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;

interface Event {
  id: number;
  date: string;
  name: string;
  location: string;
  description: string;
  time?: string;
  image: any;
  url: string;
  venue?: {
    name: string;
    address: {
      line1: string;
    };
    city: {
      name: string;
    };
    state: {
      stateCode: string;
    };
    country: {
      name: string;
    };
  };
}

const HomeScreen: React.FC = () => {
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [appState, setAppState] = useState(AppState.currentState);
  const [refreshOnResume, setRefreshOnResume] = useState(false);
  const router = useRouter();

  const fetchNearbyEvents = async () => {
    try {
      const response = await axios.get(TICKETMASTER_API_URL, {
        params: {
          apikey: TICKETMASTER_API_KEY,
          latlong: '47.6062,-122.3321', // Seattle
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
      })) || [];

      setNearbyEvents(events);
    } catch (error) {
      console.error('Error fetching nearby events:', error);
    }
  };

  // Refresh events when app is resumed
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        if (refreshOnResume) {
          fetchNearbyEvents();
          setRefreshOnResume(false);
        }
      } else if (nextAppState === 'background') {
        console.log('App is in the background');
        setRefreshOnResume(true);
      }
      setAppState(nextAppState);
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [appState, refreshOnResume]);


  // Pass event data to ViewEventScreen
  const handleEventPress = (event: Event) => {
    router.push({
      pathname: '/viewEvent',
      params: { event: JSON.stringify(event) },
    });
  };

  // Fetch nearby events on initial render
  useEffect(() => {
    fetchNearbyEvents();
  }, []);

  // Render event card
  const renderEvent = (event: Event) => {
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recommended Events Near You</Text>
        </View>

        {/* Show current location */}
        <View style={styles.locationSelector}>
          <Text style={styles.locationText}>Seattle, WA</Text>
          <TouchableOpacity><Text style={styles.changeLink}>Change</Text></TouchableOpacity>
        </View>

        {/* Event List */}
        <ScrollView contentContainerStyle={styles.eventList}>
          {nearbyEvents.map(event => renderEvent(event))}
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
  searchBar: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 20,
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
  backgroundImage: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  eventDate: {
    color: '#FFD700',
    fontSize: 14,
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
});

export default HomeScreen;