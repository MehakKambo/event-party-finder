export interface EventDetails {
  id: string;
  date: string;
  name: string;
  location?: string; 
  description: string;
  time?: string;
  image: {
    uri: string;
  };
  url: string;
  generalInfo?: {
    generalRule?: string;
    childRule?: string;
  };
  venue?: {
    id: string;
    name: string;
    address?: {
      line1?: string;
    };
    city?: {
      name?: string;
    };
    state?: {
      stateCode?: string;
      name?: string;
    };
    country?: {
      name?: string;
      countryCode?: string;
    };
    postalCode?: string;
    location?: {
      latitude?: string;
      longitude?: string;
    };
    accessibleSeatingDetail?: string;
    boxOfficeInfo?: {
      acceptedPaymentDetail?: string;
      openHoursDetail?: string;
      willCallDetail?: string;
    };
    parkingDetail?: string;
    timezone?: string;
    generalInfo?: {
      generalRule?: string;
      childRule?: string;
    };
    distance?: number;
    url?: string;
  };
  isFavorited?: boolean;
}