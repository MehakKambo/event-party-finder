import React, { useEffect, useState, useCallback  } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

// TODO: REPLACE PEXELS API CALL WHEN DATABASE IS SETUP
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';
const PEXELS_API_QUERY = 'travel';
// API key (temporary defined here for now) - Pexels
const API_KEY = 'FDpB5MVjr825gTIIOdfJuNlDNtNUzqCThfiU6beRg6hIWm8D1GBBVz7c';

const MY_EVENTS_STORAGE_KEY = 'myEvents';
const EVENT_LIST_ITEM_HEIGHT = 100;

interface Event {
  id: number;
  date: string;
  name: string;
  description: string;
  time?: string;
  image: any;
}

const HomeScreen: React.FC = () => {
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [myEvents, setMyEvents] = useState([]);
  const [profileData, setProfileData] = useState<{ fullName: string; profileImage: string }>({
    fullName: '',
    profileImage: '',
  });
  const router = useRouter();

  const loadProfileData = async () => {
    try {
      const storedProfileData = await AsyncStorage.getItem('profileData');
      if (storedProfileData) {
        setProfileData(JSON.parse(storedProfileData));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
      console.error('Error loading profile data:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await axios.get(PEXELS_API_URL, {
        headers: {
          Authorization: API_KEY,
        },
        params: {
          query: PEXELS_API_QUERY,
          per_page: 10,
        },
      });
      const fetchedImages = response.data.photos.map((photo: any) => ({
        uri: photo.src.medium,
      }));
      setImages(fetchedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  // load RSVP'd events (My Upcoming Events) from AsyncStorage
  const loadMyEvents = async () => {
    try {
      const myEventsData = await AsyncStorage.getItem(MY_EVENTS_STORAGE_KEY);
      if (myEventsData) {
        setMyEvents(JSON.parse(myEventsData));
      }
    } catch (error) {
      console.error('Failed to load RSVP’d events:', error);
    }
  };

  // Handle event press to navigate to the ViewEvent screen
  const handleEventPress = (event: Event) => {
    router.push({
      pathname: '/viewEvent',
      params: { event: JSON.stringify(event) },
    });
  };

  // Fetch images and load events when the screen mounts
  useEffect(() => {
    const loadProfileData = async () => {
      try {
          const savedData = await AsyncStorage.getItem('profileData');
          if (savedData) {
              const parsedData = JSON.parse(savedData);
              setProfileData(parsedData);
          }
      } catch (err) {
          console.error('Error loading profile data', err);
      }
    };
    loadProfileData();
    fetchImages();
    loadMyEvents();
  }, []);

  // Reload events whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadMyEvents();
    }, [])
  );

  // Render an event item
  const renderEvent = (event: Event) => (
    <TouchableOpacity key={event.id} onPress={() => handleEventPress(event)} style={styles.eventContainer}>
      <ImageBackground
        source={event.image}
        style={styles.backgroundImage}
        resizeMode='cover'
      >
        <View style={styles.eventContent}>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventDate}>{event.date}</Text>
          <Text style={styles.arrow}>›</Text> 
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('../../assets/images/simple-background.jpg')} style={styles.bodyBackgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>

          {/* Display Username and Profile Picture */}
          <Text style={styles.username}>{profileData.fullName || 'User'}</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
                <Image
                    source={
                        profileData.profileImage
                            ? { uri: profileData.profileImage }
                            : require('../../assets/images/profile.png')
                    }
                    style={styles.profilePic}
                />
            </TouchableOpacity>
        </View>

        {/* Display Current Location */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Current Location: Bothell, WA</Text>
          <TouchableOpacity><Text style={styles.changeLink}>Change</Text></TouchableOpacity>
        </View>

        {/* Display Nearby Events */}
        <View style={styles.nearbyEventsContainer}>
          <Text style={styles.upcomingEventsHeader}>What's Happening Nearby?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((image, index) => (
              <Image key={`image-${index}`} source={{ uri: image.uri }} style={styles.carouselImage} />
            ))}
          </ScrollView>
        </View>

        {/* Display User's Upcoming Events */}
        <Text style={styles.upcomingEventsHeader}>My Upcoming Events</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {myEvents.length > 0 ? myEvents.map(event => renderEvent(event))
            : <Text style={styles.noEventsText}>No events in your list</Text>}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 30, 
  },
  bodyBackgroundImage: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  username: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  profilePic: { 
    width: 40, 
    height: 40, 
    borderRadius: 20 
  },
  locationContainer: { 
    marginVertical: 20 
  },
  locationText: { 
    fontSize: 16, 
    fontStyle: 'italic' 
  },
  changeLink: { 
    color: 'blue', 
    textDecorationLine: 'underline' 
  },
  nearbyEventsContainer: { 
    marginVertical: 2 
  },
  imageScroll: { 
    marginVertical: 10 
  },
  carouselImage: { 
    width: 150, 
    height: 150, 
    borderRadius: 10, 
    marginRight: 10 
  },
  upcomingEventsHeader: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginVertical: 10 
  },
  eventContainer: { 
    marginVertical: 5, 
    height: EVENT_LIST_ITEM_HEIGHT, 
    overflow: 'hidden', 
    borderRadius: 10 
  },
  backgroundImage: { 
    width: '100%', 
    height: EVENT_LIST_ITEM_HEIGHT, 
    justifyContent: 'center', 
    borderRadius: 10 
  },
  eventContent: { 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10, 
    borderRadius: 10, 
    height: EVENT_LIST_ITEM_HEIGHT 
  },
  eventDate: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  arrow: { 
    fontSize: 34, 
    color: '#fff', 
    position: 'absolute', 
    right: 10, 
    alignSelf: 'center'
  },
  eventName: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  noEventsText: { 
    textAlign: 'center', 
    marginVertical: 10, 
    fontStyle: 'italic', 
    color: '#888' 
  },
  rsvpButton: { 
    marginTop: 10, 
    backgroundColor: '#007AFF', 
    padding: 5, 
    borderRadius: 5 
  },
  buttonText: { 
    color: 'white', 
    textAlign: 'center' 
  },
});

export default HomeScreen;