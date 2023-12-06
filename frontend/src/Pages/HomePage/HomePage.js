import handleFileUpload from "../../utils/fileUpload";
import React, { useEffect, useCallback, useState, useRef } from "react";
import { Modal } from "antd";
import { Progress, Space } from 'antd';
import { setChonkyDefaults, FullFileBrowser } from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import "./css/HomePage.css";
import { customActions } from "../../utils/customFileActions";
import toast, { Toaster } from "react-hot-toast";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import fetchFiles from "../../utils/fetchFiles";
import { fetchAdminData } from "../../utils/fetchAdminData";
import AdminTable from "../components/AdminTable";
import fetchUserInfo from "../../utils/fetchUserInfo";
import handleFolderCreation from "../../utils/createFolder";
import fetchSharedFiles from "../../utils/fetchSharedFiles";
import ShareFolderModal from "../components/shareFolderModal";
import { CreateFolderModal } from "../components/CreateFolderModal";
import { FooterBar } from "../components/FooterBar";
import { VideoModal } from "../components/VideoModal";
import { PictureModal } from "../components/PictureModal";
import { downloadFile, deleteFiles, openDirectory, openImage, openVideo, openOtherFile } from "../../utils/fileActions";
import { Spin } from "antd";
import { Layout } from 'antd';
import { Menu } from 'antd';
import { RightSidebar } from "../components/RightSidebar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchSharedByData } from "../../utils/fetchSharedByData";
import SharedByTable from "../components/SharedByTable";
import { fetchConfig } from "../../utils/fetchConfig";
import { AdminSidebar } from "../components/AdminPageSidebar";
import { openMarkdown } from "../../utils/fileActions";
import { handleUnshare, handleShareFolderFormSubmit } from "../../utils/modalutils/shareutils";
import { handleMoveFileFormSubmit, handleCopyFileFormSubmit } from "../../utils/modalutils/copyandmoveutils";
import TopMenu from "../components/TopMenu";
import BottomMenu from "../components/BottomMenu";
import { downloadSelectedFiles, deleteSelectedFiles, handleFileOpen } from "../../utils/handleActions";
import { notifyFailure, notifySuccess } from "../../utils/toaster";

import Markdown from 'react-markdown'


import {
  AppstoreOutlined,
  ContainerOutlined,
  ShareAltOutlined,
  DesktopOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  IdcardTwoTone
} from '@ant-design/icons';
import { getTwoToneColor, setTwoToneColor } from '@ant-design/icons';
import api from "../../utils/api";
import { TransferFileModal } from "../components/TransferFileModal";
import { useLocation } from "react-router-dom";


setChonkyDefaults({ iconComponent: ChonkyIconFA });

/**
 * HomePage Component, shown after Login
 * @component
 */
