// src/services/conversationAPI.js
import { getIdToken } from "../middleware/getToken";
import { api } from './AppApi';

// Lấy danh sách conversations theo shop_id
export const getConversations = async (shopId) => {
  try {
    const idToken = await getIdToken();
    const url = `/conversation/?shop_id=${shopId}`;
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

// Lấy conversation theo ID
export const getConversationById = async (conversationId) => {
  try {
    const idToken = await getIdToken();
    const url = `/conversation/${conversationId}`;
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

// Lấy messages của conversation
export const getMessages = async (conversationId, params = {}) => {
  try {
    const idToken = await getIdToken();
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 50,
      ...params
    }).toString();
    const url = `/conversation/${conversationId}/messages?${queryParams}`;
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

// Tạo conversation mới
export const createConversation = async (conversationData) => {
  try {
    const idToken = await getIdToken();
    const url = `/conversation`;
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: conversationData
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

// Gửi message
export const sendMessage = async (conversationId, messageData) => {
  try {
    const idToken = await getIdToken();
    const url = `/conversation/${conversationId}/messages`;
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: messageData
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

// Đánh dấu đã đọc
export const markAsRead = async (conversationId, readerType) => {
  try {
    const idToken = await getIdToken();
    const url = `/conversation/${conversationId}/read`;
    const config = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      data: {
        reader_type: readerType
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

// Lấy conversations theo store ID (sử dụng trong component với user context)
export const getConversationsByStore = async ({storeId}) => {
  try {
    const idToken = await getIdToken();
    const url = `/conversation/getConversationsByStoreId/${storeId}`;
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
}