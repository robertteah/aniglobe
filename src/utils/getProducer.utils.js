import axios from "axios";
import { getApiBase, mapAnimeCard } from "./kitsuneAdapter";

const getProducer = async (producer, page) => {
  const api_url = getApiBase();
  try {
    const response = await axios.get(`${api_url}/search`, {
      params: { q: producer?.split("-").join(" ") || "", page },
    });
    const data = response?.data?.data;
    return {
      data: (data?.animes || []).map(mapAnimeCard).filter(Boolean),
      totalPages: data?.totalPages ?? 1,
    };
  } catch (err) {
    console.error("Error fetching genre info:", err);
    return err;
  }
};

export default getProducer;
