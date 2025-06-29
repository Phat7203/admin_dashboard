import { getIdToken } from "../middleware/getToken";
import { api } from "./AppApi";
const registerUser = async ({ data }) => {
  try {
    const url = "/user/register";
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
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
const getUserType = async ({ userId }) => {
  try {
    const idToken = await getIdToken();
    const url = `/user/${userId}`;
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
const updateUser = async ({ userId, data }) => {
  try {
    const idToken = await getIdToken();
    const url = `/user/${userId}`;
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
      return error.response;
    } else {
      throw error;
    }
  }
};

const deleteUser = async ({ userId }) => {
  try {
    const idToken = await getIdToken();
    const url = `/user/${userId}`;
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
      return error.response;
    } else {
      throw error;
    }
  }
};
const getCurrentUserData = async ({ userId }) => {
  try {
    const idToken = await getIdToken();
    const url = `/user/getUser/${userId}`;
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
const getAllUsers = async () => {
  try {
    const idToken = await getIdToken();
    const url = `/user/users`;
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
const getStaffByStore = async ({ storeId }) => {
  try {
    const idToken = await getIdToken();
    const url = `/user/staff/${storeId}`;
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
const createStaff = async ({ data }) => {
  try {
    const idToken = await getIdToken();
    const url = `/user/staff`;
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
      return error.response;
    } else {
      throw error;
    }
  }
}
const updateStoreId = async ({ userId, storeId }) => {
  try {
    const idToken = await getIdToken();
    const url = `/user/updateStoreId/${userId}`;
    const config = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      data: { storeId },
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

export {
  registerUser,
  getUserType,
  updateUser,
  deleteUser,
  getAllUsers,
  getCurrentUserData,
  getStaffByStore,
  createStaff,
  updateStoreId,
};
