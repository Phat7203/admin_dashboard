import { getIdToken } from "../midleware/getToken";
import { api } from './AppApi';
export const addCategory = async (categoryData) => {
  try {
    const idToken = await getIdToken();
    const url = `/category/addCategory`;
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: categoryData
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
export const updateCategory = async (id, categoryData) => {
  try {
    const idToken = await getIdToken();
    const url = `/category/${id}`;
    const config = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: categoryData
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
export const deleteCategory = async (id) => {
  try {
    const idToken = await getIdToken();
    const url = `/category/${id}`;
    const config = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      }
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
export const getCategory = async (id) => {
  try {
    const idToken = await getIdToken();
    const url = `/category/getCategory`;
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      }
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
export const updateProductAmountInCategory = async (id, productData) => {
  try {
    const idToken = await getIdToken();
    const url = `/category/updateProductAmount/${id}`;
    const config = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: productData
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
export const getCategoriesByStore = async ({storeId}) => {
  try {
    const idToken = await getIdToken();
    const url = `/category/getCategoriesByStoreId/${storeId}`;
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      }
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
