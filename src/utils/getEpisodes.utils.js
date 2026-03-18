import axios from "axios";
import { getApiBase, mapEpisodesToLegacy } from "./kitsuneAdapter";

export default async function getEpisodes(id) {
  const api_url = getApiBase();
  try {
    const response = await axios.get(`${api_url}/anime/${id}/episodes`);
    const data = response?.data?.data;
    return {
      totalEpisodes: data?.totalEpisodes ?? 0,
      episodes: mapEpisodesToLegacy(data?.episodes || []),
    };
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return error;
  }
}
