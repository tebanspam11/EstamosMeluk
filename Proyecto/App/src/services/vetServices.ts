import { Vet } from "../types/index";

export const getVets = async (
  lat: number,
  lon: number,
  radius: number = 5000
): Promise<Vet[]> => {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="veterinary"](around:${radius}, ${lat}, ${lon});
      way["amenity"="veterinary"](around:${radius}, ${lat}, ${lon});
      relation["amenity"="veterinary"](around:${radius}, ${lat}, ${lon});

      node["shop"="pet"](around:${radius}, ${lat}, ${lon});
      way["shop"="pet"](around:${radius}, ${lat}, ${lon});
      relation["shop"="pet"](around:${radius}, ${lat}, ${lon});
    );
    out center;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();

  if (!data?.elements) return [];

  const vets = data.elements
    .map((item: any) => {
      const lat2 = item.lat || item.center?.lat;
      const lon2 = item.lon || item.center?.lon;
      if (!lat2 || !lon2) return null;

      const tags = item.tags || {};
      const parts = [
        tags["addr:street"] || tags["street"] || tags.addr_street,
        tags["addr:housenumber"] || tags.housenumber,
        tags["addr:suburb"] || tags["addr:neighbourhood"],
      ].filter(Boolean);
      const addressFromParts = parts.join(" ").trim();

      const address =
        addressFromParts ||
        tags["addr:full"] ||
        tags["address"] ||
        "Dirección no disponible";

      const phone = tags.phone || tags["contact:phone"] || tags["telephone"];

      let source: "amenity" | "shop" | "other" = "other";
      if (tags.amenity === "veterinary") source = "amenity";
      else if (tags.shop === "pet") source = "shop";

      const vet: Vet = {
        id: String(item.id),
        name: tags.name || tags["official_name"] || "Veterinaria sin datos",
        address,
        schedule: tags.opening_hours || "Horario no disponible",
        latitude: lat2,
        longitude: lon2,
        phone,
        source,
      };

      return vet;
    })
    .filter(Boolean);

  return vets;
};