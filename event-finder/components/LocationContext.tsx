import React, { createContext, useContext, useState, ReactNode } from "react";
import * as Location from "expo-location";

interface LocationData {
  latlong: string | null;
  city: string;
  state: string;
  zipCode: string;
  setLocation: (data: Partial<LocationData>) => void;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationData | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [latlong, setLatlong] = useState<string | null>(null);
  const [city, setCity] = useState<string>("Unknown City");
  const [state, setState] = useState<string>("Unknown State");
  const [zipCode, setZipCode] = useState<string>("Unknown ZIP");

  const setLocation = (data: Partial<LocationData>) => {
    if (data.latlong !== undefined) setLatlong(data.latlong);
    if (data.city !== undefined) setCity(data.city);
    if (data.state !== undefined) setState(data.state);
    if (data.zipCode !== undefined) setZipCode(data.zipCode);
  };

  const refreshLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return; // Permission not granted, silently return
      }

      const locationData = await Promise.race([
        Location.getCurrentPositionAsync({}),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Location fetch timeout")), 5000)
        ),
      ]);

      const lat = locationData.coords.latitude;
      const lon = locationData.coords.longitude;

      setLatlong(`${lat},${lon}`);

      await fetchLocationFromLatLong(lat, lon);
    } catch (err) {
      // Error handling silently (no console.logs or alerts)
    }
  };

  const fetchLocationFromLatLong = async (lat: number, lon: number) => {
    const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEO_API_KEY;
    const apiURL = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`;
    try {
      const response = await fetch(apiURL);
      if (!response.ok) throw new Error("Invalid coordinates");
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const place = data.features[0].properties;
        setLocation({
          city: place.city || "Unknown City",
          state: place.state || "Unknown State",
          zipCode: place.postcode || "Unknown ZIP",
        });
      } else {
        throw new Error("No valid data found.");
      }
    } catch (err) {
      // Error handling silently (no console.logs or alerts)
    }
  };

  return (
    <LocationContext.Provider
      value={{
        latlong,
        city,
        state,
        zipCode,
        setLocation,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
