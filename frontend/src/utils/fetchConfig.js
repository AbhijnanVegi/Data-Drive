import api from "./api";

export const fetchConfig = async(setConfig) => {
    console.log("calling fetch config")
    try {
        const res = await api.get("/admin/config");
        setConfig(res.data);
    } catch (err) {
        console.error(err);
    }
}