import { getIdToken } from "../middleware/getToken";
import { api } from "./AppApi";

const getSystemOverview = async () => {
  try {
    const idToken = await getIdToken();
    const url = `/adminApp/getOverview`;
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    };
    const res = await api(url, config);
    return res;
  } catch (error) {
    if (error.response) {
      return error.response;
    } else {
      throw error;
    }
  }
};

const getMonthlyStats = async (month, year) => {
  try {
    const idToken = await getIdToken();
    const url = `/adminApp/monthly-stats`;
    const config = {
      method: "GET",
      params: {
        month: month,
        year: year,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    };
    const res = await api(url, config);
    return res;
  } catch (error) {
    if (error.response) {
      return error.response;
    } else {
      throw error;
    }
  }
};

export { getSystemOverview, getMonthlyStats };
