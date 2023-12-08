import handleFileUpload from "../../utils/fileUpload";
import React, { useEffect, useCallback, useState, useRef } from "react";
import { Modal } from "antd";
import { setChonkyDefaults, FullFileBrowser } from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import "./css/HomePage.css";
import { customActions } from "../../utils/customFileActions";
import { Toaster } from "react-hot-toast";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import fetchFiles from "../../utils/fetchFiles";
import { fetchAdminData } from "../../utils/fetchAdminData";
import AdminTable from "../components/AdminTable";
import fetchUserInfo from "../../utils/fetchUserInfo";
import fetchSharedFiles from "../../utils/fetchSharedFiles";
import ShareFolderModal from "../components/shareFolderModal";
import { CreateFolderModal } from "../components/CreateFolderModal";
import { VideoModal } from "../components/VideoModal";
import { PictureModal } from "../components/PictureModal";
import { Spin } from "antd";
import { Layout } from 'antd';
import { RightSidebar } from "../components/RightSidebar";
import { fetchSharedByData } from "../../utils/fetchSharedByData";
import SharedByTable from "../components/SharedByTable";
import { fetchConfig } from "../../utils/fetchConfig";
import { AdminSidebar } from "../components/AdminPageSidebar";
import { useLocation } from "react-router-dom";
import { handleUnshare, handleShareFolderFormSubmit } from "../../utils/modalutils/shareutils";
import { handleMoveFileFormSubmit, handleCopyFileFormSubmit } from "../../utils/modalutils/copyandmoveutils";
import TopMenu from "../components/TopMenu";
import BottomMenu from "../components/BottomMenu";
import { downloadSelectedFiles, deleteSelectedFiles, handleFileOpen } from "../../utils/handleActions";
import { notifyFailure, notifySuccess } from "../../utils/toaster";
import { handleLogout } from "../../utils/logout";
import { handleAdminUpdate } from "../../utils/adminupdate";
import Markdown from 'react-markdown'
import { setTwoToneColor } from '@ant-design/icons';
import { TransferFileModal } from "../components/TransferFileModal";
import { handleCreateFolderFormSubmit } from "../../utils/modalutils/createfolder";
import { CustomFileBrowser } from "../components/CustomFileBrowser";
import { SharedFileBrowser } from "../components/SharedFileBrowser";
import handleFolderCreation from "../../utils/createFolder";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {wait} from "@testing-library/user-event/dist/utils";
import DeepSearchModal from "../components/DeepSearchModal";
import { Button } from "antd";


setChonkyDefaults({ iconComponent: ChonkyIconFA });

/**
 * HomePage Component, shown after Login
 * @component
 */
