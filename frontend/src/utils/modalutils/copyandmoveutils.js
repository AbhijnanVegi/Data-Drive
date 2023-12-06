import api from "../api";
import { notifyFailure, notifySuccess } from "../toaster";

/**
 * Handles the form submission for copying files.
 * 
 * @param {Object} values - The form values.
 * @param {Function} setIsCopyFilesModalOpen - A function to set the state of the copy files modal.
 * @param {Array} selectedFiles - An array of selected files to be copied.
 * @returns {void}
 */
export const handleCopyFileFormSubmit = (values, setIsCopyFilesModalOpen, selectedFiles) => {
    setIsCopyFilesModalOpen(false);
    console.log("values", selectedFiles)

    selectedFiles.forEach(async (file) => {
        var tempid = file.id;
        if (tempid[tempid.length - 1] === "/") {
            tempid = tempid.slice(0, -1);
        }
        const copyRequest = {
            src_path: tempid,
            dest_path: values.destinationpath
        };
        await api.post("/copy", copyRequest)
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

/**
 * Handles the submission of the move file form.
 * 
 * @param {Object} values - The form values.
 * @param {function} setIsMoveFilesModalOpen - The function to set the move files modal open state.
 * @param {Array} selectedFiles - The array of selected files to be moved.
 * @param {boolean} rerender - The current rerender state.
 * @param {function} setRerender - The function to set the rerender state.
 * @returns {void}
 */
export const handleMoveFileFormSubmit = (values, setIsMoveFilesModalOpen, selectedFiles, rerender, setRerender) => {
    setIsMoveFilesModalOpen(false);
    console.log("values", selectedFiles)

    selectedFiles.forEach(async (file) => {
        var tempid = file.id;
        if (tempid[tempid.length - 1] === "/") {
            tempid = tempid.slice(0, -1);
        }
        const moverequest = {
            src_path: tempid,
            dest_path: values.destinationpath
        };
        await api.post("/move", moverequest)
            .then((response) => {
                console.log(response);
                notifySuccess("File Moved Succesfully");
                setRerender(!rerender);
            })
            .catch((error) => {
                console.log(error);
                notifyFailure(error.response.data.detail);
            });
    })
}