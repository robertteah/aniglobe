import axios from "axios";
import {
  getApiBase,
  mapSpotlightItem,
  mapTrendingItem,
  mapTopTenList,
  mapAnimeCard,
} from "./kitsuneAdapter";

const CACHE_KEY = "homeInfoCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export default async function getHomeInfo() {
  const api_url = getApiBase();
  const currentTime = Date.now();

  try {
    const cachedRaw = localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const cachedData = JSON.parse(cachedRaw);

      const isValidCache =
        cachedData?.data &&
        Object.keys(cachedData.data).length > 0 &&
        currentTime - cachedData.timestamp < CACHE_DURATION;

      if (isValidCache) {
        return cachedData.data;
      }
    }
  } catch {
    localStorage.removeItem(CACHE_KEY);
  }

  const response = await axios.get(`${api_url}/home`);
  const results = response?.data?.data;

  if (!results || typeof results !== "object") {
    return null;
  }

  const finalData = {
    spotlights: (results.spotlightAnimes || [])
      .map(mapSpotlightItem)
      .filter(Boolean),
    trending: (results.trendingAnimes || [])
      .map(mapTrendingItem)
      .filter(Boolean),
    topten: {
      today: mapTopTenList(results.top10Animes?.today || []),
      week: mapTopTenList(results.top10Animes?.week || []),
      month: mapTopTenList(results.top10Animes?.month || []),
    },
    todaySchedule: [],
    top_airing: (results.topAiringAnimes || [])
      .map(mapAnimeCard)
      .filter(Boolean),
    most_popular: (results.mostPopularAnimes || [])
      .map(mapAnimeCard)
      .filter(Boolean),
    most_favorite: (results.mostFavoriteAnimes || [])
      .map(mapAnimeCard)
      .filter(Boolean),
    latest_completed: (results.latestCompletedAnimes || [])
      .map(mapAnimeCard)
      .filter(Boolean),
    latest_episode: (results.latestEpisodeAnimes || [])
      .map(mapAnimeCard)
      .filter(Boolean),
    top_upcoming: (results.topUpcomingAnimes || [])
      .map(mapAnimeCard)
      .filter(Boolean),
    recently_added: (results.latestEpisodeAnimes || [])
      .map(mapAnimeCard)
      .filter(Boolean),
    genres: results.genres || [],
  };

  if (Object.keys(finalData).length === 0) {
    return null;
  }

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data: finalData,
      timestamp: currentTime,
    })
  );

  return finalData;
}
