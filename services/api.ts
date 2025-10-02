import Constants from 'expo-constants';

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: Constants.expoConfig?.extra?.expoPublicMovieApiKey,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${Constants.expoConfig?.extra?.expoPublicMovieApiKey}`,
  },
};

export const fetchAll = async ({
  query,
  page = 1,
  media_type = "all",
}: {
  query: string;
  page?: number;
  media_type?: "all" | "movie" | "tv";
}) => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=true&page=${page}`
    : `${TMDB_CONFIG.BASE_URL}/trending/${media_type}/week?page=${page}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();

    const filteredResults = data.results
      ?.filter(
        (item: any) => item.media_type === "movie" || item.media_type === "tv"
      )
      ?.sort((a: any, b: any) => (b.popularity ?? 0) - (a.popularity ?? 0)); // DESC order

    return { ...data, results: filteredResults };
  } catch (error) {
    console.error("Error fetching search data:", error);
    throw error;
  }
};

export const fetchAllPersons = async ({
  query,
  page = 1,
}: {
  query: string;
  page?: number;
}) => {
  const endpoint = `${TMDB_CONFIG.BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=true&page=${page}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();

    const filteredResults = data.results
      ?.filter((item: any) => item.media_type === "person")
      ?.sort((a: any, b: any) => (b.popularity ?? 0) - (a.popularity ?? 0)); // DESC order

    return { ...data, results: filteredResults };
  } catch (error) {
    console.error("Error fetching search data:", error);
    throw error;
  }
};

export const fetchMediaDetails = async (
  id: string,
  type: "movie" | "tv"
): Promise<MovieDetails> => {
  try {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/${type}/${id}`, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    const errText = await error?.response?.text?.();
    console.log("Fetch failed:", errText || error);
    throw error;
  }
};

export const fetchTrailer = async (id: string, type: "movie" | "tv") => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/${type}/${id}/videos?language=en-US`,
      {
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    const data = await response.json();
    return data.results || []; // safely return array
  } catch (err) {
    console.error("Trailer fetch failed:", err);
    return [];
  }
};

export const fetchWatchProviders = async (id: string, type: "movie" | "tv") => {
  try {
    const res = await fetch(
      `${TMDB_CONFIG.BASE_URL}/${type}/${id}/watch/providers`,
      {
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!res.ok) throw new Error("Failed to fetch providers");

    const data = await res.json();
    const providerInfo = data.results?.["IN"] || data.results?.["US"];

    if (!providerInfo) return { link: "", flatrate: [], buy: [], rent: [] };

    return {
      link: providerInfo.link,
      flatrate: providerInfo.flatrate || [],
      buy: providerInfo.buy || [],
      rent: providerInfo.rent || [],
    };
  } catch (err) {
    console.error("Watch provider fetch failed:", err);
    return { link: "", flatrate: [], buy: [], rent: [] };
  }
};

export const fetchCredits = async (id: string, type: "movie" | "tv") => {
  try {
    const res = await fetch(`${TMDB_CONFIG.BASE_URL}/${type}/${id}/credits`, {
      headers: TMDB_CONFIG.headers,
    });

    if (!res.ok) throw new Error("Failed to fetch credits");

    const data = await res.json();
    return data.cast || [];
  } catch (err) {
    console.error("Credits fetch failed:", err);
    return [];
  }
};

export const fetchMediaImages = async (id: string, type: "movie" | "tv") => {
  try {
    const res = await fetch(`${TMDB_CONFIG.BASE_URL}/${type}/${id}/images`, {
      headers: TMDB_CONFIG.headers,
    });

    if (!res.ok) throw new Error("Failed to fetch images");

    const data = await res.json();
    return data.posters || [];
  } catch (err) {
    console.error("Images fetch failed:", err);
    return [];
  }
};

export const fetchPersonDetails = async (personId: string) => {
  try {
    const res = await fetch(
      `${TMDB_CONFIG.BASE_URL}/person/${personId}?language=en-US`,
      {
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!res.ok) throw new Error("Failed to fetch person details");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Person details fetch failed:", err);
    return null;
  }
};

export const fetchPersonPictures = async (personId: string) => {
  try {
    const res = await fetch(
      `${TMDB_CONFIG.BASE_URL}/person/${personId}/images`,
      {
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!res.ok) throw new Error("Failed to fetch person pictures");

    const data = await res.json();
    return data.profiles || [];
  } catch (err) {
    console.error("Person pictures fetch failed:", err);
    return [];
  }
};

export const fetchPersonOtherMovies = async (personId: string) => {
  try {
    const res = await fetch(
      `${TMDB_CONFIG.BASE_URL}/person/${personId}/movie_credits`,
      {
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!res.ok) throw new Error("Failed to fetch person's movies");

    const data = await res.json();
    return data.cast.map((movie: any) => ({
      id: movie.id,
      title: movie.title || movie.original_title || "Untitled",
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      media_type: "movie",
      character: movie.character,
    }));
  } catch (err) {
    console.error("Person's movies fetch failed:", err);
    return [];
  }
};

export const fetchPersonTvCredits = async (
  personId: string
): Promise<PersonTvCredit[]> => {
  try {
    const res = await fetch(
      `${TMDB_CONFIG.BASE_URL}/person/${personId}/tv_credits`,
      {
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!res.ok) throw new Error("Failed to fetch person's TV credits");

    const data = await res.json();

    return data.cast.map((show: any) => ({
      id: show.id,
      name: show.name || show.original_name || "Untitled",
      poster_path: show.poster_path,
      vote_average: show.vote_average,
      first_air_date: show.first_air_date,
      character: show.character,
      media_type: "tv",
    }));
  } catch (err) {
    console.error("TV credits fetch failed:", err);
    return [];
  }
};

export const getGenres = async (type: "movie" | "tv") => {
  try {
    const res = await fetch(`${TMDB_CONFIG.BASE_URL}/genre/${type}/list`, {
      headers: TMDB_CONFIG.headers,
    });

    if (!res.ok) throw new Error("Failed to fetch genres");

    const data = await res.json();
    return data.genres || [];
  } catch (err) {
    console.error("Genres fetch failed:", err);
    return [];
  }
};

export const fetchLists = async ({
  type = "movie",
  movieList = "popular",
  tvList = "popular",
  page = 1,
}: {
  type: "movie" | "tv";
  movieList?: "popular" | "top_rated" | "upcoming" | "now_playing";
  tvList?: "popular" | "top_rated" | "on_the_air" | "airing_today";
  page?: number;
}) => {
  const list = type === "movie" ? movieList : tvList;

  try {
    const res = await fetch(
      `${TMDB_CONFIG.BASE_URL}/${type}/${list}?page=${page}`,
      {
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!res.ok) throw new Error("Failed to fetch lists");

    const data = await res.json();
    return Array.isArray(data.results) ? data.results : [];
  } catch (err) {
    console.error("Lists fetch failed:", err);
    return [];
  }
};

export const fetchTvSeasonDetails = async (
  id: string,
  seasonNumber: number
): Promise<any> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${id}/season/${seasonNumber}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    const errText = await error?.response?.text?.();
    console.log("Fetch failed:", errText || error);
    throw error;
  }
}
