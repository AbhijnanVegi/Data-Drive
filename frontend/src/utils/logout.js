import api from "./api";

/**
 * Handles the logout functionality.
 * @param {Function} notifyFailure - The function to notify failure.
 */
export const handleLogout = (notifyFailure) => {
    console.log("inside handleLogout")
    api.post('/auth/logout', {
      withCredentials: true,
    })
      .then((response) => {
        console.log(response);
        window.location.href = "/";
      })
      .catch((error) => {
        console.log(error);
        notifyFailure(error.response.data.detail);
      });
  };