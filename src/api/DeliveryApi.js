import { data } from "autoprefixer";
import { getIdToken } from "../middleware/getToken";
import { api } from "./AppApi";

const getProvinces = async () => {
  try {
    const url = "delivery/getProvinces";
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await api(url, config);
    return res;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};

const getDistricts = async (provinceId) => {
  try {
    const url = `delivery/getDistricts`;
    const config = {
      method: "GET",
      params: { provinceId: provinceId },
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await api(url, config);
    return res;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};

const getWards = async (districtId) => {
  try {
    const url = `delivery/getWards`;
    const config = {
      method: "GET",
      params: { districtId: districtId },
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const res = await api(url, config);
    return res;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};
const getGHNOrderStatus = async (ghnId) => {
  try {
    const idToken = await getIdToken();
    const url = `delivery/getGHNOrder/${ghnId}`;
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
      return error.response.data;
    } else {
      throw error;
    }
  }
};
const confirmGHNOrder = async (orderId) => {
  try {
    const idToken = await getIdToken();
    const url = `delivery/confirmDelivery/${orderId}`;
    const config = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    };

    const res = await api(url, config);
    return res;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};

const searchAddressOSM = async (address) => {
  try{
    const url = `delivery/search-address?q=${encodeURIComponent(address)}`;
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const res = await api(url, config);
    return res.data.length > 0
    ? { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon) }
    : null;
  }
  catch(error){
     if (error.response) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};

export {
  getProvinces,
  getDistricts,
  getWards,
  getGHNOrderStatus,
  confirmGHNOrder,
  searchAddressOSM,
};
