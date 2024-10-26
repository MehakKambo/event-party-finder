import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

// Sample events data
const upcomingEvents = [
    {
        id: 1,
        date: 'October 29, 2024',
        name: 'Fall Festival Celebration',
        description: 'Join us for the annual Fall Festival Celebration, where the community comes together to enjoy the changing leaves, seasonal food, music, and fun activities for all ages. This year’s festival features a pumpkin carving contest, live bands, local artisans selling handcrafted goods, and food trucks offering your favorite autumn treats. Don’t miss the evening bonfire and marshmallow roast!',
        time: '10:00 AM PDT',
        image: require('../../assets/images/event1.jpg'), // Placeholder image
    },
    {
        id: 2,
        date: 'November 3, 2024',
        name: 'Outdoor Movie Night',
        description: 'Experience the magic of cinema under the stars at our Outdoor Movie Night! Bring your blankets and lawn chairs to enjoy a family-friendly film on the big screen, with the cool autumn air adding to the cozy atmosphere. The event will feature pre-movie games for the kids, popcorn stands, and hot cocoa to keep you warm throughout the night. The featured movie will be announced closer to the date, so stay tuned!',
        time: '7:00 PM PDT',
        image: require('../../assets/images/event2.jpg'), // Placeholder image
    },
    {
        id: 3,
        date: 'November 5, 2024',
        name: 'Community Art Workshop',
        description: 'Unleash your creativity at the Community Art Workshop! This event is designed for artists of all skill levels who want to explore different mediums and techniques in a supportive and collaborative environment. Whether you’re into painting, sketching, sculpture, or mixed media, you’ll find something to inspire you. Local artists will provide guidance and demonstrations throughout the day, and all materials will be provided. Come and create something amazing!',
        time: '1:30 PM PDT',
        image: require('../../assets/images/event3.jpg'), // Placeholder image
    },
    {
        id: 4,
        date: 'November 10, 2024',
        name: 'Farmers Market Extravaganza',
        description: 'The Farmers Market Extravaganza returns with an exciting lineup of vendors, offering the freshest seasonal produce, homemade crafts, and local delicacies. Meet the farmers who grow your food and discover unique artisanal products that make perfect gifts for the holiday season. There will also be cooking demonstrations, live music, and a kids’ zone with face painting and pony rides. It’s a celebration of local culture and community spirit!',
        time: '9:00 AM PDT',
        image: require('../../assets/images/event4.jpg'), // Placeholder image
    },
    {
        id: 5,
        date: 'November 14, 2024',
        name: 'Book Lovers’ Social',
        description: 'Calling all bookworms! The Book Lovers’ Social is an event for those who cherish the written word. Join us for an evening of literary discussions, book swaps, and author readings. The event will feature a local authors’ panel where they will discuss their latest works, as well as a used book sale benefiting the local library. Whether you’re a fiction fanatic or a poetry enthusiast, you’re sure to enjoy this evening dedicated to literature.',
        time: '6:00 PM PDT',
        image: require('../../assets/images/event5.jpg'), // Placeholder image
    },
    {
        id: 6,
        date: 'November 20, 2024',
        name: 'Jazz Night at the Park',
        description: 'Enjoy an evening of smooth jazz under the stars at Jazz Night at the Park. This open-air concert will feature performances by renowned jazz musicians and local talents, creating a relaxing atmosphere perfect for a laid-back night out. Bring a picnic or grab dinner from one of the nearby food trucks and enjoy the music while sitting on the lawn. Don’t forget to bring a blanket or lawn chair for the ultimate experience!',
        time: '8:00 PM PDT',
        image: require('../../assets/images/event1.jpg'), // Placeholder image
    },
    {
        id: 7,
        date: 'November 25, 2024',
        name: 'Thanksgiving Potluck Feast',
        description: 'Celebrate the season of gratitude with your neighbors at the Thanksgiving Potluck Feast. Bring a dish to share, whether it’s a family favorite or something new, and enjoy a delicious meal in good company. The event will also feature a gratitude wall where attendees can share what they’re thankful for, as well as live folk music to set the mood. Everyone is welcome to come and celebrate together!',
        time: '5:00 PM PDT',
        image: require('../../assets/images/event2.jpg'), // Placeholder image
    },
    {
        id: 8,
        date: 'December 2, 2024',
        name: 'Winter Wonderland Craft Fair',
        description: 'Step into a winter wonderland at our annual Craft Fair, where local artisans and crafters showcase their handcrafted goods. From homemade holiday decorations and unique gifts to cozy winter apparel, you’ll find everything you need to get into the festive spirit. There will also be a hot chocolate station and gingerbread cookie decorating for the kids. It’s a perfect way to start the holiday season!',
        time: '11:00 AM PDT',
        image: require('../../assets/images/event3.jpg'), // Placeholder image
    },
    {
        id: 9,
        date: 'December 5, 2024',
        name: 'Holiday Lights Parade',
        description: 'Watch as the streets come alive with the glow of thousands of holiday lights during the Holiday Lights Parade! Floats, marching bands, and performers will light up the night as they make their way through downtown. Enjoy festive music, holiday-themed costumes, and a special appearance by Santa Claus. This beloved annual event is perfect for families and will leave everyone in the holiday spirit!',
        time: '6:30 PM PDT',
        image: require('../../assets/images/event4.jpg'), // Placeholder image
    },
    {
        id: 10,
        date: 'December 12, 2024',
        name: 'Gingerbread House Building Contest',
        description: 'Get your creativity flowing and participate in the Gingerbread House Building Contest! Teams of all ages are invited to create the most imaginative gingerbread houses, with prizes awarded for the most festive, most original, and best use of candy decorations. All materials will be provided, but participants are encouraged to bring extra goodies for embellishing their creations. Holiday cheer guaranteed!',
        time: '2:00 PM PDT',
        image: require('../../assets/images/event5.jpg'), // Placeholder image
    },
    {
        id: 11,
        date: 'December 15, 2024',
        name: 'Holiday Caroling in the Park',
        description: 'Join your neighbors for an evening of holiday caroling in the park. The event will feature a choir leading traditional holiday songs, as well as solo and group performances. Hot cider and cookies will be provided to keep everyone warm, and songbooks will be available for those who want to join in. It’s a great way to spread holiday cheer and connect with the community!',
        time: '7:00 PM PDT',
        image: require('../../assets/images/event1.jpg'), // Placeholder image
    },
    {
        id: 12,
        date: 'December 20, 2024',
        name: 'Winter Solstice Celebration',
        description: 'Celebrate the longest night of the year at the Winter Solstice Celebration! This unique event will feature a ceremonial bonfire, drumming circle, and guided meditation to welcome the return of the light. Guests are encouraged to dress warmly and bring a drum or percussion instrument if they’d like to join in. It’s a time to reflect, set intentions, and connect with nature as we embrace the winter season.',
        time: '4:30 PM PDT',
        image: require('../../assets/images/event2.jpg'), // Placeholder image
    }
];

