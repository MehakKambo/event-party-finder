# event-party-finder
### Team Members
- Angelo Williams  
- Mehak Kambo  
- Michael Sun

### List of features needed for the MVP + Breakdown of tasks

*Home screen*
- Fetch event object data from database
- Make profile editable (requires a profile screen)
- Make location editable

*ViewEvent screen*
- Fetch user-booked event object data from database
- Add new event from user’s booked list
- Remove an event from user’s booked list

*FindEvent screen*
- Fetch added events that the user hasn’t booked
- Handle ‘no results found’ scenario
- Cache result data that has already been shown


### Mapping between features and value(s) to be delivered by your app (justification)

- Users can easily and quickly explore events through navigation links from both the Home and FindEvents screens
- Splitting events into two distinct sections on the homeScreen helps users distinguish between events they have/have not booked
- Fetching data once and storing locally allows a smoother experience, improving performance (rather than constant making endpoint calls)
- ViewEvent screen has all the user-booked events in one place without the need to toggle back and forth between multiple screens; users can navigate, add, and remove events
