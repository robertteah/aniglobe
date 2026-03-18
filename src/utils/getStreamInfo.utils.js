import axios from "axios";
import { getApiBase } from "./kitsuneAdapter";

const normalizeServerName = (name) => {
  if (!name) return undefined;
  const lowered = name.toLowerCase();
  if (lowered.startsWith("hd-")) return lowered;
  return lowered.replace(/\s+/g, "");
};

export default async function getStreamInfo(
  animeId,
  episodeId,
  serverName,
  type
) {
  const api_url = getApiBase();
  try {
    const animeEpisodeId = `${animeId}?ep=${episodeId}`;
    const server = normalizeServerName(serverName);
    const response = await axios.get(`${api_url}/episode/sources`, {
      params: {
        animeEpisodeId,
        server,
        category: type,
      },
    });
    return response?.data?.data;
  } catch (error) {
    console.error("Error fetching stream info:", error);
    return error;
  }
}
