import axios from "axios";
import { getApiBase, mapAnimeCard } from "./kitsuneAdapter";

const categoryFromHome = new Set([
  "top-airing",
  "most-popular",
  "most-favorite",
  "completed",
  "top-upcoming",
]);

const getCategoryInfo = async (path, page) => {
  const api_url = getApiBase();
  try {
    if (!page) page = 1;

    if (path.startsWith("genre/")) {
      const genre = path.split("/")[1];
      const response = await axios.get(`${api_url}/search`, {
        params: { q: "", page, genres: genre },
      });
      const data = response?.data?.data;
      return {
        data: (data?.animes || []).map(mapAnimeCard).filter(Boolean),
        totalPages: data?.totalPages ?? 1,
      };
    }

    if (path.startsWith("az-list")) {
      const letter = path.split("/")[1];
      const q =
        !letter || letter === "other"
          ? ""
          : letter === "0-9"
          ? "0"
          : letter;
      const response = await axios.get(`${api_url}/search`, {
        params: { q, page, sort: "name-a-z" },
      });
      const data = response?.data?.data;
      return {
        data: (data?.animes || []).map(mapAnimeCard).filter(Boolean),
        totalPages: data?.totalPages ?? 1,
      };
    }

    if (path === "recently-updated" || path === "recently-added") {
      const response = await axios.get(`${api_url}/search`, {
        params: { q: "", page, sort: path },
      });
      const data = response?.data?.data;
      return {
        data: (data?.animes || []).map(mapAnimeCard).filter(Boolean),
        totalPages: data?.totalPages ?? 1,
      };
    }

    if (path === "subbed-anime" || path === "dubbed-anime") {
      const response = await axios.get(`${api_url}/search`, {
        params: { q: "", page, language: path === "subbed-anime" ? "sub" : "dub" },
      });
      const data = response?.data?.data;
      return {
        data: (data?.animes || []).map(mapAnimeCard).filter(Boolean),
        totalPages: data?.totalPages ?? 1,
      };
    }

    if (["movie", "special", "ova", "ona", "tv"].includes(path)) {
      const response = await axios.get(`${api_url}/search`, {
        params: { q: "", page, type: path },
      });
      const data = response?.data?.data;
      return {
        data: (data?.animes || []).map(mapAnimeCard).filter(Boolean),
        totalPages: data?.totalPages ?? 1,
      };
    }

    if (categoryFromHome.has(path)) {
      const home = await axios.get(`${api_url}/home`);
      const data = home?.data?.data || {};
      const mapping = {
        "top-airing": data.topAiringAnimes,
        "most-popular": data.mostPopularAnimes,
        "most-favorite": data.mostFavoriteAnimes,
        completed: data.latestCompletedAnimes,
        "top-upcoming": data.topUpcomingAnimes,
      };
      return {
        data: (mapping[path] || []).map(mapAnimeCard).filter(Boolean),
        totalPages: 1,
      };
    }

    const fallback = await axios.get(`${api_url}/search`, {
      params: { q: "", page },
    });
    const data = fallback?.data?.data;
    return {
      data: (data?.animes || []).map(mapAnimeCard).filter(Boolean),
      totalPages: data?.totalPages ?? 1,
    };
  } catch (err) {
    console.error("Error fetching genre info:", err);
    return err;
  }
};

export default getCategoryInfo;
