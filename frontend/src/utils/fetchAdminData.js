import api from "./api";

/**
 * Fetches admin data from the server and updates the state with the fetched data.
 * @param {Function} setAdminData - A function to update the state with the fetched admin data.
 * @returns {Promise<void>} - A promise that resolves when the admin data is fetched and the state is updated.
 */
export const fetchAdminData = async (setAdminData) => {
    console.log("calling fetch admin data")
    try {
        const res = await api.get("/admin/users");
        setAdminData(res.data);
    } catch (err) {
        console.error(err);
    }
}