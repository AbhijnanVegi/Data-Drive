import axios from "axios";
import api from "./api";

/**
 * Handles file upload.
 * @param {Array<File>} uploadFile - The selected file to upload.
 * @param {string} path - The path where the file should be uploaded.
 * @returns {Promise<any>} - A promise that resolves to the response from the file upload API or rejects with an error.
 */
const handleFileUpload = async (uploadFile, path) => {
    // get the selected file from the input
    const file = uploadFile[0];
    // create a new FormData object and append the file to it
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path)
    // make a POST request to the File Upload API with the FormData object and Rapid API headers
    try {
        const response = await api
            .post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true
            })
        console.log(response);
        return response
    }
    catch (err) {
        console.error("Error in uploading file");
        return err
    }

};

export default handleFileUpload;