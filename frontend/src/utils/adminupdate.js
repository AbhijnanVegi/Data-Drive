import api from "./api";
import { fetchAdminData } from "./fetchAdminData";
import { notifySuccess, notifyFailure } from "./toaster";


/**
 * Handles the update of a user through the admin panel
 * 
 * @param {Object} record - The record containing the updated user data.
 * @param {Function} setAdminData - The function to update the data state.
 * @returns {void}
 */
export const handleAdminUpdate = (record, setAdminData) => {
    console.log("record", record)
    const adminUpdateRequest = {
      "data": {
        "username": record.username,
        "permission": record.permission,
        "storage_quota": record.storage_quota,
      }
    }
    api.post("/admin/update_user", adminUpdateRequest)
      .then((response) => {
        console.log(response);
        fetchAdminData(setAdminData);
        notifySuccess(response.data.message);
      })
      .catch((error) => {
        console.log(error);
        notifyFailure(error.response.data.detail);
      });
  }