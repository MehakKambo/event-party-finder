export interface EventDetails {
   id: number;
   date: string;
   name: string;
   location: string;
   description: string;
   time?: string;
   image: any;
   url: string;
   venue?: {
     name: string;
     address: {
       line1: string;
     };
     city: {
       name: string;
     };
     state: {
       stateCode: string;
     };
     country: {
       name: string;
     };
   };
   isFavorited?: boolean
 }