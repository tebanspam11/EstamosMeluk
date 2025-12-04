import * as Location from "expo-location";
import { useEffect, useState } from "react";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface UseLocationResult {
  location: UserLocation | null;
  errorMsg: string | null;
  loading: boolean;
}

export const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permiso de ubicación denegado.");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (loc && loc.coords) {
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } else {
        setErrorMsg("No se pudo obtener la ubicación.");
      }

      setLoading(false);
    })();
  }, []);

  return { location, errorMsg, loading };
};