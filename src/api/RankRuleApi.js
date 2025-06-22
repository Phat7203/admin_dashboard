import { getIdToken } from "../middleware/getToken";
import { api } from './AppApi';

const getAllRankRule = async () => {
    try {
        const idToken = await getIdToken();
        const url = `/rankRule`;
        const config = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
        };
        const res = await api(url, config);
        return res.data;
    } catch (error) {
        if (error.response) {
            return error.response;
        } else {
            throw error;
        }
    }
}

const addRankRule = async(data) => {
    try {
        const idToken = await getIdToken();
        const url = `/rankRule`;
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

const updateRankRule = async(id ,data) => {
    try {
        const idToken = await getIdToken();
        const url = `/rankRule/${id}`;
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

const deleteRankRule = async(id) => {
    try {
        const idToken = await getIdToken();
        const url = `/rankRule/${id}`;
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

export {getAllRankRule, addRankRule, updateRankRule, deleteRankRule};