const HomePage = () => {
  const [files, setFiles] = useState([]);
  // const urlPathRef = useRef("/home");
  const [sharedfiles, setSharedFiles] = useState([]); // array of file names [file1, file2, file3
  const [path, setPath] = useState(null);
  const [sharedpath, setSharedPath] = useState(null);
  const [folders, setFolders] = useState([]); // array of folder names [folder1, folder2, folder3
  const [sharedfolders, setSharedFolders] = useState([]); // array of folder names [folder1, folder2, folder3
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [pictures, setPictures] = useState([]);
  const [sharedpictures, setSharedPictures] = useState([]);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [isShareFolderModalOpen, setIsShareFolderModalOpen] = useState(false);
  const [isCopyFilesModalOpen, setIsCopyFilesModalOpen] = useState(false);
  const [isMoveFilesModalOpen, setIsMoveFilesModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([])
  const [sidebarSelection, setSidebarSelection] = useState([]);
  const [user, setUser] = useState({});
  const [sharedByData, setSharedByData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState([]);
  const [config, setConfig] = useState({})
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [isDeepSearchModalOpen, setIsDeepSearchModalOpen] = useState(false);
  const [login, setLogin] = useState(false);

  // const [uploadedFiles, setUploadedFiles] = useState(0);
  let m_uploadedFiles = new Map();
  let m_totalFiles = new Map();
  let uploadFileReqId = 0;
  
  const showModal = () => {
    setIsCreateFolderModalOpen(true);
  };
  const handleCancel = () => {
    setIsCreateFolderModalOpen(false);
  };
  const handlePictureModalCancel = () => {
    setIsPictureModalOpen(false);
  };

  const handleVideoModalCancel = () => {
    setIsVideoModalOpen(false);
  };
  const handleShareFolderModalCancel = () => {
    setIsShareFolderModalOpen(false);
  };
  const handleCopyFilesModalCancel = () => {
    setIsCopyFilesModalOpen(false);
  }

  const handleMoveFilesModalCancel = () => {
    setIsMoveFilesModalOpen(false);
  }
  const handleMenuClick = (e) => {
    console.log("changing menu")
    if (e.key === "1")
      console.log("active Tab is 1")
    // window.location.href="/home"
    // console.log("urlPathRef is now", urlPathRef.current)
    setActiveTab(e.key);
    handleTabChange(e.key);
  };

  const fileActions = customActions;
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const uploadFile = async (file, filename, toastId, reqId) => {
    // if there are '/' in the filename, then we need to create the folders

    const _path = path;
    const _filename = filename;
    
    if (filename.includes("/")) {
      // recursively create the folders
      const folders = filename.split("/");
      // _filename = folders[folders.length - 1];
      // remove the filename from the folders array
      folders.pop();
      console.log("folders", folders)
      var folder = path

      for (var i = 0; i < folders.length; i++) {
        folder = folder + "/" + folders[i];
        console.log("folder", folder)
        const folderRequest = {
          path: folder,
        };

        const response = await handleFolderCreation(folderRequest);
        console.log(response);
      }

      // _path = folder;

    }
    console.log("path", _path)
    console.log("filename", _filename)
    console.log("file", file)
    
    const response = await handleFileUpload(file, _path + "/" + _filename);
    
    if (response.status === 200) {

      // notifySuccess(response.data.message);
      
      m_uploadedFiles[reqId]++;
    } else {
      // toast.dismiss(toastId);
      m_totalFiles[reqId]--;
      // notifyFailure(response.data.message);
    }

    if (m_totalFiles[reqId] !== 0){
      toast.update(toastId, {
        render: `Uploaded ${m_uploadedFiles[reqId]}/${m_totalFiles[reqId]} files`,
        progress: m_uploadedFiles[reqId] / m_totalFiles[reqId],
      });
    }
    if (m_uploadedFiles[reqId] === m_totalFiles[reqId]) {
      const tempElement = { id: _path + "/" + _filename, isDir: false, name: _filename, ext: _filename.split('.').pop() };
      setFiles((files) => [...files, tempElement]);
      setLastUploadedFile(tempElement);
      toast.dismiss(toastId);
      notifySuccess("Upload complete");
    }
  };
  const [rerender, setRerender] = useState(false);

  useEffect(() => {
    fetchUserInfo(setPath, setSharedPath, setFolders, setUser, setIsAdmin, setLogin);
  }, []);
  useEffect(() => {
    if (path !== null && activeTab === "1")
      fetchFiles(path, setFolders, setFiles, setPictures, login);
  }, [path, activeTab, lastUploadedFile, rerender, login]);
  useEffect(() => {
    if (sharedpath !== null && activeTab === "2") {
      fetchSharedFiles(sharedpath, user, setSharedFolders, setSharedFiles, setSharedPictures);
    }
  }, [sharedpath, activeTab]);

  useEffect(() => {
    if (activeTab === "3") {
      fetchSharedByData(setSharedByData);
    }
  }, [activeTab])

  const handleAction = useCallback((data) => {
    console.log("File action data:", data);
    if (data.id === "upload_folder") {
      let input = document.createElement("input");
      input.type = "file";
      input.webkitdirectory = true;
      
      const reqId = uploadFileReqId;
      uploadFileReqId++;
      m_uploadedFiles[reqId] = 0;
      m_totalFiles[reqId] = 0;
        
      input.onchange = (_) => {
        // log the file name
        let file = Array.from(input.files);
        const totalFiles = file.length;
        console.log("totalFiles", totalFiles);
        m_totalFiles[reqId] = totalFiles;
        
        let toastId = toast.info(`Uploading folder`, {
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          progress: 0,
          position: "bottom-center",
        });
        
        let ctr = 0;
        //loop through the files and upload them
        file.forEach((file) => {
          ctr++;
          let fie_upload = [file];
          let filename = fie_upload[0].webkitRelativePath;
          console.log("file", fie_upload);
          console.log("filename", filename);
          // setTimeout(() => { uploadFile(fie_upload, filename, toastId, reqId); }, ctr*2000+1000);
          uploadFile(fie_upload, filename, toastId, reqId);
        });
      };
      input.click();
      console.log("uploading folder");
    }
    if (data.id === "upload_file") {
      let input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      const reqId = uploadFileReqId;
      uploadFileReqId++;
      m_uploadedFiles[reqId] = 0;
      m_totalFiles[reqId] = 0;
      
      input.onchange = (_) => {
        // log the file name
        let file = Array.from(input.files);
        const totalFiles = file.length;
        console.log("totalFiles", totalFiles);
        m_totalFiles[reqId] = totalFiles;
        
        let toastId = toast.info(`Uploading files`, {
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          progress: 0,
          position: "bottom-center",
        });
        
        let ctr = 0;
        file.forEach((file) => {
          ctr++;
          // create an array of 1 file to upload
          let fie_upload = [file];
          let filename = fie_upload[0].name;
          console.log("file", fie_upload);
          console.log("filename", filename);
          // setTimeout(() => { uploadFile(fie_upload, filename, toastId, reqId); }, ctr*2000);
          uploadFile(fie_upload, filename, toastId, reqId);
        });
      };
      
      input.click();
      console.log("uploading file")
    }
    if (data.id === "create_folder") {
      console.log("create_folder");
      showModal();
    }
    if (data.id === "download_files") {
      downloadSelectedFiles(data, notifyFailure);
    }
    if (data.id === "delete_files") {
      deleteSelectedFiles(data, notifySuccess, notifyFailure, files, setFiles);
    }
    if (data.id === "share_files") {
      console.log("sharing files")
      setSelectedFiles(data.state.selectedFiles);
      setIsShareFolderModalOpen(true);
    }
    if (data.id === "copy_files") {
      console.log("copying files")
      setSelectedFiles(data.state.selectedFiles);
      setIsCopyFilesModalOpen(true);
    }
    if (data.id === "move_files") {
      console.log("moving files")
      setSelectedFiles(data.state.selectedFiles);
      setIsMoveFilesModalOpen(true);
    }
    if (data.id === "open_files") {
      handleFileOpen(data.payload.targetFile, activeTab, setPath, setSharedPath, path, sharedpath, pictures, setPictures, setIsPictureModalOpen, setActiveVideo, setIsVideoModalOpen, setMarkdown, setIsMarkdownModalOpen);
    }
    if (data.id === "change_selection") {
      console.log("change selection");
      setSidebarSelection(data.state.selectedFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, files, pictures, activeTab]);
  const handleTabChange = (key) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }
  useEffect(() => {
    console.log("adminData", adminData)
  }, [adminData])

  useEffect(() => {
    setTwoToneColor(isAdmin ? '#1677ff' : 'grey');
  }, [isAdmin]);
  const handleFetchAdminData = () => {
    fetchAdminData(setAdminData);
  }
  useEffect(() => {
    if (activeTab === "6") {
      fetchAdminData(setAdminData);
      fetchConfig(setConfig);
    }
  }, [activeTab])

  // useEffect(() => {
  //   // console.log(urlPath)
  //   console.log("urlPathRef useEffect called", urlPathRef.current)
  //   if (urlPathRef.current === "/home")
  //     setPath(user.username);
  //   else {
  //     setPath(urlPathRef.current.substring(1));
  //   }
  //   console.log("Effecting")
  // }, [urlPathRef.current])

  // const location = useLocation();
  // if (location.pathname !== "/home") {
  //   urlPathRef.current = location.pathname;
  //   console.log("location", location.pathname)
  // }


  return (
    <div className="full-page">
      <div className="menu-container">
        <h1>DataDrive</h1>
        {
          login && (
            <>
              <TopMenu handleMenuClick={handleMenuClick} activeTab={activeTab} setPath={setPath} user={user}/>
              <div className="user-info">
                <BottomMenu handleMenuClick={handleMenuClick} activeTab={activeTab} user={user} handleLogout={() => handleLogout(notifyFailure)} isAdmin={isAdmin} />
              </div>
            </>
          )
        }
      </div>
      {activeTab === "1" && (
        <>
          <DeepSearchModal open={isDeepSearchModalOpen} onClose={() => setIsDeepSearchModalOpen(false)} path={path} setPath={setPath} setIsDeepSearchModalOpen={setIsDeepSearchModalOpen} />
          <CustomFileBrowser
            loading={loading}
            isCreateFolderModalOpen={isCreateFolderModalOpen}
            handleCancel={handleCancel}
            handleCreateFolderFormSubmit={handleCreateFolderFormSubmit}
            path={path}
            setIsCreateFolderModalOpen={setIsCreateFolderModalOpen}
            setFiles={setFiles}
            isCopyFilesModalOpen={isCopyFilesModalOpen}
            setIsCopyFilesModalOpen={setIsCopyFilesModalOpen}
            handleCopyFilesModalCancel={handleCopyFilesModalCancel}
            handleCopyFileFormSubmit={handleCopyFileFormSubmit}
            selectedFiles={selectedFiles}
            isMoveFilesModalOpen={isMoveFilesModalOpen}
            setIsMoveFilesModalOpen={setIsMoveFilesModalOpen}
            handleMoveFilesModalCancel={handleMoveFilesModalCancel}
            handleMoveFileFormSubmit={handleMoveFileFormSubmit}
            rerender={rerender}
            setRerender={setRerender}
            isShareFolderModalOpen={isShareFolderModalOpen}
            handleShareFolderModalCancel={handleShareFolderModalCancel}
            handleShareFolderFormSubmit={handleShareFolderFormSubmit}
            isMarkdownModalOpen={isMarkdownModalOpen}
            setIsMarkdownModalOpen={setIsMarkdownModalOpen}
            markdown={markdown}
            isVideoModalOpen={isVideoModalOpen}
            handleVideoModalCancel={handleVideoModalCancel}
            activeVideo={activeVideo}
            isPictureModalOpen={isPictureModalOpen}
            handlePictureModalCancel={handlePictureModalCancel}
            pictures={pictures}
            files={files}
            folders={folders}
            fileActions={fileActions}
            handleAction={handleAction}
          />
          <RightSidebar files={sidebarSelection} />
          <Button className="deepsearchbutton" type="primary" onClick={() => setIsDeepSearchModalOpen(true)}>Deep Search</Button>
        </>
      )}
      {activeTab === "2" && (
        <>
          <DeepSearchModal open={isDeepSearchModalOpen} onClose={() => setIsDeepSearchModalOpen(false)} path={sharedpath} setPath={setSharedPath} setIsDeepSearchModalOpen={setIsDeepSearchModalOpen} />
          <SharedFileBrowser
            loading={loading}
            isCreateFolderModalOpen={isCreateFolderModalOpen}
            handleCancel={handleCancel}
            handleCreateFolderFormSubmit={handleCreateFolderFormSubmit}
            sharedfiles={sharedfiles}
            sharedfolders={sharedfolders}
            handleAction={handleAction}
            isVideoModalOpen={isVideoModalOpen}
            handleVideoModalCancel={handleVideoModalCancel}
            activeVideo={activeVideo}
            isPictureModalOpen={isPictureModalOpen}
            handlePictureModalCancel={handlePictureModalCancel}
            sharedpictures={sharedpictures}
            isMarkdownModalOpen={isMarkdownModalOpen}
            setIsMarkdownModalOpen={setIsMarkdownModalOpen}
            markdown={markdown}
          />
          <RightSidebar files={sidebarSelection} />
          <Button className="deepsearchbutton" type="primary" onClick={() => setIsDeepSearchModalOpen(true)}>Deep Search</Button>
        </>
      )}
      {
        activeTab === "3" && (
          <div className="sharedby">
            <SharedByTable data={sharedByData}
              onUnshare={(id, child_username) => handleUnshare(id, child_username, setSharedByData)} />
          </div>
        )
      }
      {
        activeTab === "6" && (
          <>
            <div className="sharedby">
              <AdminTable data={adminData}
                onUpdate={(record) => handleAdminUpdate(record, setAdminData)} />
            </div>
            <AdminSidebar config={config} />
          </>
        )
      }
      <Toaster />
      <ToastContainer />
    </div>
  );
};

export default HomePage;
