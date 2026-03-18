import axios from "axios";
import { getApiBase, mapAnimeDetailsToLegacy, mapSeasonsToLegacy } from "./kitsuneAdapter";

export default async function fetchAnimeInfo(id, random = false) {
  const api_url = getApiBase();
  try {
    let animeId = id;
    if (random) {
      const home = await axios.get(`${api_url}/home`);
      const payload = home?.data?.data || {};
      const pool = [
        ...(payload.spotlightAnimes || []),
        ...(payload.trendingAnimes || []),
        ...(payload.mostPopularAnimes || []),
      ];
      const randomPick = pool[Math.floor(Math.random() * pool.length)];
      animeId = randomPick?.id;
    }

    if (!animeId) return null;

    const response = await axios.get(`${api_url}/anime/${animeId}`);
    const details = response?.data?.data;
    const mapped = mapAnimeDetailsToLegacy(details);

    if (!mapped) return null;

    return {
      data: mapped,
      seasons: mapSeasonsToLegacy(details?.seasons || []),
    };
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return error;
  }
}
