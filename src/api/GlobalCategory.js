import { getIdToken } from "../middleware/getToken";
import { api } from './AppApi';

const getGlobalCategory = async() => {
    try {
        const idToken = await getIdToken();
        const url = `/globalCategory`;
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

const addGlobalCategory = async(data) => {
    try {
        const idToken = await getIdToken();
        const url = `/globalCategory`;
        const config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
            data: data,
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

const updateGlobalCategory = async(id ,data) => {
    try {
        const idToken = await getIdToken();
        const url = `/globalCategory/${id}`;
        const config = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
            data: data,
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

const deleteGlobalCategory = async(id) => {
    try{
        const idToken = await getIdToken();
        const url = `/globalCategory/${id}`;
        const config = {
            method: "DELETE",
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

export{
    getGlobalCategory,
    addGlobalCategory,
    updateGlobalCategory,
    deleteGlobalCategory
}