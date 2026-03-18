import axios from "axios";
import { getApiBase } from "./kitsuneAdapter";

const mapSuggestion = (item) => ({
  id: item.id,
  title: item.name ?? "",
  japanese_title: item.jname ?? "",
  poster: item.poster ?? "",
  showType: item.type ?? "",
  duration: item.duration ?? "",
  releaseDate: item.releaseDate ?? "",
});

const getSearchSuggestion = async (keyword) => {
  const api_url = getApiBase();
  try {
    const response = await axios.get(`${api_url}/search/suggestion`, {
      params: { q: keyword || "" },
    });
    const suggestions = response?.data?.data?.suggestions || [];
    return suggestions.map(mapSuggestion);
  } catch (err) {
    console.error("Error fetching genre info:", err);
    return err;
  }
};

export default getSearchSuggestion;
