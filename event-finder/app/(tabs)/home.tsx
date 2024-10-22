import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { events } from '../../assets/data/eventData';

const HomeScreen: React.FC = () => {
  const router = useRouter();

  // Function to pass event data to the viewEvent page
  const handleEventPress = (event: { date: string; name: string; description: string; image: any }) => {
    router.push({
      pathname: '/viewEvent', 
      params: { event: JSON.stringify(event) }, 
    });
  };

  // Rendering each event in the list
  const renderEvent = ({ item }: { item: { date: string; name: string; description: string; image: any } }) => (
    <TouchableOpacity key={item.name} onPress={() => handleEventPress(item)} style={styles.eventContainer}>
      <Text style={styles.eventDate}>{item.date}</Text>
      <View style={styles.eventDetails}>
        <Text style={styles.eventName}>{item.name}</Text>
        <Text style={styles.eventDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const imageSource = require('../../assets/images/icon.png');
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>Username</Text>
        <Image
          // source={require('../../assets/images/icon.png')} // Adjust the path based on your assets structure
          source={imageSource}
          style={styles.profilePic}
        />
      </View>
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>Current Location: Hardcoded Location</Text>
        <TouchableOpacity>
          <Text style={styles.changeLink}>Change</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        {events.map((event, index) => (
          // <Image key={`image-${index}`} source={require('../../assets/images/icon.png')} style={styles.carouselImage} />
          <Image key={`image-${index}`} source={imageSource} style={styles.carouselImage} />
        ))}
      </ScrollView>
      <Text style={styles.upcomingEventsHeader}>My Upcoming Events</Text>
      <ScrollView>
        {events.map((event, index) => renderEvent({ item: event }))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
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
  },
  changeLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  imageScroll: {
    marginVertical: 10,
  },
  carouselImage: {
    width: 200, // Adjust as necessary
    height: 200, // Adjust as necessary
    borderRadius: 10,
    marginRight: 10,
  },
  upcomingEventsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  eventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
  },
  eventDate: {
    width: '20%', 
    fontWeight: 'bold',
  },
  eventDetails: {
    marginLeft: 10,
    width: '80%', 
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDescription: {
    fontSize: 14,
  },
});

export default HomeScreen;
