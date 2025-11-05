import MovieCard from "@/Components/MovieCard";
import SearchBar from "@/Components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchAll, fetchAllPersons } from "@/services/api";
import { updateSeachCount } from "@/services/appwrite";
import { useAuth } from "@/services/AuthContext";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableHighlight,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
  const { user, isLoading } = useAuth();

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Redirect href="/auth/Login" />;
  }

  const [searchQuery, setSearchQuery] = useState("");
  // Define a union type for Movie or Person
  type SearchResult = Movie & { media_type: string } | { id: number; name: string; profile_path?: string; media_type: "person" };

  const [movies, setMovies] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const [mediaType, setMediaType] = useState<"entertainment" | "person">("entertainment");

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          setLoading(true);
          setError(null);
          if (mediaType === "entertainment") {
            const data = await fetchAll({ query: searchQuery });
            setMovies(data.results || []);
          } else {
            const data = await fetchAllPersons({ query: searchQuery });
            setMovies(data.results || []);
          }
          
        } catch (err: any) {
          setError(err);
        } finally {
          setLoading(false);
        }
      } else {
        setMovies([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, mediaType]);

  // Optional: log to Appwrite
  useEffect(() => {
    if (searchQuery.trim() && movies.length > 0) {
      const firstMovie = (movies[0] as any).media_type === "movie" || (movies[0] as any).media_type === "tv"
        ? movies[0] as Movie
        : undefined;
      updateSeachCount(
        searchQuery,
        firstMovie,
        (movies[0] as any).media_type === "movie" || (movies[0] as any).media_type === "tv"
          ? (movies[0] as any).media_type
          : "movie"
      );
    }
  }, [movies]);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="bg-primary flex-1">
      <Image source={images.bg} className="absolute w-full h-full z-0" />

      <FlatList
        className="flex-1 px-3"
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginVertical: 8,
        }}
        contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 8 }}
        scrollEnabled={true}
        ListHeaderComponent={
          <View>
            <Image
              source={images.logo_2}
              className="w-96 h-60 z-10 mt-16 -mb-20 self-center"
              resizeMode="contain"
            />
            {mediaType === "entertainment" ? (
              <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search  movies / tv shows .."
            />
            ):(
              <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for people .."
            />
            )}
              
              <View className="flex-row mt-4 justify-center">
                <TouchableHighlight
                  onPress={() => setMediaType("entertainment")}
                  className={`px-3 py-1 rounded-xl ${
                    mediaType === "entertainment"
                      ? "bg-accent"
                      : "bg-secondary"
                  }`}
                  underlayColor="#ccc"
                >
                  <Text className="text-white">Entertainment</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  onPress={() => setMediaType("person")}
                  className={`px-3 py-1 rounded-xl ml-2 ${
                    mediaType === "person" ? "bg-accent" : "bg-secondary"
                  }`}
                  underlayColor="#ccc"
                >
                  <Text className="text-white">Person</Text>
                </TouchableHighlight>
              </View>
            {loading && (
              <ActivityIndicator
                size="large"
                color="#00f"
                className="mt-10 self-center"
              />
            )}
            {error && (
              <Text className="text-red-500 text-center mt-5">
                Error: {error.message}
              </Text>
            )}
            {!loading && !error && searchQuery.trim() && movies.length > 0 && (
              <Text className="text-white text-base font-bold mt-5 mb-3">
                Search results for:
                <Text className="text-accent text-lg font-bold">
                  {"  " + searchQuery}
                </Text>
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => {

          if (item.media_type === "person") {
            return (
              <TouchableHighlight
                onPress={() => router.push(`/people/${item.id}`)}
                className="mb-8 w-28"
                underlayColor="transparent"
              >
                <View className="items-center">
                  <Image
                    source={{
                      uri: "profile_path" in item && item.profile_path
                        ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
                        : "https://via.placeholder.com/185x278?text=No+Image",
                    }}
                    className="w-[7.5rem] h-44 rounded-xl mb-2"
                    resizeMode="cover"
                  />
                  <Text className="text-white text-center text-xs font-semibold mt-1" numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>
              </TouchableHighlight>

            );
          }

          return (
            <MovieCard
              id={item.id}
              poster_path={
                item.media_type === "movie" || item.media_type === "tv"
                  ? (item as Movie).poster_path || ""
                  : ""
              }
              title={"title" in item ? item.title || "Untitled" : item.name || "Untitled"}
              vote_average={"vote_average" in item ? item.vote_average : 0}
              release_date={
                "release_date" in item
                  ? item.release_date || (item as any).first_air_date || ""
                  : ""
              }
              media_type={item.media_type === "movie" || item.media_type === "tv" ? item.media_type : "movie"} // Default to 'movie' if not provided
            />
          );
        }}
        ListEmptyComponent={
          !loading && !error && searchQuery.trim() ? (
            <View>
              <Image
                source={icons.search}
                className="w-24 h-24 self-center mt-10"
                resizeMode="contain"
              />
              <Text className="text-white text-center mt-5">
                No results found for "{searchQuery}"
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
    </SafeAreaView>
  );
}
