import axios from "axios";
const token = localStorage.getItem('token');

// Create an axios instance
const api = axios.create({
    baseURL: 'http://localhost:8000', // Changed API endpoint
    headers: {
        Authorization: `Bearer ${token}`, // Use Bearer token for authentication
    },
});
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