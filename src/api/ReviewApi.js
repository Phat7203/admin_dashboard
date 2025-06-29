import { getIdToken } from "../middleware/getToken";
import { api } from './AppApi';

// Lấy tất cả đánh giá
const getAllReviews = async() => {
    try {
        const idToken = await getIdToken();
        const url = `/reviews/getReviews`;
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

// Thêm mới đánh giá
const addReview = async(data) => {
    try {
        const idToken = await getIdToken();
        const url = `/reviews/addReview`;
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

// Lấy đánh giá theo ID
const getReviewById = async(id) => {
    try {
        const idToken = await getIdToken();
        const url = `/reviews/getReviewById/${id}`;
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

// Cập nhật đánh giá
const updateReview = async(id, data) => {
    try {
        const idToken = await getIdToken();
        const url = `/reviews/updateReview/${id}`;
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

// Xóa đánh giá
const deleteReview = async(id) => {
    try{
        const idToken = await getIdToken();
        const url = `/reviews/deleteReview/${id}`;
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

// Lấy đánh giá theo product ID (nếu bạn có route này)
const getReviewsByProductId = async(productId) => {
    try {
        const idToken = await getIdToken();
        const url = `/reviews/getReviewsByProductId/${productId}`;
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

export {
    getAllReviews,
    addReview,
    getReviewById,
    updateReview,
    deleteReview,
    getReviewsByProductId
}