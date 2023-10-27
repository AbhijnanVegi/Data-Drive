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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path]);
    useEffect(() => {
        // get user info by pinging /locahost:5000/auth/user
        axios.get('http://localhost:5000/auth/user', { withCredentials: true })
            .then(res => {
                if (res.data.username === null)
                    window.location.href = '/';
                else {
                    setUser(res.data.username);
                    setPath(res.data.username);
                }

            })
            .catch(err => {
                console.log(err);
            })
    }, []);
    useEffect(() => {
        const fileRequest = {
            path: path
        }
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
                    // split the path to get the name of the file, take the last element
                    const pathArray = element.path.split('/');
                    tempElement.name = pathArray[pathArray.length - 1];
                    if (tempElement.name === "") {
                        tempElement.name = pathArray[pathArray.length - 2];
                    }
                    tempFileArray.push(tempElement);
                });
                console.log("file array", tempFileArray);
                setFiles(tempFileArray);
            })
            .catch(err => {
                console.log(err);
            })
    }, [path])

    const folderChain = [{ id: path, name: path, isDir: true }];
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
                    folderChain={folderChain}
                    fileActions={fileActions}
                    onFileAction={handleAction}
                />
            </div>
            <Toaster />
        </div>

    );
}

export default HomePage;