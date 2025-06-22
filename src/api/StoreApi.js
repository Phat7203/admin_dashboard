import { getIdToken } from "../middleware/getToken";
import { api } from "./AppApi";

const getAllStores = async () => {
  try {
    const idToken = await getIdToken();
    const url = "/store/getStores";
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

const addStore = async (data) => {
  try {
    const idToken = await getIdToken();
    const url = "/store/addStore";
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
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

const updateStore = async ({ id, data }) => {
  try {
    const idToken = await getIdToken();
    const url = `/store/updateStore/${id}`;
    const config = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
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

const deleteStore = async (id) => {
  try {
    const idToken = await getIdToken();
    const url = `/store/deleteStore/${id}`;
    const config = {
      method: "DELETE",
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

const approveStore = async (id) => {
  try {
    const idToken = await getIdToken();
    const url = `/store/approveStore/${id}`;
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
const getStoreById = async (id) => {
  try {
    const idToken = await getIdToken();
    const url = `/store/getStoreById/${id}`;
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
export { getAllStores, addStore, updateStore, deleteStore, approveStore, getStoreById };
