import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { events } from '../../assets/data/eventData';

// TODO: REPLACE PEXELS API CALL WHEN DATABASE IS SETUP
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';
const PEXELS_API_QUERY = 'travel'
// API key (temporary defined here for now) - Pexels
const API_KEY = 'FDpB5MVjr825gTIIOdfJuNlDNtNUzqCThfiU6beRg6hIWm8D1GBBVz7c';

// My Upcoming Events Height
const EVENT_LIST_ITEM_HEIGHT = 75;
// local image storage key
const IMAGES_STORAGE_KEY = 'storedImages'; 

const HomeScreen: React.FC = () => {
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const router = useRouter();

  
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

      // save locally (AsyncStorage)
      await AsyncStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(fetchedImages));
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  // load images from AsyncStorage or fetch them if not available
  const loadImages = async () => {
    try {
      const storedImages = await AsyncStorage.getItem(IMAGES_STORAGE_KEY);
      if (storedImages) {
        setImages(JSON.parse(storedImages));
      } else {
        // fetch if not already stored
        fetchImages();
      }
    } catch (error) {
      console.error('Error loading images from storage:', error);
    }
  };

  // on init, fetch the images (or retrieve from storage)
  useEffect(() => {
    loadImages();
  }, []);

  const handleEventPress = (event: { date: string; name: string; description: string; image: any }) => {
    router.push({
      pathname: '/viewEvent',
      params: { event: JSON.stringify(event) },
    });
  };

  const renderEvent = (event: { id: number, date: string; name: string; description: string; image: any }) => {
    return (
      <TouchableOpacity key={event.id} onPress={() => handleEventPress(event)} style={styles.eventContainer}>
        <ImageBackground 
          source={event.image} 
          style={styles.backgroundImage} 
          resizeMode='cover'
        >
          <View style={styles.eventContent}>
            <Text style={styles.eventDate}>{event.date}</Text>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/simple-background.jpg')} 
      style={styles.bodyBackgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.username}>Lotta B. Essen</Text>
          <Image
            source={require('../../assets/images/profile.png')}
            style={styles.profilePic}
          />
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Current Location: Bothell, WA</Text>
          <TouchableOpacity>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {images.map((image, index) => (
            <Image key={`image-${index}`} source={{ uri: image.uri }} style={styles.carouselImage} />
          ))}
        </ScrollView>
        <Text style={styles.upcomingEventsHeader}>My Upcoming Events</Text>
        <ScrollView>
          {events.map((event) => renderEvent(event))}
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
    justifyContent: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  locationContainer: {
    marginVertical: 20,
  },
  locationText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  changeLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  imageScroll: {
    marginVertical: 10,
  },
  carouselImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  upcomingEventsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  eventContainer: {
    marginVertical: 5,
    height: EVENT_LIST_ITEM_HEIGHT,
    overflow: 'hidden'
  },
  backgroundImage: {
    width: '100%',
    height: EVENT_LIST_ITEM_HEIGHT, 
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  eventContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    height: EVENT_LIST_ITEM_HEIGHT
  },
  eventDate: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDescription: {
    color: '#fff',
    fontSize: 14,
  },
});

export default HomeScreen;
