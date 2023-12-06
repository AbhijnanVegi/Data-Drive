import api from "../api";
import { notifyFailure, notifySuccess } from "../toaster";

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