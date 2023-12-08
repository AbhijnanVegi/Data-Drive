import api from "./api";

/**
 * Fetches shared data from the server and updates the sharedByData state.
 * @param {Function} setSharedByData - The function to update the sharedByData state.
 * @returns {Promise<void>} - A promise that resolves when the data is fetched and the state is updated.
 */
export const fetchSharedByData = async (setSharedByData) => {
    try {
        const res = await api.post("/list_shared_by");
        setSharedByData(res.data);
    } catch (err) {
        console.error(err);
    }
}