import axios from "axios";
import { getApiBase } from "./kitsuneAdapter";

const flattenServers = (serversData) => {
  if (!serversData) return [];
  const all = [];
  ["sub", "dub", "raw"].forEach((category) => {
    const list = serversData[category] || [];
    list.forEach((server) => {
      all.push({
        type: category,
        data_id: `${category}:${server.serverName}`,
        server_id: String(server.serverId),
        serverName: server.serverName,
      });
    });
  });
  return all;
};

export default async function getServers(animeId, episodeId) {
  try {
    const api_url = getApiBase();
    const animeEpisodeId = encodeURIComponent(`${animeId}?ep=${episodeId}`);
    const response = await axios.get(
      `${api_url}/episode/servers?animeEpisodeId=${animeEpisodeId}`
    );
    return flattenServers(response?.data?.data);
  } catch (error) {
    console.error(error);
    return error;
  }
}
