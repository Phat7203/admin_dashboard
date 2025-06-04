import { getIdToken } from "../midleware/getToken";
import { api } from './AppApi';

const getRoleById = async ({ roleId }) => {
    try {
        const idToken = await getIdToken();
        const url = `/role/${roleId}`;
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
}

const getAllRole = async () => {
    try {
        const idToken = await getIdToken();
        const url = `/role`;
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
}

const updateRole = async({ roleId }, data) => {}

export{
    getRoleById,
};