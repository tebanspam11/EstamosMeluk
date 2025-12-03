export interface Vet {
  id: string;
  name: string;
  address: string;
  schedule: string;
  latitude: number;
  longitude: number;
  phone?: string;
  source?: "amenity" | "shop" | "other";
}

