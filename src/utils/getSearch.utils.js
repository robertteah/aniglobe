import axios from "axios";
import { getApiBase, mapAnimeCard } from "./kitsuneAdapter";

const getSearch = async (keyword, page) => {
  const api_url = getApiBase();
  if (!page) page = 1;
  try {
    const response = await axios.get(`${api_url}/search`, {
      params: {
        q: keyword || "",
        page,
      },
    });
    const data = response?.data?.data;
    return {
      data: (data?.animes || []).map(mapAnimeCard).filter(Boolean),
      totalPage: data?.totalPages ?? 1,
    };
  } catch (err) {
    console.error("Error fetching genre info:", err);
    return err;
  }
};

export default getSearch;
