import { getIdToken } from "../middleware/getToken";
import { api } from './AppApi';

const getSubCategory = async () => {
    try {
        const idToken = await getIdToken();
        const url = "/subCategory";
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
            return error.response.data;
        } else {
            throw error;
        }
    }
};

const addSubCategory = async (data) => {
    try {
        const idToken = await getIdToken();
        const url = "/subCategory";
        const config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
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

const updateSubCategory = async ({ id, data }) => {
    try {
        const idToken = await getIdToken();
        const url = `/subCategory/${id}`;
        const config = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
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

const deleteSubCategory = async (id) => {
    try {
        const idToken = await getIdToken();
        const url = `/subCategory/${id}`;
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
            return error.response.data;
        } else {
            throw error;
        }
    }
};

export { getSubCategory, addSubCategory, updateSubCategory, deleteSubCategory };