import api from "../api";
import { fetchSharedByData } from "../fetchSharedByData";
import { notifyFailure, notifySuccess } from "../toaster";
import showNotification from "../../Pages/components/Notification";


/**
 * Handles the unsharing of a file or folder.
 * 
 * @param {string} id - The ID of the file or folder to unshare.
 * @param {string} child_username - The username of the child user to unshare with.
 * @param {Function} setSharedByData - The function to update the shared by data.
 */
export const handleUnshare = (id, child_username, setSharedByData) => {
    console.log("unsharing", id)
    const unshareRequest = {
        "path": id,
        "child_username": child_username
    };
    api.post("/unshare", unshareRequest)
        .then((response) => {
            console.log(response);
            notifySuccess(response.data.message);
            fetchSharedByData(setSharedByData);
        })
        .catch((error) => {
            console.log(error);
            notifyFailure(error.response.data.detail);
        });
}

/**
 * Handles the submission of the share folder form.
 * 
 * @param {object} values - The form values.
 * @param {array} selectedFiles - The selected files to be shared.
 * @param {function} setIsShareFolderModalOpen - The function to set the state of the share folder modal.
 */
export const handleShareFolderFormSubmit = (values, selectedFiles, setIsShareFolderModalOpen) => {
    console.log("share folder modal", values)
    const permdict = {
        "read": 1,
        "write": 2,
    }
    if (values.sharewitheveryone === true) {
        console.log("sharing with everyone")
        selectedFiles.forEach(async (file) => {
            var tempid = file.id;
            if (file.isDir) {
                tempid = tempid.slice(0, -1);
            }
            const shareRequest = {
                "path": tempid,
                "permissions": permdict[values.permissions]
            };
            await api.post("/mark_public", shareRequest)
                .then((response) => {
                    console.log(response);
                    const domainname = window.location.host;
                    showNotification(response.data.message + ": Click to Copy Link", domainname + "/" + tempid);
                })
                .catch((error) => {
                    console.log(error);
                    notifyFailure(error.response.data.detail);
                });
        })
    }
    else {
        console.log("values", selectedFiles)

        const permdict = {
            "read": 1,
            "write": 2,
        }
        selectedFiles.forEach(async (file) => {
            var tempid = file.id;
            if (file.isDir) {
                tempid = tempid.slice(0, -1);
            }
            console.log("hello")
            const shareRequest = {
                "path": tempid,
                "child_username": values.user,
                "permissions": permdict[values.permissions]
            };
            await api.post("/share", shareRequest)
                .then((response) => {
                    console.log(response);
                    notifySuccess(response.data.message);
                })
                .catch((error) => {
                    console.log(error);
                    notifyFailure(error.response.data.detail);
                });

        })
    }
    setIsShareFolderModalOpen(false);
};

