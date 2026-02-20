export type CategoryCode =
  | "bapsim"
  | "cheating"
  | "stress"
  | "hot"
  | "fresh"
  | "sugar";

export interface Category {
  code: CategoryCode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}

export interface Restaurant {
  id: number;
  name: string;
  category: CategoryCode;
  lat: number;
  lng: number;
  address: string;
  image_url?: string;
  description: string;
}

export interface Review {
  id: number;
  restaurant_id: number;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Favorite {
  id: number;
  user_id: string;
  restaurant_id: number;
}

export interface Profile {
  id: string;
  nickname: string;
  avatar_url?: string;
}
