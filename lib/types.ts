// WatchMode API response shapes (trimmed to what we actually use)

export interface SearchResult {
  id: number;
  name: string;
  year?: number;
  type: "movie" | "tv_series" | "tv_miniseries" | "tv_movie" | "short_film";
  imdb_id?: string;
  tmdb_id?: number;
  tmdb_type?: string;
  poster?: string;   // optional high-quality poster for seeded popular items
}

export interface Source {
  source_id: number;
  name: string;
  type: "sub" | "rent" | "buy" | "free" | "addon";
  region: string;
  ios_url?: string;
  android_url?: string;
  web_url: string;
  format?: string;
  price?: string | number;
  seasons?: number;
  episodes?: number;
}

export interface TitleDetails {
  id: number;
  title: string;
  original_title?: string;
  plot_overview?: string;
  type: string;
  runtime_minutes?: number;
  year?: number;
  end_year?: number;
  release_date?: string;
  genres?: number[];
  genre_names?: string[];
  user_rating?: number;
  critic_score?: number;
  us_rating?: string;
  poster?: string;
  posterMedium?: string;
  posterLarge?: string;
  backdrop?: string;
  trailer?: string;
  trailer_thumbnail?: string;
  sources?: Source[];
}

export interface Provider {
  id: number;
  name: string;
  logo_100px?: string;
  logo_200px?: string;
}

// Grouped sources for the modal UI
export type GroupedSources = {
  subscription: Source[];
  free: Source[];
  rent: Source[];
  buy: Source[];
};
