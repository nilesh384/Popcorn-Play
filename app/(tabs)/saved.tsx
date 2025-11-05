import MovieCard from '@/Components/MovieCard';
import { icons } from '@/constants/icons';
import { useAuth } from '@/services/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { Redirect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSavedMovies } from '../../services/appwrite';

const Saved = () => {
  const { user, isLoading } = useAuth();
  const [savedMovies, setSavedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchSavedMovies = async () => {
        if (user) {
          setLoading(true);
          const res = await getSavedMovies(user.$id);
          setSavedMovies(res);
          setLoading(false);
        }
      };

      fetchSavedMovies();
    }, [user])
  );

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-primary">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Redirect href="/auth/Login" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 bg-primary px-3 pt-5">
      <FlatList
        data={savedMovies}
        keyExtractor={(item) => item.$id}
        numColumns={3}
        contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 8 }}
        columnWrapperStyle={{ 
          justifyContent: 'space-between', 
          marginVertical: 8,
        }}
        
        renderItem={({ item }) => (
          <MovieCard
            id={item.movie_id}
            poster_path={item.poster_url}
            title={item.title}
            vote_average={item.vote_average}
            release_date={item.release_date}
            media_type={item.media_type}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center mt-10">
              <Image source={icons.save} className="w-16 h-16 mb-4" />
              <Text className="text-white text-center">No saved movies yet.</Text>
            </View>
          ) : null
        }
      />
    </View>
    </SafeAreaView>
  );
};

export default Saved;
