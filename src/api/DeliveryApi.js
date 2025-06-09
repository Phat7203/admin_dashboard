import { data } from "autoprefixer";
import { getIdToken } from "../midleware/getToken";
import { api } from "./AppApi";

const getProvinces = async () => {
    try {
        const idToken = await getIdToken();
        const url = "delivery/getProvinces";
        const config = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
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

const getDistricts = async (provinceId) => {
    try {
        const idToken = await getIdToken();
        const url = `delivery/getDistricts`;
        const config = {
            method: "GET",
            params: { provinceId: provinceId },
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
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

const getWards = async (districtId) => {
    try {
        const idToken = await getIdToken();
        const url = `delivery/getWards`;
        const config = {
            method: "GET",
            params: { districtId: districtId },
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            data: data
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

export { getProvinces, getDistricts, getWards };

