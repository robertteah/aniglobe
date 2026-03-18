import axios from "axios";
import { getApiBase } from "./kitsuneAdapter";

const getTopSearch = async () => {
  try {
    let baseUrl = getApiBase();
    const storedData = localStorage.getItem("topSearch");
    if (storedData) {
      const { data, timestamp } = JSON.parse(storedData);
      if (Date.now() - timestamp <= 7 * 24 * 60 * 60 * 1000) {
        return data;
      }
    }
    const { data } = await axios.get(`${baseUrl}/home`);
    const trending = data?.data?.trendingAnimes || [];
    const results = trending.slice(0, 10).map((item) => ({
      title: item.name,
      link: `/${item.id}`,
    }));
    if (results.length) {
      localStorage.setItem(
        "topSearch",
        JSON.stringify({ data: results, timestamp: Date.now() })
      );
      return results;
    }
    return [];
  } catch (error) {
    console.error("Error fetching top search data:", error);
    return null;
  }
};

export default getTopSearch;
