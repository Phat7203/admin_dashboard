import { getIdToken } from "../middleware/getToken";
import { api } from "./AppApi";

// Tạo role mới
const createRole = async (data) => {
    try {
        const idToken = await getIdToken();
        const url = "/role/create";
        const config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
            data: data
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

// Lấy role theo ID
const getRoleById = async (id) => {
    try {
        const idToken = await getIdToken();
        const url = `/role/${id}`;
        const config = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
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

// Lấy tất cả roles
const getAllRole = async () => {
    try {
        const idToken = await getIdToken();
        const url = "/role/getAll";
        const config = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
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

// Cập nhật role
const updateRole = async (roleId, data) => {
    try {
        const idToken = await getIdToken();
        const url = `/role/${roleId}`;
        const config = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
            data: data
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

// Xóa role
const deleteRole = async (roleId) => {
    try {
        const idToken = await getIdToken();
        const url = `/role/${roleId}`;
        const config = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
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

const getStaffRole = async ({storeId}) => {
  try {
    const idToken = await getIdToken();
    const url = `/role/staff-role/${storeId}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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

// Kiểm tra store có role admin_staff chưa
const checkStaffRole = async ({storeId}) => {
  try {
    const idToken = await getIdToken();
    const url = `/role/check-staff-role/${storeId}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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

export {
    createRole,
    getRoleById,
    getAllRole,
    updateRole,
    deleteRole,
    getStaffRole,
    checkStaffRole,
};