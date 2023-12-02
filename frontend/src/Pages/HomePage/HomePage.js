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
  const handleUnshare = (id, child_username) => {
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
      if (file.isDir) {
        tempid = tempid.slice(0, -1);
      }
      console.log("hello")
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

  const handleCopyFileFormSubmit = (values) => {
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

  const handleCopyFilesModalCancel = () => {
    setIsCopyFilesModalOpen(false);
  }

  const handleMoveFileFormSubmit = (values) => {
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
  useEffect(() => {
    console.log("lastUploadedFile", lastUploadedFile)
  }, [lastUploadedFile])

  useEffect(() => {
    fetchUserInfo(setPath, setSharedPath, setFolders, setUser, setIsAdmin);
  }, []);
  const [rerender, setRerender] = useState(false);
  useEffect(() => {
    if (path !== null && activeTab === "1")
      fetchFiles(path, setFolders, setFiles, setPictures);
  }, [path, activeTab, lastUploadedFile, rerender]);
  useEffect(() => {
    if (sharedpath !== null && activeTab === "2") {
      console.log("sharedpath inside useEffect", sharedpath)
      fetchSharedFiles(sharedpath, user, setSharedFolders, setSharedFiles, setSharedPictures);
      console.log("sharefiles is now lmao", sharedfiles)
    }
  }, [sharedpath, activeTab]);
  useEffect(() => {
    console.log("sharedpath just changed to", sharedpath)
  }, [sharedpath])
  useEffect(() => {
    if (activeTab === "3") {
      fetchSharedByData(setSharedByData);
    }
  }, [activeTab])

  useEffect(() => {
    console.log("sharedByData", sharedByData)
  }, [sharedByData])



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
        downloadFile(downloadpath, notifyFailure);
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
      const targetFile = data.payload.targetFile;
      console.log("active tab", activeTab)
      if (targetFile.isDir) {
        console.log("opening directory", activeTab)
        if (activeTab === "1")
          openDirectory(targetFile, setPath);
        else {
          console.log("opening shared folder")
          console.log("targetFile", targetFile)
          openDirectory(targetFile, setSharedPath);
          console.log("path is now", path)
          console.log("shared path is now", sharedpath)
        }
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
          console.log("opening video modal")
          openVideo(targetFile, setActiveVideo, setIsVideoModalOpen);
        }
        else if (fileExtension === "md") {
          console.log("opening markdown file")
          openMarkdown(targetFile, setMarkdown, setIsMarkdownModalOpen);
        }
        else {
          openOtherFile(targetFile);
        }
      }
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
    // Remove the user's data from local storage or cookies
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
    // Redirect the user to the login page
  };
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
  }

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
        <Menu
          style={{
            marginBottom: 'auto',
          }}
          onClick={handleMenuClick} selectedKeys={[activeTab]} mode="inline" className="custom-menu" theme={theme}
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
              icon: <ShareAltOutlined />,
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
        <div className="user-info">
          <Menu
            style={{
              marginBottom: 'auto',
            }}
            onClick={handleMenuClick} selectedKeys={[activeTab]} mode="inline" className="custom-menu" theme={theme}
            items={[
              {
                key: '4',
                icon:
                  <div style={{
                    display: 'flex',
                    fontSize: '12px',
                  }}>
                    <span style={{
                      marginRight: '20px',
                      color: 'black',
                    }}>
                      {`${formatBytes(user.storage_used)} / ${formatBytes(user.storage_quota)}`}
                    </span>
                    <Progress
                      size={[100, 10]}
                      status="active"
                      strokeColor={{ from: '#108ee9', to: '#87d068' }}
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                ,
                title: 'User',
                children: [
                  {
                    label: <span style={{ color: 'red' }}>Logout</span>,
                    key: '5',
                    icon: <LogoutOutlined style={{
                      color: 'red',
                    }} />,
                    title: 'Logout',
                    onClick: handleLogout,
                  },
                  {
                    label: <span style={{ color: isAdmin ? '#1677ff' : 'grey' }}>Admin Panel</span>,
                    key: '6',
                    icon: <IdcardTwoTone style={{
                      color: '#1677ff',
                    }} />,
                    title: 'Admin Panel',
                    disabled: !isAdmin,
                  }
                ],
              },
            ]}
          >
          </Menu>
        </div>
      </div>
      {activeTab === "1" && (
        <>
          <div className="chonky">
            <Spin size="large" spinning={loading} tip="Loading..." className="centered-opaque-spinner">
              <CreateFolderModal open={isCreateFolderModalOpen} onCancel={handleCancel} onSubmit={handleCreateFolderFormSubmit} />
              <TransferFileModal open={isCopyFilesModalOpen} onCancel={handleCopyFilesModalCancel} onSubmit={handleCopyFileFormSubmit} selectedFiles={selectedFiles} />
              <TransferFileModal open={isMoveFilesModalOpen} onCancel={handleMoveFilesModalCancel} onSubmit={handleMoveFileFormSubmit} selectedFiles={selectedFiles} />
              <ShareFolderModal open={isShareFolderModalOpen} onCancel={handleShareFolderModalCancel} onSubmit={handleShareFolderFormSubmit} selectedFiles={selectedFiles} />
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
            <SharedByTable data={sharedByData} onUnshare={handleUnshare} />
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
