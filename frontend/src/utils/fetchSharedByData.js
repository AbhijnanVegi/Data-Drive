import api from "./api";

export const fetchSharedByData = async (setSharedByData) => {
    try {
        const res = await api.post("/list_shared_by");
        setSharedByData(res.data);
    } catch (err) {
        console.error(err);
    }
}