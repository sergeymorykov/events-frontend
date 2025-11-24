export interface Price {
  amount: number | null;
  currency: string | null;
}

export interface EventResponse {
  id: string;
  title: string | null;
  description: string | null;
  date: string | null; // ISO 8601 string
  price: Price | null;
  categories: string[];
  user_interests: string[];
  image_url: string | null; // DEPRECATED
  image_urls: string[];
  image_caption: string | null;
  source_post_url: string | null;
  processed_at: string | null; // ISO datetime
  raw_post_id: number | null;
  user_actions: string[]; // "like", "dislike", "participate"
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  interests: string[];
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  name: string;
  email: string;
  password: string;
}

export interface EventFilters {
  categories?: string[];
  min_price?: number;
  max_price?: number;
  date_from?: string; // ISO datetime
  date_to?: string; // ISO datetime
  for_my_interests?: boolean;
  limit?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface PaginatedEventsResponse {
  items: EventResponse[];
  next_cursor: string | null;
  prev_cursor: string | null;
}

