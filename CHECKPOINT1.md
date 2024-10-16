# Event Party Finder

### Team Members
- Angelo Williams  
- Mehak Kambo  
- Michael Sun

### Version #1  

---

## Summary of Project
Stay connected to local events with our Event Party Finder app, designed to simplify event discovery and management. With over 70% of event-goers relying on mobile apps to plan outings, our app offers a seamless way to explore, track, and create events. Integrated maps and intuitive management tools keep you informed in real-time, while empowering organizers to easily reach their local community.

---

## Project Analysis

### Value Proposition
The Event Party Finder App makes it easier for people to discover and join events by consolidating everything in one place. Platforms like Facebook or Eventbrite can feel cluttered, mixing event info with random posts, making it difficult to find relevant events. Many people miss out on local events, especially in smaller communities where events aren’t well-promoted. 

This app addresses that by providing GPS-based recommendations tailored to the user’s location. It eliminates the fear of missing out by offering a clean interface for event discovery and management. Users can easily plan with friends through streamlined event coordination tools without switching between group chats or apps.

### Primary Purpose
The main goal of the Event Party Finder App is to connect people with social activities that matter to them. Whether it’s a concert, food festival, or a casual gathering, the app helps users find, coordinate, and plan events seamlessly. Event-goers get personalized event suggestions, while hosts can promote their events and manage RSVPs. Ultimately, the app fosters social connections by making event planning more accessible.

### Target Audience
This app is geared towards young adults, especially students and people in their 20s and 30s, who actively attend events such as concerts, festivals, and community gatherings. They enjoy spontaneous plans and value staying connected with friends. 

We plan to promote the app on platforms like Instagram and TikTok, where our target audience spends most of their time. Partnerships with universities, community groups, and event organizers will also help us grow our user base.

### Success Criteria
Success will be measured by active app usage, event listings, and engagement. Key metrics include:
- Number of events listed  
- RSVPs made  
- Invitations shared  

User feedback through in-app surveys and ratings will provide insights into what’s working and what needs improvement. Our goal is to make the app a go-to tool for social planning.

---

## Competitor Analysis
Our main competitors are **Facebook Events**, **Eventbrite**, and **Meetup**. Each has its strengths but also limitations:
- **Facebook**: Too much content noise, making event discovery hard.  
- **Eventbrite**: Focused on large-scale events, not casual gatherings.  
- **Meetup**: Emphasis on recurring activities rather than spontaneous plans.  

Our app stands out by offering GPS-based event discovery, seamless social features, and support for smaller, casual events. It’s designed to be personal, user-friendly, and ideal for spontaneous planning.

---

## Monetization Model
To promote accessibility, our app will remain free. To cover maintenance costs, users may pay a subscription or one-time fee to boost their events in the recommendation algorithm, ensuring wider reach.

---

## Initial Design

### UI/UX Design
- The UI is simple and focused on ease of use, offering users access to search, event thumbnails, and their list of booked events.

- The Event View screen displays key details like time, location (with possible map integration), and allows users to add or remove events with a single tap. For events they've created, an update button is also available.

- The Find Screen features a map that helps users visualize local events, with custom pins/icons distinguishing app-created events from landmarks. Event image links are displayed to represent search results.

- The Create Event Screen uses a straightforward form to capture event name, time, location, and relevant details. The Edit Screen mirrors the Create Screen, prepopulating fields for easy modification or deletion.


### Technical Architecture
The most challenging portion of an MVP for our app is the support for finding events that are near the user’s current location, which requires use of the device’s location services. In addition, most of the data used by the app, such as the user-submitted events and user profiles, can be stored in the cloud rather than on local storage to reduce the size of our app. All of these features are covered by various React Native APIs (e.g. Geolocation, authentication, etc.). The details of each event and user profiles can be represented by JSON objects, which can be easily parsed after they are retrieved from the cloud.

The success of our app will primarily be measured by the size of its user base and the number of events that are added to our app on a regular basis (e.g. measured weekly, monthly, etc.).


---

## Challenges and Open Questions
One of the primary concerns I have for this app is security in the authentication process; if we decide to create an account system where users must log in to view their profile and use the app, what are some of the tools that we can use to store that user information and ensure it is secure at all times? In addition, implementing the feature of displaying nearby events based on user location requires extensive use of location services, which may be difficult to maintain in areas with poor mobile reception or with older devices that may have compatibility issues with newer APIs. 

To address this issue, we will use APIs and tools that are designed to be backward compatible and relatively lightweight so that they are less constrained by hardware and software limitations. Storage may also become an issue with user profiles and event details potentially taking up large amounts of space; however, this can be resolved by storing as much data as possible using a cloud storage service.