interface Event {
    id: number;
    date: string;
    name: string;
    description: string;
    time?: string;
    image: any;
}

const FindEventsScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleEventPress = (event: Event) => {
        router.push({
            pathname: '/viewEvent',
            params: { event: JSON.stringify(event), source: 'findEvents' },
        });
    };

    // Filter events based on search query
    const filteredEvents = upcomingEvents.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for events in Bothell"
                    placeholderTextColor="#000000"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Events List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.eventsList}>
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <TouchableOpacity
                            key={event.id}
                            style={styles.eventItem}
                            onPress={() => handleEventPress(event)}
                        >
                            <View style={styles.dateContainer}>
                                <Text style={styles.dateText}>{event.date}</Text>
                            </View>
                            <View style={styles.detailsContainer}>
                                <Text style={styles.eventName}>{event.name}</Text>
                                {/* <Text style={styles.eventDescription}>{event.description}</Text> */}
                            </View>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noEventsText}>No events found</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        paddingTop: 20,
        paddingHorizontal: 15,
    },
    searchContainer: {
        marginTop: 30,
        marginBottom: 10,
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
        
    },
    eventsList: {
        paddingBottom: 20,
    },
    eventItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d3d3d3',
        borderRadius: 10,
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    dateContainer: {
        width: 65,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    detailsContainer: {
        flex: 1,
        paddingLeft: 10,
    },
    eventName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    eventDescription: {
        fontSize: 14,
        color: '#555',
    },
    arrow: {
        fontSize: 20,
        color: '#555',
    },
    noEventsText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginTop: 20,
    },
});

export default FindEventsScreen;
