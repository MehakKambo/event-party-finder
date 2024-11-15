import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface FavoriteIconProps {
  isFavorited: boolean;
  onPress: () => void;
}

export const FavoriteIcon: React.FC<FavoriteIconProps> = ({ isFavorited, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Ionicons
        name={isFavorited ? "star" : "star-outline"}
        size={28}
        color={isFavorited ? "gold" : "grey"}
      />
    </TouchableOpacity>
  );
};

// Usage within an event component:
export const EventItem: React.FC<{ event: any }> = ({ event }) => {
  const [isFavorited, setIsFavorited] = useState(event.isFavorited);

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // Persist favorite status in AsyncStorage or your backend
  };

  return (
    <FavoriteIcon isFavorited={isFavorited} onPress={toggleFavorite} />
  );
};
