import api from "./api";

export const fetchAdminData = async (setAdminData) => {
    console.log("calling fetch admin data")
    try {
        const res = await api.get("/admin/users");
        setAdminData(res.data);
    } catch (err) {
        console.error(err);
    }
}