const HomePage = () => {
  const [theme, setTheme] = React.useState('light');
  const [files, setFiles] = useState([]);
  // const [urlPath, setUrlPath] = useRef("/home");
  // make useRef
  const urlPathRef = useRef("/home");
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
  const { Header, Footer, Sider, Content } = Layout;
  const [sidebarSelection, setSidebarSelection] = useState([]);
  const [user, setUser] = useState({});
  const [sharedByData, setSharedByData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState([]);
  const [config, setConfig] = useState({})
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [markdown, setMarkdown] = useState('');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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
    console.log("urlPathRef is now", urlPathRef.current)
    setActiveTab(e.key);
    handleTabChange(e.key);
  };


  const handleCreateFolderFormSubmit = async (values) => {
    handleOk();
    const folderRequest = {
      path: path + "/" + values.foldername,
    };
    const response = await handleFolderCreation(folderRequest);
    console.log(response);
    if (response.status === 200) {
      const tempElement = { id: path + "/" + values.foldername, isDir: true, name: values.foldername };
      setFiles((files) => [...files, tempElement]);
      notifySuccess(response.data.message);
    } else {
      notifyFailure(response.data.message);
    }
  };
  const fileActions = customActions;
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const uploadFile = async (file, filename) => {
    const response = await handleFileUpload(file, path + "/" + filename);
    if (response.status === 200) {
      const tempElement = { id: path + "/" + filename, isDir: false, name: filename, ext: filename.split('.').pop() };
      setFiles((files) => [...files, tempElement]);
      setLastUploadedFile(tempElement);
      notifySuccess(response.data.message);
    } else {
      notifyFailure(response.data.message);
    }
  };
  const [rerender, setRerender] = useState(false);

  useEffect(() => {
    fetchUserInfo(setPath, setSharedPath, setFolders, setUser, setIsAdmin);
  }, []);
  useEffect(() => {
    if (path !== null && activeTab === "1")
      fetchFiles(path, setFolders, setFiles, setPictures);
  }, [path, activeTab, lastUploadedFile, rerender]);
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
    if (data.id === "upload") {
      let input = document.createElement("input");
      input.type = "file";
      // add support for multiple files
      input.onchange = (_) => {
        let file = Array.from(input.files);
        console.log(files);
        console.log("file selected");
        let filename = file[0].name;
        uploadFile(file, filename);
      };
      input.click();
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
  const menuStyle = theme === 'dark' ? {
    backgroundColor: '#424242',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100vh',
  } : {};
  const handleLogout = () => {
    console.log("inside handleLogout")
    api.post('/auth/logout', {
      withCredentials: true,
    })
      .then((response) => {
        console.log(response);
        window.location.href = "/";
      })
      .catch((error) => {
        console.log(error);
        notifyFailure(error.response.data.detail);
      });
  };
  useEffect(() => {
    setTwoToneColor(isAdmin ? '#1677ff' : 'grey');
  }, [isAdmin]);
  const handleFetchAdminData = () => {
    fetchAdminData(setAdminData);
  }
  const handleAdminUpdate = (record) => {
    console.log("record", record)
    const adminUpdateRequest = {
      "data": {
        "username": record.username,
        "permission": record.permission,
        "storage_quota": record.storage_quota,
      }
    }
    api.post("/admin/update_user", adminUpdateRequest)
      .then((response) => {
        console.log(response);
        handleFetchAdminData();
        notifySuccess(response.data.message);
      })
      .catch((error) => {
        console.log(error);
        notifyFailure(error.response.data.detail);
      });
  }
  useEffect(() => {
    if (activeTab === "6") {
      fetchAdminData(setAdminData);
      fetchConfig(setConfig);
    }
  }, [activeTab])

  useEffect(() => {
    // console.log(urlPath)
    console.log("urlPathRef useEffect called", urlPathRef.current)
    if (urlPathRef.current === "/home")
      setPath(user.username);
    else {
      setPath(urlPathRef.current.substring(1));
    }
    console.log("Effecting")
  }, [urlPathRef.current])

  const location = useLocation();
  if (location.pathname !== "/home") {
    urlPathRef.current = location.pathname;
    console.log("location", location.pathname)
  }


  return (
    <div className="full-page" data-theme={theme} >
      <div className="menu-container" style={menuStyle} >
        <h1>DataDrive</h1>
        <TopMenu handleMenuClick={handleMenuClick} activeTab={activeTab} />
        <div className="user-info">
          <BottomMenu handleMenuClick={handleMenuClick} activeTab={activeTab} theme={theme} user={user} handleLogout={handleLogout} isAdmin={isAdmin} />
        </div>
      </div>
      {activeTab === "1" && (
        <>
          <div className="chonky">
            <Spin size="large" spinning={loading} tip="Loading..." className="centered-opaque-spinner">
              <CreateFolderModal open={isCreateFolderModalOpen} onCancel={handleCancel} onSubmit={handleCreateFolderFormSubmit} />
              <TransferFileModal open={isCopyFilesModalOpen} onCancel={handleCopyFilesModalCancel}
                onSubmit={(values) => handleCopyFileFormSubmit(values, setIsCopyFilesModalOpen, selectedFiles)}
                selectedFiles={selectedFiles} />
              <TransferFileModal open={isMoveFilesModalOpen} onCancel={handleMoveFilesModalCancel}
                onSubmit={(values) => handleMoveFileFormSubmit(values, setIsMoveFilesModalOpen, selectedFiles, rerender, setRerender)}
                selectedFiles={selectedFiles} />
              <ShareFolderModal open={isShareFolderModalOpen}
                onCancel={handleShareFolderModalCancel}
                onSubmit={(values) => handleShareFolderFormSubmit(values, selectedFiles, setIsShareFolderModalOpen)} selectedFiles={selectedFiles} />
              <Modal
                width={1000}
                open={isMarkdownModalOpen}
                onCancel={() => setIsMarkdownModalOpen(false)}
                footer={null}
              >
                <Markdown>{markdown}</Markdown>
              </Modal>
              <VideoModal open={isVideoModalOpen} onCancel={handleVideoModalCancel} activeVideo={activeVideo} />
              <PictureModal open={isPictureModalOpen} onCancel={handlePictureModalCancel} pictures={pictures} />
              <FullFileBrowser
                files={files}
                folderChain={folders}
                fileActions={fileActions}
                onFileAction={handleAction}
                disableDragAndDrop={true}
                darkMode={theme === 'dark'}
              /></Spin>
          </div>
          <RightSidebar files={sidebarSelection} darkMode={theme} />
        </>
      )}
      {activeTab === "2" && (
        <>
          <div className="chonky">
            <Spin size="large" spinning={loading} tip="Loading..." className="centered-opaque-spinner">
              <CreateFolderModal open={isCreateFolderModalOpen} onCancel={handleCancel} onSubmit={handleCreateFolderFormSubmit} />
              <VideoModal open={isVideoModalOpen} onCancel={handleVideoModalCancel} activeVideo={activeVideo} />
              <PictureModal open={isPictureModalOpen} onCancel={handlePictureModalCancel} pictures={sharedpictures} />
              <Modal
                width={1000}
                open={isMarkdownModalOpen}
                onCancel={() => setIsMarkdownModalOpen(false)}
                footer={null}
              >
                <Markdown>{markdown}</Markdown>
              </Modal>
              <FullFileBrowser
                files={sharedfiles}
                folderChain={sharedfolders}
                onFileAction={handleAction}
                disableDragAndDrop={true}
                darkMode={theme === 'dark'}
              /></Spin>
          </div>
          <RightSidebar files={sidebarSelection} darkMode={theme} />
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
              <AdminTable data={adminData} onUpdate={handleAdminUpdate} />
            </div>
            <AdminSidebar config={config} />
          </>
        )
      }
      <Toaster />
    </div>
  );
};

export default HomePage;
