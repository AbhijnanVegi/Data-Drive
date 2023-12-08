import api from "./api";

/**
 * Fetches the configuration data from the server and sets it using the provided callback function.
 * @param {Function} setConfig - The callback function to set the configuration data.
 * @returns {Promise<void>} - A promise that resolves when the configuration data is fetched and set successfully.
 */
export const fetchConfig = async(setConfig) => {
    console.log("calling fetch config")
    try {
        const res = await api.get("/admin/config");
        setConfig(res.data);
    } catch (err) {
        console.error(err);
    }
}