import { getIdToken } from "../middleware/getToken";
import { api } from './AppApi';

export const getChatSumary = async ({ userId }) => {
    try {
        const idToken = await getIdToken();
        const url = `/chat/summary`;
        const config = {
            method: "POST",
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