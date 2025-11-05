import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useRef, useState } from "react";

import MovieCard from "@/Components/MovieCard";
import SkeletonMovieCard from "@/Components/SkeletonMovieCard";
import SkeletonTrendingCard from "@/Components/SkeletonTrendingCard";
import TrendingCard from "@/Components/TrendingCard";
import { images } from "@/constants/images";
import { fetchAll, fetchLists } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import { useAuth } from "@/services/AuthContext";
import useFetch from "@/services/useFetch";
import { router } from "expo-router";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {

  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [selectedMovieList, setSelectedMovieList] = useState<'popular' | 'upcoming' | 'top_rated' | 'now_playing'>('popular');
  const [selectedTvList, setSelectedTvList] = useState<"popular" | "on_the_air" | "top_rated" | "airing_today">("popular");

  

  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const {
    data: trendingMovies,
    loading: loadingTrendingMovies,
    error: errorTrendingMovies,
    refetch: refetchTrendingMovies,
  } = useFetch(getTrendingMovies);

  const uniqueTrendingMovies = trendingMovies
    ? Array.from(new Map(trendingMovies.map((m) => [m.movie_id, m])).values())
    : [];

  const loadMovies = async (reset = false) => {
  try {
    const currentPage = reset ? 1 : page;
    let data;

    if (mediaType === "all") {
      const res = await fetchAll({ query: "", page: currentPage, media_type: "all" });
      data = res?.results ?? [];
    } else if (mediaType === "movie") {
      data = await fetchLists({
        type: "movie",
        movieList: selectedMovieList, 
        page: currentPage,
      });
    } else {
      data = await fetchLists({
        type: "tv",
        tvList: selectedTvList, 
        page: currentPage,
      });
    }

    if (reset) {
      setMovies(data);
    } else {
      setMovies((prev) => [...prev, ...data]);
    }

    setHasMore(data.length > 0);
    setPage(currentPage + 1);
  } catch (err) {
    console.error("Failed to load movies:", err);
  } finally {
    setInitialLoading(false);
    setLoadingMore(false);
    if (reset) setRefreshing(false);
  }
};



  useEffect(() => {
    loadMovies(true);
  }, [mediaType]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([refetchTrendingMovies?.(), loadMovies(true)]);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadMovies();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="bg-primary flex-1">
      <Image source={images.bg} className="absolute w-full h-full z-0" />


      <FlatList
        ListHeaderComponent={
          <>

            {user && (
              <TouchableOpacity onPress={() => { router.push("/profile") }} className="z-10 " >
                <Image
                  source={
                    user?.name
                      ? { uri: `https://api.dicebear.com/7.x/fun-emoji/png?seed=${user.name}` }
                      : { uri: "https://api.dicebear.com/7.x/fun-emoji/png?seed=default" }
                  }
                  className="w-10 h-10 rounded-full mb-6 absolute top-6 right-1 z-10 border-white border-2"
                  resizeMode="cover"

                />

              </TouchableOpacity>
            )}

            <Image
              source={images.logo_2}
              className="w-96 h-60 z-10 mt-16 self-center"
              resizeMode="contain"
            />

            {/* Trending */}
            <View className="mt-4">
              <Text className="text-lg text-white font-bold mb-3">
                Trending Movies
              </Text>
              {loadingTrendingMovies ? (
                <FlatList
                  horizontal
                  data={[...Array(6).keys()]}
                  keyExtractor={(item) => `skeleton-trending-${item}`}
                  renderItem={() => <SkeletonTrendingCard />}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 16 }}
                />
              ) : uniqueTrendingMovies.length > 0 ? (
                <FlatList
                  horizontal
                  data={uniqueTrendingMovies}
                  keyExtractor={(item, index) => `${item.movie_id}_${index}`}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} media_type={item.media_type === "movie" || item.media_type === "tv" ? item.media_type : "movie"} />
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 16 }}
                  className="mb-4"
                />
              ) : (
                <Text className="text-gray-400">No trending movies found.</Text>
              )}
            </View>

            <View className="flex-row mt-4 items-center justify-center gap-4">
              <TouchableHighlight
                onPress={() => setMediaType("all")}
                className={`px-3 py-1 rounded-xl ${mediaType === "all"
                  ? "bg-accent"
                  : "bg-secondary"
                  }`}
                underlayColor="#ccc"
              >
                <Text className="text-white text-lg">All</Text>
              </TouchableHighlight>

              <TouchableHighlight
                onPress={() => setMediaType("movie")}
                className={`px-3 py-1 rounded-xl ml-2 ${mediaType === "movie"
                  ? "bg-accent"
                  : "bg-secondary"
                  }`}
                underlayColor="#ccc"
              >
                <Text className="text-white text-lg">Movie</Text>
              </TouchableHighlight>
              <TouchableHighlight
                onPress={() => setMediaType("tv")}
                className={`px-3 py-1 rounded-xl ml-2 ${mediaType === "tv" ? "bg-accent" : "bg-secondary"
                  }`}
                underlayColor="#ccc"
              >
                <Text className="text-white text-lg">TV</Text>
              </TouchableHighlight>
            </View>

            {mediaType === "movie" && (
              <View className="mt-6">

                {/* Dropdown Selector */}
                <View className="bg-secondary/70 rounded-xl px-3 py-1 mx-6">
                  <Picker
                    selectedValue={selectedMovieList}
                    dropdownIconColor="white"
                    style={{ color: 'white' }}
                    onValueChange={async (itemValue) => {
                      setSelectedMovieList(itemValue);
                      setLoading(true);
                      setPage(1); // Reset page for new list
                      setHasMore(true); // Reset hasMore for new list

                      const listData = await fetchLists({
                        type: "movie",
                        movieList: itemValue,
                        page: page,
                      });

                      setMovies(Array.isArray(listData) ? listData : []);
                      setLoading(false);
                      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 }); // Smooth scroll
                    }}
                  >
                    <Picker.Item label="🔥 Popular" value="popular" />
                    <Picker.Item label="⭐ Top Rated" value="top_rated" />
                    <Picker.Item label="⏳ Upcoming" value="upcoming" />
                    <Picker.Item label="🎬 Now Playing" value="now_playing" />
                  </Picker>
                </View>
              </View>
            )}

            {mediaType === "tv" && (
              <View className="mt-6">

                {/* Dropdown Selector */}
                <View className="bg-secondary/70 rounded-xl px-3 py-1 mx-6">
                  <Picker
                    selectedValue={selectedTvList}
                    dropdownIconColor="white"
                    style={{ color: 'white' }}
                    onValueChange={async (itemValue) => {
                      setSelectedTvList(itemValue);
                      setLoading(true);
                      setPage(1); // Reset page for new list
                      setHasMore(true); // Reset hasMore for new list

                      const listData = await fetchLists({
                        type: "tv",
                        tvList: itemValue,
                        page: page,
                      });
                      const safeList = (data: any) => Array.isArray(data) ? data : [];
                      setMovies(safeList(listData));
                      setLoading(false);
                      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 }); // Smooth scroll
                    }}
                  >
                    <Picker.Item label="🔥 Popular" value="popular" />
                    <Picker.Item label="⭐ Top Rated" value="top_rated" />
                    <Picker.Item label="⏳ On the Air" value="on_the_air" />
                    <Picker.Item label="🎬 Airing Today" value="airing_today" />
                  </Picker>
                </View>
              </View>
            )}


          </>
        }
        scrollEnabled={true}
        data={movies}
        renderItem={({ item }) => {
          // Determine the correct media_type for MovieCard
          let cardMediaType: "movie" | "tv" = "movie";
          if (mediaType === "tv") cardMediaType = "tv";
          else if (mediaType === "movie") cardMediaType = "movie";
          else if ('media_type' in item && (item.media_type === "movie" || item.media_type === "tv")) cardMediaType = item.media_type;

          return (
            <MovieCard
              id={item.id}
              poster_path={item.poster_path}
              title={item.title || item.name || "Untitled"}
              vote_average={item.vote_average}
              release_date={item.release_date || item.first_air_date || ""}
              media_type={cardMediaType}
            />
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginVertical: 8,
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#fff" className="my-4" />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          initialLoading ? (
            <View className="flex-row flex-wrap justify-between">
              {[...Array(6).keys()].map((_, index) => (
                <SkeletonMovieCard key={`skeleton-latest-${index}`} />
              ))}
            </View>
          ) : (
            <Text className="text-gray-400 text-center">
              No latest movies found.
            </Text>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        className="px-5"
        removeClippedSubviews={true}
      />

      {(errorTrendingMovies) && (
        <Text className="text-red-500 text-center mt-5">
          {errorTrendingMovies.message}
        </Text>
      )}
    </View>
    </SafeAreaView>
  );
}