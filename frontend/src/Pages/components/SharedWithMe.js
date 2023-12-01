import handleFileUpload from "../../utils/fileUpload";
import React, { useEffect, useCallback, useState } from "react";
import { setChonkyDefaults, FullFileBrowser } from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import "./css/HomePage.css";
import { customActions } from "../../utils/customFileActions";
import toast, { Toaster } from "react-hot-toast";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import fetchFiles from "../../utils/fetchFiles";
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
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import api from "../../utils/api";


setChonkyDefaults({ iconComponent: ChonkyIconFA });

/**
 * HomePage Component, shown after Login
 * @component
 */
const HomePage = () => {
  const [theme, setTheme] = React.useState('light');
  const [files, setFiles] = useState([]);
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
  const [selectedFiles, setSelectedFiles] = useState([])
  const { Header, Footer, Sider, Content } = Layout;
  const [sidebarSelection, setSidebarSelection] = useState([]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  const notifySuccess = (message) => {
    toast.success(message, {
      position: "bottom-center",
    });
  };
  const notifyFailure = (message) => {
    toast.error(message, {
      position: "bottom-center",
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
  const handlePictureModalCancel = () => {
    setIsPictureModalOpen(false);
  };

  const handleVideoModalCancel = () => {
    setIsVideoModalOpen(false);
  };
  const handleShareFolderFormSubmit = (values) => {
    setIsShareFolderModalOpen(false);
    console.log("values", selectedFiles)
    selectedFiles.forEach(async (file) => {
      var tempid = file.id;
      if(file.isDir)
      {
        tempid = file.id.slice(0, -1);
      }
      const shareRequest = {
        "path": tempid,
        "child_username": values.user,
        "permissions": values.permissions
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
  };

  const handleShareFolderModalCancel = () => {
    setIsShareFolderModalOpen(false);
  };

  const handleMenuClick = (e) => {
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
  const uploadFile = async (file, filename) => {
    const response = await handleFileUpload(file, path + "/" + filename);
    if (response.status === 200) {
      const tempElement = { id: path + "/" + filename, isDir: false, name: filename };
      setFiles((files) => [...files, tempElement]);
      notifySuccess(response.data.message);
    } else {
      notifyFailure(response.data.message);
    }
  };

  useEffect(() => {
    fetchUserInfo(setPath, setSharedPath, setFolders);
  }, []);
  useEffect(() => {
    if (path !== null && activeTab === "1")
      fetchFiles(path, setFolders, setFiles, setPictures);
  }, [path]);
  useEffect(() => {
    if (sharedpath !== null && activeTab === "2") {
      fetchSharedFiles(sharedpath, setSharedFolders, setSharedFiles, setSharedPictures);
      console.log("shared folder", sharedfolders)
      console.log("changed sharedpath");
      console.log("sharedfiles", sharedfiles)
    }
  }, [sharedpath, activeTab]);

  // useEffect(() => {
  //   if (sharedpath !== null) {
  //     fetchSharedFiles(sharedpath, setSharedFolders, setSharedFiles, setSharedPictures);
  //     console.log("sharefiles", sharedfiles)
  //   }
  // }, [sharedpath]);
  const handleAction = useCallback((data) => {
    console.log("File action data:", data);
    if (data.id === "upload") {
      let input = document.createElement("input");
      input.type = "file";
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
      console.log("download_files", data.state);
      const numFiles = data.state.selectedFiles.length;
      if (numFiles === 1) {
        console.log("downloading file", data.state.selectedFiles[0].id)
        var downloadpath = data.state.selectedFiles[0].id;
        downloadFile(downloadpath);
      }
    }
    if (data.id === "delete_files") {
      deleteFiles(data.state.selectedFiles, notifySuccess, notifyFailure)
        .then((successfulDeletes) => {
          const newFiles = files.filter((element) => {
            return !successfulDeletes.includes(element.id); // Only remove successfully deleted files
          });
          setFiles(newFiles);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (data.id === "share_files") {
      console.log("sharing files")
      setSelectedFiles(data.state.selectedFiles);
      setIsShareFolderModalOpen(true);
    }
    if (data.id === "open_files") {
      const targetFile = data.payload.targetFile;
      if (targetFile.isDir) {
        if(activeTab === "1")
        openDirectory(targetFile, setPath);
        else
        openDirectory(targetFile, setSharedPath);
      } else {
        const extensionArray = targetFile.id.split(".");
        const fileExtension = extensionArray[extensionArray.length - 1];
        if (
          fileExtension === "png" || fileExtension === "jpg" ||
          fileExtension === "jpeg" || fileExtension === "gif" ||
          fileExtension === "bmp" || fileExtension === "svg"
        ) {
          openImage(targetFile, pictures, setPictures, setIsPictureModalOpen);
        } else if (fileExtension === "mp4") {
          openVideo(targetFile, setActiveVideo, setIsVideoModalOpen);
        } else {
          openOtherFile(targetFile);
        }
      }
    }
    if (data.id === "change_selection") {
      console.log("change selection");
      setSidebarSelection(data.state.selectedFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, files, pictures]);
  const handleTabChange = (key) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }
  const menuStyle = theme === 'dark' ? {
    backgroundColor: '#424242',
    color: '#fff',
  } : {};
  return (
    <div className="full-page" data-theme={theme} >
      <div className="menu-container" style={menuStyle} >
        <h1>Data-Drive</h1>
        <Menu onClick={handleMenuClick} selectedKeys={[activeTab]} mode="inline" className="custom-menu" theme={theme}
          items={[
            {
              label: 'Home',
              key: '1',
              icon: <DesktopOutlined />,
              title: 'Home',
            },
            {
              label: 'Shared',
              key: 'Shared',
              icon: <i className="icon icon-share"></i>,
              title: 'Shared',
              children: [
                {
                  label: 'Shared with me',
                  key: '2',
                  icon: <i className="icon icon-share"></i>,
                  title: 'Shared with me',
                },
                {
                  label: 'Shared by me',
                  key: '3',
                  icon: <i className="icon icon-share"></i>,
                  title: 'Shared by me',
                },
              ],
            },
          ]}
        >
        </Menu>
      </div>
      {activeTab === "1" && (
        <div className="chonky">
          <Spin size="large" spinning={loading} tip="Loading..." className="centered-opaque-spinner">
            <CreateFolderModal open={isCreateFolderModalOpen} onCancel={handleCancel} onSubmit={handleCreateFolderFormSubmit} />
            <ShareFolderModal open={isShareFolderModalOpen} onCancel={handleShareFolderModalCancel} onSubmit={handleShareFolderFormSubmit} selectedFiles={selectedFiles} />
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
      )}
      {activeTab === "2" && (
        <div className="chonky">
          <Spin size="large" spinning={loading} tip="Loading..." className="centered-opaque-spinner">
            <CreateFolderModal open={isCreateFolderModalOpen} onCancel={handleCancel} onSubmit={handleCreateFolderFormSubmit} />
            <VideoModal open={isVideoModalOpen} onCancel={handleVideoModalCancel} activeVideo={activeVideo} />
            <PictureModal open={isPictureModalOpen} onCancel={handlePictureModalCancel} pictures={pictures} />
            <FullFileBrowser
              files={sharedfiles}
              folderChain={sharedfolders}
              onFileAction={handleAction}
              disableDragAndDrop={true}
              darkMode={theme === 'dark'}
            /></Spin>
        </div>
      )}
      <RightSidebar files={sidebarSelection} darkMode={theme} />
      <Toaster />
      <FooterBar theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
};

export default HomePage;
