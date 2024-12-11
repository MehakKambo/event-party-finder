# **Eventify**

### Team Members
- Angelo Williams  
- Mehak Kambo  
- Michael Sun

---

## Summary of Project
Stay connected to local events with **Eventify**, designed to simplify event discovery and management. With over 70% of event-goers relying on mobile apps to plan outings, our app offers a seamless way to explore, track, and create events. Integrated maps and intuitive management tools keep you informed in real-time, while empowering organizers to easily reach their local community.

---

### Value Proposition
**Evenitfy** makes it easier for people to discover and join events by consolidating everything in one place. Platforms like Facebook or Eventbrite can feel cluttered, mixing event info with random posts, making it difficult to find relevant events. Many people miss out on local events, especially in smaller communities where events aren’t well-promoted. 

This app addresses that by providing recommendations tailored to the user’s preferences. It eliminates the fear of missing out by offering a clean interface for event discovery and management.

## App Challenges and Solutions

- **Sensor/Hardware Limitations**  
  The app utilizes GPS to fetch user coordinates but accounts for device permissions and hardware variability to ensure compatibility.

- **Communication Protocols**  
  - Leveraged the Ticketmaster API to fetch event data, ensuring real-time and accurate event details.  
  - Used Geoapify API for geocoding, enabling smooth conversions between coordinates and zip code, city, and state.

- **Caching Considerations**  
  Incorporated caching strategies to store frequent API responses locally, reducing unnecessary API calls and improving performance.

- **Security**  
  - User data is encoded in Base64 before being stored in Firebase Cloud Firestore.  
  - Firebase automatically encrypts all stored data, ensuring compliance with modern security standards.

- **Cross-Platform**  
  Built the app using React Native, ensuring consistent functionality and design across both iOS and Android platforms.

- **Scaling**  
  Utilized Firebase's NoSQL-like database (Firestore), which is designed for high scalability and can handle increasing data loads seamlessly.

- **Frameworks and Dependencies**  
  - **React Native**: Chosen for its cross-platform capabilities and robust ecosystem.  
  - **Firebase**: Used for authentication, database, and secure storage.  
  - **Geoapify API**: For geocoding and location-based functionalities.  
  - **Ticketmaster API**: For fetching real-time event data.

---