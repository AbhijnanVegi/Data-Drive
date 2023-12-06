import toast, { Toaster } from "react-hot-toast";
export const notifySuccess = (message) => {
    toast.success(message, {
        position: "bottom-center",
    });
};
export const notifyFailure = (message) => {
    toast.error(message, {
        position: "bottom-center",
    });
};