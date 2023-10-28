import handleFileUpload from '../helpers/fileUpload';
import handleFolderCreation from '../helpers/createFolder';
import React, { useEffect, useReducer } from 'react';
import { useState, useCallback } from 'react';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import { FullFileBrowser } from 'chonky';
import '../css/HomePage.css'
import axios from 'axios';
import { customActions } from '../Components/customFileActions';
import { Modal } from 'antd';
import CreateButtonModalForm from '../Components/createButtonModalForm';
import toast, { Toaster } from 'react-hot-toast';
setChonkyDefaults({ iconComponent: ChonkyIconFA });

const HomePage = () => {
    const [user, setUser] = useState(null);
    const [files, setFiles] = useState([]);
    const [path, setPath] = useState(null);
    const [folders, setFolders] = useState([]); // array of folder names [folder1, folder2, folder3
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

    const notifySuccess = (message) => {
        toast.success(message, {
            position: 'bottom-center',
        });
    };
    const notifyFailure = (message) => {
        toast.error(message, {
            position: 'bottom-center',
        });
    };
    const showModal = () => {
        setIsCreateFolderModalOpen(true);
    };

    const handleOk = () => {
        setIsCreateFolderModalOpen(false);
    };

    const handleCancel = () => {
        setIsCreateFolderModalOpen(false);
    };
    const [createFolderModalFormData, setCreateFolderModalFormData] = useState(null);

    const handleCreateFolderFormSubmit = async (values) => {
        console.log('Success:', values);
        setCreateFolderModalFormData(values);
        handleOk();
        const folderRequest = {
            path: path + "/" + values.foldername
        }
        console.log(folderRequest);
        const response = await handleFolderCreation(folderRequest);
        console.log(response)
        if (response.status === 200) {
            const tempElement = {}
            tempElement.id = path + "/" + values.foldername;
            tempElement.isDir = true;
            tempElement.name = values.foldername;
            setFiles(files => [...files, tempElement]);
            notifySuccess(response.data.message);
        }
        else {
            notifyFailure(response.data.message);
        }
    };
    const fileActions = customActions
    const uploadFile = async (file, filename) => {
        console.log(path + "/" + filename);
        const response = await handleFileUpload(file, path + "/" + filename);
        if (response.status === 200) {
            const tempElement = {}
            tempElement.id = path + "/" + filename;
            tempElement.isDir = false;
            tempElement.name = filename;
            setFiles(files => [...files, tempElement]);
            notifySuccess(response.data.message);
        }
        else {
            console.log("lmao")
            notifyFailure(response.data.message);
        }
    }

    useEffect(() => {
        // get user info by pinging /locahost:5000/auth/user
        axios.get('http://localhost:5000/auth/user', { withCredentials: true })
            .then(res => {
                if (res.data.username === null)
                    window.location.href = '/';
                else {
                    setUser(res.data.username);
                    setPath(res.data.username);
                    var folderArray = []
                    const first_folder = {
                        id: res.data.username,
                        name: res.data.username,
                        isDir: true,
                        isOpenable: true,
                    }
                    folderArray.push(first_folder);
                    setFolders(folderArray);

                }

            })
            .catch(err => {
                console.log(err);
            })
    }, []);
    useEffect(() => {
        if (path !== null) {

            // iterate through path.split say path.split was ['user', 'username', 'folder1'], set ids to user, user/username, user/username/folder1 and names to user, username, folder1
            const folderChain = path.split('/');
            console.log("folderChain", folderChain);
            for (var i = 1; i < folderChain.length; i++) {
                folderChain[i] = folderChain[i - 1] + "/" + folderChain[i];
            }
            console.log("folderChain new", folderChain);
            const tempFolderArray = [];
            const folderNames = path.split('/');
            for (i = 0; i < folderChain.length; i++) {
                const tempElement = {}
                tempElement.id = folderChain[i];
                tempElement.name = folderNames[i];
                tempElement.isOpenable = true;
                tempElement.isDir = true;
                tempFolderArray.push(tempElement);
            }
            console.log("tempFolderArray", tempFolderArray);
            setFolders(tempFolderArray);

            const fileRequest = {
                path: path
            }
            console.log("is useeffect even working?")
            console.log(fileRequest);
            axios.defaults.validateStatus = () => true;
            axios('http://localhost:5000/list', { method: "post", withCredentials: true, data: fileRequest })
                .then(res => {
                    console.log(res.data);
                    // push every element of res.data.object into fileArray immutable
                    var tempFileArray = [];
                    res.data.objects.forEach(element => {
                        const tempElement = {}
                        tempElement.id = element.path;
                        tempElement.isDir = element.is_dir;
                        tempElement.size = element.size === null ? 0 : element.size;
                        tempElement.modDate = element.last_modified;
                        // split the path to get the name of the file, take the last element
                        const pathArray = element.path.split('/');
                        tempElement.name = pathArray[pathArray.length - 1];
                        if (tempElement.name === "") {
                            tempElement.name = pathArray[pathArray.length - 2];
                        }
                        if (tempElement.name !== "_") {
                            // find the extension of the file
                            const extensionArray = tempElement.name.split('.');
                            tempElement.ext = extensionArray[extensionArray.length - 1];
                            if (tempElement.ext === 'png' || tempElement.ext === 'jpg' || tempElement.ext === 'jpeg') {
                                tempElement.thumbnailUrl = "http://localhost:5000/get/" + tempElement.id;
                            }

                            tempFileArray.push(tempElement);
                        }

                    });
                    console.log("file array", tempFileArray);
                    setFiles(tempFileArray);
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }, [path])
    const handleAction = useCallback((data) => {
        console.log('File action data:', data);
        if (data.id === "upload") {
            let input = document.createElement('input');
            input.type = 'file';
            input.onchange = _ => {
                let file = Array.from(input.files);
                console.log(files);
                console.log("file selected")
                let filename = file[0].name;
                uploadFile(file, filename);
            };
            input.click();
        }
        if (data.id === "create_folder") {
            console.log("create_folder")
            showModal();
        }
        if(data.id === "download_files"){
            const numFiles = data.state.selectedFiles.length;
            if(numFiles === 1){
                window.open("http://localhost:5000/download/" + data.state.selectedFiles[0].id);
            }
        }
        if (data.id === "open_files") {
            // remove the last / from the path
            if (data.payload.targetFile.isDir === true) {
                var newPath = "";
                if (data.payload.targetFile.id[data.payload.targetFile.id.length - 1] === "/") {
                    newPath = data.payload.targetFile.id.slice(0, -1);
                }
                else {
                    newPath = data.payload.targetFile.id;
                }
                console.log("new path", newPath)
                setPath(newPath);
            }
            else{
                window.open("http://localhost:5000/get/" + data.payload.targetFile.id );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path]);
    // split path into array of folders
    return (
        <div className='full-page'>
            <div className='chonky'>
                <Modal title="Create a Folder" open={isCreateFolderModalOpen}
                    footer={null}
                    onCancel={handleCancel}>
                    <CreateButtonModalForm onSubmit={handleCreateFolderFormSubmit} />
                </Modal>
                <FullFileBrowser
                    files={files}
                    folderChain={folders}
                    fileActions={fileActions}
                    onFileAction={handleAction}
                />
            </div>
            <Toaster />
        </div>

    );
}

export default HomePage;