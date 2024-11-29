import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, AppState, AppStateStatus, Alert } from 'react-native';
import axios from 'axios';
import { db, auth } from '@/lib/firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { Link, Redirect } from 'expo-router';
import { useProfile } from '@/components/ProfileContext';
import { ProfileData } from '@/components/ProfileContext';
import { EventDetails } from '../../types/EventDetails';
import { FavoriteIcon } from '@/components/FavoriteIcon';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewEvent from '@/components/viewEvent';

const TICKETMASTER_API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const TICKETMASTER_API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;
const GEOCODING_API_KEY = process.env.EXPO_PUBLIC_GEOCODING_API_KEY;

const HomeScreen: React.FC = () => {
  const [nearbyEvents, setNearbyEvents] = useState<EventDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { profileData, setProfileData } = useProfile();
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Check for user authentication state and fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      const uid = auth.currentUser?.uid;

      if (!uid) {
        console.warn("User not authenticated");
        setIsAuthenticated(false);  // Set authentication state to false
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as ProfileData;
          setProfileData(data);
        } else {
          console.warn("User profile not found");
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        Alert.alert("Error", "Unable to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Redirect to login if the user is not authenticated
  if (!isAuthenticated) {
    return <Redirect href="../sign-in" />;
  }

  // Fetch lat/long from city and state using geocoding API
  const fetchLatLongFromCityState = async (city: string, state: string) => {
    try {
      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: `${city}, ${state}`,
          key: GEOCODING_API_KEY,
        },
      });

      const { lat, lng } = response.data.results[0]?.geometry || {};
      if (lat && lng) {
        return `${lat},${lng}`;
      } else {
        setLoading(false);
        throw new Error('Unable to retrieve latlong from city and state');
      }
    } catch (error) {
      return null;
    }
  };

  // Fetch nearby events based on the lat/long coordinates
  const fetchNearbyEvents = async (latlong: string) => {
    try {
      const preferences = (profileData.preferences) ?
        profileData?.preferences?.length > 0
          ? profileData.preferences.join('%20') : ''
          :
          '';
        
      const response = await axios.get(TICKETMASTER_API_URL, {
        params: {
          apikey: TICKETMASTER_API_KEY,
          latlong: latlong,
          radius: 25,
          unit: 'miles',
          size: 10,
          keyword: preferences, // Use preferences as a keyword
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching nearby events:', error);
      setLoading(false);
    }
  };

  // Fetch city and state directly from the database or ProfileContext
  const getCityAndState = async () => {
    if (!profileData || !profileData.city || !profileData.state) {
      setLoading(false);
      return;
    }

    const latlong = await fetchLatLongFromCityState(profileData.city, profileData.state);
    if (latlong) {
      fetchNearbyEvents(latlong);
    } else {
      setLoading(false);
    }
  };

  // Run event fetching process once profile data is loaded
  useEffect(() => {
    if (profileData) {
      getCityAndState();
    }
    setLoading(false);
  }, [profileData]);

  const handleEventPress = (event: EventDetails) => setSelectedEvent(event);
  const toggleFavorite = (eventId: string) => {
    setNearbyEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, isFavorited: !event.isFavorited } : event
      )
    );
  };

  // Render event card with formatted date and time
  const renderEvent = (event: EventDetails) => {
    const date = new Date(`${event.date}T${event.time}`);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const venue = event.venue?.name || 'Unknown Venue';
    const location = `${venue}, ${event.venue?.address?.line1 || ''}, ${event.venue?.city?.name || ''}, ${event.venue?.state?.stateCode || ''}, ${event.venue?.country?.name || ''}`;

    return (
      <TouchableOpacity key={event.id} onPress={() => handleEventPress(event)} style={styles.eventCard}>
        <View style={styles.eventContent}>
          <ImageBackground source={event.image} style={styles.eventImage} resizeMode="cover" />
          <View style={styles.eventDetails}>
            <Text style={styles.eventDayTime}>{`${formattedDate} at ${formattedTime}`}</Text>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventLocation}>{location}</Text>
          </View>
        </View>
        <FavoriteIcon isFavorited={event.isFavorited ?? false} onPress={() => toggleFavorite(event.id)} />
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.alignCenter]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Event detail page or event list
  return selectedEvent ? (
    <ViewEvent event={selectedEvent} onBack={() => setSelectedEvent(null)} />
  ) : (
    <ImageBackground source={require('../../assets/images/simple-background.jpg')} style={styles.bodyBackgroundImage}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Recommended Events Near You</Text>
          <View style={styles.locationSelector}>
            <Text style={styles.locationText}>
              {profileData?.city && profileData?.state ? `${profileData.city}, ${profileData.state}` : 'Location not available'}
            </Text>
            <Link style={styles.changeLink} href="/profile">Change</Link>
          </View>
          <ScrollView contentContainerStyle={styles.eventList}>
            {nearbyEvents.map(renderEvent)}
          </ScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  alignCenter: { flexGrow: 1, alignItems: 'center', textAlign: 'center' },
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  bodyBackgroundImage: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000', textAlign: 'center' },
  locationSelector: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 20 },
  locationText: { color: '#000000', fontSize: 16, fontStyle: 'italic' },
  changeLink: { color: '#1E90FF', marginLeft: 5 },
  eventList: { paddingBottom: 20 },
  eventCard: { flexDirection: 'row', padding: 10, marginVertical: 8, backgroundColor: '#1a1a1a', borderRadius: 8 },
  eventContent: { flexDirection: 'row', flex: 1 },
  eventImage: { width: 100, height: 100, borderRadius: 8 },
  eventDetails: { paddingLeft: 15, flex: 1 },
  eventDayTime: { fontSize: 12, color: '#B0B0B0' },
  eventName: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' },
  eventLocation: { fontSize: 14, color: '#B0B0B0' },
});

export default HomeScreen;
