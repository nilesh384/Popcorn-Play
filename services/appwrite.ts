import { Account, Client, Databases, ID, Query } from "appwrite";
import Constants from 'expo-constants';

// Define the SavedMovie type if not already defined or imported
export type SavedMovie = {
  $id: string;
  userId: string;
  movie_id: number;
  title: string;
  poster_url: string;
  vote_average: number;
  release_date: string;
  media_type: "movie" | "tv";
};

// track the searches made by a user

const DATABASE_ID = Constants.expoConfig?.extra?.expoPublicAppwriteDatabaseId!;
const TRENDING_COLLECTION_ID =
  Constants.expoConfig?.extra?.expoPublicAppwriteCollectionIdTrending!;
const SAVED_COLLECTION_ID =
  Constants.expoConfig?.extra?.expoPublicAppwriteCollectionIdSaved!;

const client = new Client();
client
  .setEndpoint(Constants.expoConfig?.extra?.expoPublicAppwriteEndpoint!)
  .setProject(Constants.expoConfig?.extra?.expoPublicAppwriteProjectId!);

const databases = new Databases(client);

export const updateSeachCount = async (
  query: string,
  movie: Movie | undefined,
  type: "movie" | "tv" // 👈 Accept type
) => {
  if (!query.trim() || !movie) return;

  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      TRENDING_COLLECTION_ID,
      [Query.equal("searchTerm", query)]
    );

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await databases.updateDocument(
        DATABASE_ID,
        TRENDING_COLLECTION_ID,
        existingMovie.$id,
        {
          count: (existingMovie.count || 0) + 1,
        }
      );
    } else {
      const rawTitle = type === "movie" ? movie.title : movie.name;
      const title = rawTitle?.trim() || "Untitled"; // fallback if missing or empty
      const poster_url = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "";
      const vote_average = movie.vote_average || 0;

      await databases.createDocument(
        DATABASE_ID,
        TRENDING_COLLECTION_ID,
        ID.unique(),
        {
          searchTerm: query,
          movie_id: movie.id,
          count: 1,
          title,
          poster_url,
          vote_average,
          media_type: type,
        }
      );
    }
  } catch (error) {
    console.error("❌ Appwrite Error:", error);
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      TRENDING_COLLECTION_ID,
      [Query.limit(10), Query.orderDesc("count")]
    );
    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error("❌ Error fetching trending movies:", error);
    return undefined;
  }
};

export const saveMovieToDB = async (
  userId: string,
  movie: {
    id: number;
    title: string;
    poster_url: string;
    vote_average: number;
    release_date: string; // should be ISO string
    media_type: "movie" | "tv";
  }
) => {
  try {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [Query.equal("userId", userId), Query.equal("movie_id", movie.id)]
    );

    if (existing.total > 0) {
      return;
    }

    await databases.createDocument(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        movie_id: movie.id,
        title: movie.title,
        poster_url: movie.poster_url,
        vote_average: movie.vote_average,
        release_date: new Date(movie.release_date).toISOString(),
        media_type: movie.media_type,
      }
    );
  } catch (error) {
    console.error("❌ saveMovieToDB error:", error);
    throw error;
  }
};

export const getSavedMovies = async (userId: string) => {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    return res.documents.sort((a, b) => {
      const dateA = new Date(a.$createdAt).getTime();
      const dateB = new Date(b.$createdAt).getTime();
      return dateB - dateA; // Sort by release_date descending
    }) as unknown as SavedMovie[];
  } catch (error) {
    console.error("❌ getSavedMovies error:", error);
    return [];
  }
};

export const checkIfSaved = async (
  userId: string,
  movie_id: number
): Promise<boolean> => {
  const result = await databases.listDocuments(
    DATABASE_ID,
    SAVED_COLLECTION_ID,
    [Query.equal("userId", userId), Query.equal("movie_id", movie_id)]
  );

  return result.total > 0;
};

export const deleteSavedMovie = async (
  userId: string,
  movie_id: number
): Promise<void> => {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [Query.equal("userId", userId), Query.equal("movie_id", movie_id)]
    );

    if (result.total > 0) {
      const documentId = result.documents[0].$id;
      await databases.deleteDocument(
        DATABASE_ID,
        SAVED_COLLECTION_ID,
        documentId
      );
    } else {
      console.log(`⚠️ No saved movie found for ID ${movie_id}.`);
    }
  } catch (error) {
    console.error("❌ deleteSavedMovie error:", error);
  }
};

export const account = new Account(client);
