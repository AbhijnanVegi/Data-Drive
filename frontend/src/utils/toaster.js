import toast, { Toaster } from "react-hot-toast";
/**
 * Notifies success with a toast message.
 * @param {string} message - The success message to display.
 */
export const notifySuccess = (message) => {
    toast.success(message, {
        position: "bottom-center",
    });
};
/**
 * Notifies a failure by displaying an error toast message.
 * @param {string} message - The error message to display.
 */
export const notifyFailure = (message) => {
    toast.error(message, {
        position: "bottom-center",
    });
};