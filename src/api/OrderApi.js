import { getIdToken } from "../middleware/getToken";
import { api } from './AppApi';

export const getOrderByStoreidAndStatus = async (storeId, status) => {
    try {
        const idToken = await getIdToken();
        const url = `/order/store/${storeId}/status/${status}`;
        const config = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
        }
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
export const getDetailOrderByShop = async (orderId) => {
    try {
        const idToken = await getIdToken();
        const url = `/order/getOrderDetailByShop/${orderId}`;
        const config = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
        }
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
export const getAllOrder = async (page, size) => {
    try {
        const idToken = await getIdToken();
        const url = `/order/getAllOrder`;
        const config = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
        }
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
export const getOrderDetailByAdmin = async (orderId) => {
    try {
        const idToken = await getIdToken();
        const url = `/order/getOrderDetailByAdmin/${orderId}`;
        const config = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
        }
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
