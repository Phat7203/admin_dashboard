import { getIdToken } from "../midleware/getToken";
import { api } from './AppApi';

export const addProduct = async (productData) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/addProduct`;
    const config = {
      method: "POST",
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

export const updateProduct = async (id, productData) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/updateProducts/${id}`;
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

export const deleteProduct = async (id) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/deleteProducts/${id}`;
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

export const getAllProducts = async () => {
  try {
    const idToken = await getIdToken();
    const url = `/products/getProducts`;
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

export const getProductById = async ({id}) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/getProduct/id=${id}`;
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

export const getProductTrending = async () => {
  try {
    const idToken = await getIdToken();
    const url = `/products/getProductTrending`;
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

export const getProductOnSale = async () => {
  try {
    const idToken = await getIdToken();
    const url = `/products/getProductOnsale`;
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

export const getProductByCategory = async (categoryId) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/getProductByCategory/${categoryId}`;
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

export const getProductByGlobalCategory = async (globalCategoryId) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/getProductByGlobalCategory/${globalCategoryId}`;
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

export const getProductsByStatus = async (status) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/getProducts/status/${status}`;
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

export const setProductStatus = async (id, status) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/setProductStatus/status/${id}`;
    const config = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: { status }
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

export const checkAvailability = async (productData) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/checkAvailable`;
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

export const getProductAvailable = async () => {
  try {
    const idToken = await getIdToken();
    const url = `/products/getProductAvailable`;
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

export const getProductsByStoreId = async ({storeId}) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/products/store/${storeId}`;
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

export const getProductsByStatusAndStoreId = async (storeId, status) => {
  try {
    const idToken = await getIdToken();
    const url = `/products/products/store/${storeId}/status/${status}`;
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
export const updateImageModerationStatus = async (productId, moderationStatus, note = '') => {
  try {
    const idToken = await getIdToken();
    const url = `/products/products/${productId}/image-moderation`;
    const config = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: { 
        imageModerationStatus: moderationStatus,
        imageModerationNote: note 
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