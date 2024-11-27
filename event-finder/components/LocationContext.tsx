import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
   latlong: string | null;
   city: string;
   state: string;
   setLocation: (latlong: string | null, city: string, state: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);


interface LocationProviderProps {
   children: React.ReactNode; 
 }
export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
   const [latlong, setLatLong] = useState<string | null>(null);
   const [city, setCity] = useState<string>('Unknown City');
   const [state, setState] = useState<string>('Unknown State');

   const setLocation = (latlong: string | null, city: string, state: string) => {
      setLatLong(latlong);
      setCity(city);
      setState(state);
   }

  return (
    <LocationContext.Provider value={{ latlong, city, state, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = (): LocationContextType => {
   const context = useContext(LocationContext);
   if (!context) {
      throw new Error('useLocation must be used within a LocationProvider');
   }
   return context;
}