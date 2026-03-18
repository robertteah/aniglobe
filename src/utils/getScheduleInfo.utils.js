import axios from "axios";
import { getApiBase, mapScheduleToLegacy } from "./kitsuneAdapter";

export default async function getSchedInfo(date) {
  try {
    const api_url = getApiBase();
    const response = await axios.get(`${api_url}/schedule`, {
      params: { date },
    });
    const data = response?.data?.data;
    return mapScheduleToLegacy(data?.scheduledAnimes || []);
  } catch (error) {
    console.error(error);
    return error;
  }
}
