import axios from "axios";

const handleFolderCreation = async (path) => {
    // make a POST request to the File Upload API with the FormData object and Rapid API headers
    try {
        const response = await axios
            .post("http://localhost:5000/mkdir", path, {
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