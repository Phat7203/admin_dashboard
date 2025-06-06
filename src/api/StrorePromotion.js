// src/api/storePromotionApi.js
import { getIdToken } from "../midleware/getToken";
import { api } from './AppApi';

// Tạo mới một khuyến mãi
export const createStorePromotion = async (promotionData) => {
  try {
    const idToken = await getIdToken();
    const url = `/storePromotion/`;  
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: promotionData
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
//Cập nhật trạng thái khuyến mãi
export const updatePromotionStatus = async (promotionId, status) => {
  try {
    const idToken = await getIdToken();
    const url = `/storePromotion/status/${promotionId}`;
    const config = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: {isActive: status }
    };
    const res = await api(url, config);
    return res;
  }
  catch (error) {
    if (error.response) {
      return error.response;
    } else {
      throw error;
    }
  }
};
export const updateStorePromotion = async (promotionId, promotionData) => {
  try {
    const idToken = await getIdToken();
    const url = `/storePromotion/${promotionId}`;
    const config = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: promotionData
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
// Xoá khuyến mãi theo ID
export const deleteStorePromotion = async (promotionId) => {
  try {
    const idToken = await getIdToken();
    const url = `/storePromotion/${promotionId}`;
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
// Lấy danh sách khuyến mãi theo storeId
export const getPromotionsByStoreId = async (storeId) => {
  try {
    const idToken = await getIdToken();
    console.log("storeId", storeId);
    const url = `/storePromotion/store/${storeId}`;
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

// Lấy tất cả khuyến mãi
export const getAllStorePromotions = async () => {
  try {
    const idToken = await getIdToken();
    const url = `/storePromotion/all`;
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

// Lấy danh sách khuyến mãi hiện tại
export const getCurrentPromotions = async () => {
  try {
    const idToken = await getIdToken();
    const url = `/storePromotion/current`;
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

// Kiểm tra khuyến mãi theo ID
export const checkPromotionById = async (promotionId) => {
  try {
    const idToken = await getIdToken();
    const url = `/storePromotion/check/${promotionId}`;
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
