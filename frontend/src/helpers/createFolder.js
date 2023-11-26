import axios from "axios";
  const token = localStorage.getItem('token');

  // Create an axios instance
  const api = axios.create({
    baseURL: 'http://localhost:8000', // Changed API endpoint
    headers: {
      Authorization: `Bearer ${token}`, // Use Bearer token for authentication
    },
  });
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