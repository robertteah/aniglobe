import axios from "axios";
import { getApiBase } from "./kitsuneAdapter";

const getQtip = async (id) => {
  try {
    let baseUrl = getApiBase();
    if (!baseUrl) throw new Error("No API endpoint defined.");
    const response = await axios.get(`${baseUrl}/anime/${id}`);
    const details = response?.data?.data;
    const info = details?.anime?.info;
    const moreInfo = details?.anime?.moreInfo || {};
    const stats = info?.stats || {};

    return {
      title: info?.name ?? "",
      rating: stats.rating ?? null,
      quality: stats.quality ?? null,
      subCount: stats.episodes?.sub ?? null,
      dubCount: stats.episodes?.dub ?? null,
      episodeCount: stats.episodes?.sub ?? stats.episodes?.dub ?? null,
      type: stats.type ?? null,
      description: info?.description ?? "",
      japaneseTitle: moreInfo.japanese ?? "",
      Synonyms: moreInfo.synonyms ?? "",
      airedDate: moreInfo.aired ?? "",
      status: moreInfo.status ?? "",
      genres: moreInfo.genres ?? [],
      watchLink: `/watch/${info?.id}`,
    };
  } catch (err) {
    console.error("Error fetching genre info:", err);
    return null;
  }
};

export default getQtip;
