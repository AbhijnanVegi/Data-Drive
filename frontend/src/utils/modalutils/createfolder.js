import { notifySuccess, notifyFailure } from "../toaster";
import handleFolderCreation from "../createFolder";

/**
 * Handles the submission of the create folder form.
 * 
 * @param {Object} values - The form values.
 * @param {string} path - The current path.
 * @param {function} setIsCreateFolderModalOpen - The function to set the state of the create folder modal.
 * @param {function} setFiles - The function to set the state of the files.
 * @returns {Promise<void>} - A promise that resolves when the folder creation is handled.
 */
export const handleCreateFolderFormSubmit = async (values, path, setIsCreateFolderModalOpen, setFiles) => {
    setIsCreateFolderModalOpen(false);
    const folderRequest = {
        path: path + "/" + values.foldername,
    };
    const response = await handleFolderCreation(folderRequest);
    console.log(response);
    if (response.status === 200) {
        const tempElement = { id: path + "/" + values.foldername, isDir: true, name: values.foldername };
        setFiles((files) => [...files, tempElement]);
        notifySuccess(response.data.message);
    } else {
        notifyFailure(response.data.message);
    }
}