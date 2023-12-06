import api from "../api";
import { fetchSharedByData } from "../fetchSharedByData";
import { notifyFailure, notifySuccess } from "../toaster";


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
                    notifySuccess(response.data.message);
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

