import api from "./api"
/**
 * Handles the creation of a folder.
 * @param {string} path - The path of the folder to be created.
 * @returns {Promise} - A promise that resolves with the response from the API.
 */
const handleFolderCreation = async (path) => {
    // make a POST request to the File Upload API with the FormData object and Rapid API headers
    console.log("path",path)
    const req = {
        "data" : {
            "path" : path.path
        }
    }
    console.log("req",req)
    try {
        const response = await api
            .post("/mkdir", req, {
                withCredentials: true
            })
            console.log("Folder created")
            console.log(response)
            return response
    }
    catch{
        console.error("Error in creating folder");
    }
}

export default handleFolderCreation;